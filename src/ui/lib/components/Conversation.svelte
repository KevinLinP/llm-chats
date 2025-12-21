<script lang="ts">
	import { goto } from '$app/navigation';
	import { createConversation, getConversation, updateConversation, deleteConversation } from '../../../data/conversation';
	import { listMessages, insertMessage } from '../../../data/message';
	import { sendMessage } from '../../../data/send-message';
	import { modelNamesById, defaultModelId } from '../../../data/open-router';
	import ConversationForm from './ConversationForm.svelte';
	import MessageList from './MessageList.svelte';
	import StreamingMessage from './StreamingMessage.svelte';
	import MessageInput from './MessageInput.svelte';
	import type { MessageWithMetadata } from '../../../data/message';
	import { conversationStore } from '../stores/conversation.svelte';

	let { id }: { id?: string } = $props();

	// Autofocus action for title input
	function autofocus(node: HTMLInputElement) {
		node.focus();
		node.select();
	}

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

	// Title editing state
	let isEditingTitle = $state(false);
	let editedTitle = $state('');
	let updatingTitle = $state(false);

	// Delete state
	let deletingConversation = $state(false);

	const triggerAgentResponse = async (userMessage: string, modelId: string) => {
		if (!id) return;

		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
					
					// Auto-trigger agent response for new conversations (only system + user messages, no assistant yet)
					if (msgs.length === 2 && msgs[0]?.sender === 'system' && msgs[1]?.sender === 'user' && msgs.every(m => m.sender !== 'assistant')) {
						const userMessage = msgs[1].text;
						// Get the modelId from sessionStorage if it was set during form submission, otherwise use default
						const storedModelId = sessionStorage.getItem(`conversation-${id}-modelId`);
						const modelIdToUse = storedModelId || defaultModelId;
						// Clean up the sessionStorage entry after using it
						if (storedModelId) {
							sessionStorage.removeItem(`conversation-${id}-modelId`);
						}
						await triggerAgentResponse(userMessage, modelIdToUse);
					}
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

		// Trigger agent response
		await triggerAgentResponse(userMessage, modelId);
	};

	const handleTitleEdit = () => {
		if (!conversation) return;
		isEditingTitle = true;
		editedTitle = conversation.title;
	};

	const handleTitleSave = async () => {
		if (!conversation || !id) return;
		
		const trimmedTitle = editedTitle.trim();
		if (!trimmedTitle || trimmedTitle === conversation.title) {
			isEditingTitle = false;
			return;
		}

		updatingTitle = true;
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

		try {
			await updateConversation({
				id,
				title: trimmedTitle,
				timezone
			});

			// Reload conversation to get updated timestamp
			const updated = await getConversation({ id });
			if (updated) {
				conversation = updated;
				// Update the store as well
				conversationStore.updateConversation(updated);
			}
		} catch (error) {
			console.error('Failed to update conversation title:', error);
			// TODO: Show error to user
		} finally {
			updatingTitle = false;
			isEditingTitle = false;
		}
	};

	const handleTitleCancel = () => {
		isEditingTitle = false;
		editedTitle = '';
	};

	const handleDelete = async () => {
		if (!id || !conversation) return;

		if (!confirm(`Are you sure you want to delete "${conversation.title}"?`)) {
			return;
		}

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
	<div class="max-w-4xl mx-auto p-6 flex-1 flex flex-col">
		{#if id}
			{#if conversationError || messagesError}
				<div class="flex-1 flex items-center justify-center">
					<div class="text-red-400">{conversationError || messagesError}</div>
				</div>
			{:else if conversation}
				<div class="flex-1 flex flex-col">
					<div class="mb-6 flex items-center gap-4">
						{#if isEditingTitle}
							<input
								type="text"
								bind:value={editedTitle}
								disabled={updatingTitle}
								onkeydown={(e) => {
									if (e.key === 'Enter') {
										handleTitleSave();
									} else if (e.key === 'Escape') {
										handleTitleCancel();
									}
								}}
								onblur={handleTitleSave}
								class="flex-1 text-2xl font-bold text-gray-100 bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								use:autofocus
							/>
						{:else}
							<button
								type="button"
								onclick={handleTitleEdit}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										handleTitleEdit();
									}
								}}
								class="flex-1 text-2xl font-bold text-gray-100 cursor-pointer hover:text-gray-200 transition-colors text-left"
								title="Click to edit title"
							>
								{conversation.title}
							</button>
						{/if}
						<button
							type="button"
							onclick={handleDelete}
							disabled={deletingConversation}
							class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							title="Delete conversation"
						>
							Delete
						</button>
					</div>
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
