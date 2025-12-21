<script lang="ts">
	import { goto } from '$app/navigation';
	import { createConversation, getConversation, updateConversation, deleteConversation } from '../../../data/conversation';
	import { insertMessage } from '../../../data/message';
	import { defaultModelId } from '../../../data/open-router';
	import ConversationForm from './ConversationForm.svelte';
	import MessageList from './MessageList.svelte';
	import StreamingMessage from './StreamingMessage.svelte';
	import MessageInput from './MessageInput.svelte';
	import ConversationTitle from './ConversationTitle.svelte';
	import ConversationDeleteButton from './ConversationDeleteButton.svelte';
	import { useConversationLoader } from '../composables/use-conversation-loader.svelte';
	import { useMessageSender } from '../composables/use-message-sender.svelte';
	import { conversationStore } from '../stores/conversation.svelte';

	let { id }: { id?: string } = $props();

	// Use composables for data loading and message sending
	const loader = useConversationLoader({
		getId: () => id,
		onAutoTrigger: async (userMessage: string, modelId: string) => {
			await messageSender.triggerAgentResponse(userMessage, modelId);
		}
	});

	const messageSender = useMessageSender({
		getConversationId: () => id,
		onMessagesUpdate: (msgs) => {
			loader.reloadMessages();
		}
	});

	// Title editing state
	let updatingTitle = $state(false);

	// Delete state
	let deletingConversation = $state(false);

	const handleFormSubmit = async (title: string, systemMessage: string, userMessage: string, modelId: string) => {
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

		// Create the conversation first
		const { id: conversationId } = await createConversation({
			title,
			timezone
		});

		// Store the modelId in sessionStorage so it can be used when auto-triggering the agent response
		sessionStorage.setItem(`conversation-${conversationId}-modelId`, modelId);

		// Then insert the messages with indices
		await Promise.all([
			insertMessage({
				conversationId,
				index: 0,
				message: {
					sender: 'system',
					text: systemMessage
				},
				timezone
			}),
			insertMessage({
				conversationId,
				index: 1,
				message: {
					sender: 'user',
					text: userMessage
				},
				timezone
			})
		]);

		// Navigate to the new conversation using SvelteKit navigation (no full page reload)
		await goto(`/${conversationId}`, { noScroll: true });
	};

	const handleSendMessage = async (userMessage: string, modelId: string) => {
		if (!id || !loader.conversation) return;
		await messageSender.sendMessage(userMessage, modelId, loader.messages);
	};

	const handleTitleUpdate = async (newTitle: string) => {
		if (!id || !loader.conversation) return;

		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

		try {
			await updateConversation({
				id,
				title: newTitle,
				timezone
			});

			// Reload conversation to get updated timestamp
			const updated = await getConversation({ id });
			if (updated) {
				// Update the store as well
				conversationStore.updateConversation(updated);
				// Reload to update the conversation in the loader
				await loader.reloadConversation();
			}
		} catch (error) {
			console.error('Failed to update conversation title:', error);
			// TODO: Show error to user
			throw error;
		}
	};

	const handleDelete = async () => {
		if (!id || !loader.conversation) return;

		deletingConversation = true;
		try {
			await deleteConversation({ id });
			// Remove from store if it exists
			conversationStore.removeConversation(id);
			// Navigate to root
			await goto('/', { noScroll: true });
		} catch (error) {
			console.error('Failed to delete conversation:', error);
			// TODO: Show error to user
		} finally {
			deletingConversation = false;
		}
	};
</script>

<main class="flex-1 overflow-y-auto h-full bg-gray-950 flex flex-col">
	<div class="max-w-4xl mx-auto p-6 flex-1 flex flex-col w-full">
		{#if id}
			{#if loader.conversationError || loader.messagesError}
				<div class="flex-1 flex items-center justify-center">
					<div class="text-red-400">{loader.conversationError || loader.messagesError}</div>
				</div>
			{:else if loader.conversation}
				<div class="flex-1 flex flex-col w-full">
					<div class="mb-6 flex items-center gap-4">
						<ConversationTitle
							title={loader.conversation.title}
							onUpdate={handleTitleUpdate}
							bind:updating={updatingTitle}
						/>
						<ConversationDeleteButton
							onDelete={handleDelete}
							deleting={deletingConversation}
							title={loader.conversation.title}
						/>
					</div>
					<MessageList messages={loader.messages} loading={loader.loadingMessages} />
					{#if messageSender.streamingMessage !== null}
						<div class="mt-4">
							<StreamingMessage text={messageSender.streamingMessage} modelName={messageSender.streamingModelName} />
						</div>
					{/if}
					<div class="mt-6">
						<MessageInput
							conversationId={id}
							onSend={handleSendMessage}
							streaming={messageSender.isStreaming}
						/>
					</div>
				</div>
			{:else if loader.loadingConversation || loader.loadingMessages}
				<div class="flex-1 flex items-center justify-center">
					<div class="text-gray-400">Loading conversation...</div>
				</div>
			{/if}
		{:else}
			<ConversationForm onSubmit={handleFormSubmit} />
		{/if}
	</div>
</main>
