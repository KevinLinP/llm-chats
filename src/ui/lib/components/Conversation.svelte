<script lang="ts">
	import { createConversation, getConversation } from '../../../data/conversation';
	import { listMessages, insertMessage } from '../../../data/message';
	import { sendMessage } from '../../../data/send-message';
	import { modelNamesById, defaultModelId } from '../../../data/open-router';
	import ConversationForm from './ConversationForm.svelte';
	import MessageList from './MessageList.svelte';
	import StreamingMessage from './StreamingMessage.svelte';
	import MessageInput from './MessageInput.svelte';
	import type { MessageWithMetadata } from '../../../data/message';

	let { id }: { id?: string } = $props();

	// Load conversation metadata and messages separately
	let conversation = $state<{ id: string; title: string; createdAt: Date; updatedAt: Date } | null>(null);
	let messages = $state<MessageWithMetadata[]>([]);
	let loadingConversation = $state(false);
	let loadingMessages = $state(false);
	let conversationError = $state<string | null>(null);
	let messagesError = $state<string | null>(null);

	// Streaming state
	let streamingMessage = $state<string | null>(null);
	let streamingModelName = $state<string>('');

	$effect(() => {
		if (id) {
			// Load conversation metadata
			loadingConversation = true;
			conversationError = null;

			const databaseUrl = localStorage.getItem('databaseUrl');
			if (!databaseUrl) {
				conversationError = 'Database not configured';
				loadingConversation = false;
				return;
			}

			// Wait one tick to ensure setupDb in +layout.svelte's onMount has run
			Promise.resolve().then(async () => {
				try {
					const conv = await getConversation({ id });
					if (conv) {
						conversation = conv;
					} else {
						conversationError = 'Conversation not found';
					}
				} catch (error) {
					console.error('Failed to load conversation:', error);
					conversationError = error instanceof Error ? error.message : 'Failed to load conversation';
				} finally {
					loadingConversation = false;
				}
			});

			// Load messages for this conversation
			loadingMessages = true;
			messagesError = null;

			Promise.resolve().then(async () => {
				try {
					const msgs = await listMessages({ conversationId: id });
					messages = msgs;
				} catch (error) {
					console.error('Failed to load messages:', error);
					messagesError = error instanceof Error ? error.message : 'Failed to load messages';
				} finally {
					loadingMessages = false;
				}
			});
		} else {
			conversation = null;
			messages = [];
			loadingConversation = false;
			loadingMessages = false;
			conversationError = null;
			messagesError = null;
		}
	});

	const handleFormSubmit = async (title: string, systemMessage: string, userMessage: string) => {
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

		// Create the conversation first
		const { id: conversationId } = await createConversation({
			title,
			timezone
		});

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

		// Navigate to the new conversation and trigger agent response
		// The effect will load the conversation, then we'll trigger the agent response
		window.location.href = `/${conversationId}`;
	};

	const handleSendMessage = async (userMessage: string, modelId: string) => {
		if (!id) return;

		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

		// Insert user message first
		const nextIndex = messages.length;
		await insertMessage({
			conversationId: id,
			index: nextIndex,
			message: {
				sender: 'user',
				text: userMessage
			},
			timezone
		});

		// Reload messages to include the new user message
		const updatedMessages = await listMessages({ conversationId: id });
		messages = updatedMessages;

		// Start streaming agent response
		streamingMessage = '';
		streamingModelName = modelNamesById[modelId] || modelId;

		try {
			await sendMessage({
				conversationId: id,
				userMessage,
				modelId,
				onStreamUpdate: (text) => {
					streamingMessage = text;
				},
				timezone
			});

			// Reload messages after agent message is inserted
			const finalMessages = await listMessages({ conversationId: id });
			messages = finalMessages;
		} catch (error) {
			console.error('Failed to send message:', error);
			// TODO: Show error to user
		} finally {
			streamingMessage = null;
			streamingModelName = '';
		}
	};
</script>

<main class="flex-1 overflow-y-auto h-full bg-gray-950 flex flex-col">
	<div class="max-w-4xl mx-auto p-6 flex-1 flex flex-col">
		{#if id}
			{#if conversationError || messagesError}
				<div class="flex-1 flex items-center justify-center">
					<div class="text-red-400">{conversationError || messagesError}</div>
				</div>
			{:else if conversation}
				<div class="flex-1 flex flex-col">
					<h1 class="text-2xl font-bold text-gray-100 mb-6">{conversation.title}</h1>
					<MessageList {messages} loading={loadingMessages} />
					{#if streamingMessage !== null}
						<div class="mt-4">
							<StreamingMessage text={streamingMessage} modelName={streamingModelName} />
						</div>
					{/if}
					<div class="mt-6">
						<MessageInput
							conversationId={id}
							onSend={handleSendMessage}
							streaming={streamingMessage !== null}
						/>
					</div>
				</div>
			{:else if loadingConversation || loadingMessages}
				<div class="flex-1 flex items-center justify-center">
					<div class="text-gray-400">Loading conversation...</div>
				</div>
			{/if}
		{:else}
			<ConversationForm onSubmit={handleFormSubmit} />
		{/if}
	</div>
</main>
