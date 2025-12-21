<script lang="ts">
	import { createConversation, getConversation } from '../../../data/conversation';
	import { listMessages, insertMessage, type MessageWithMetadata } from '../../../data/message';
	import { conversationStore } from '../stores/conversation.svelte';

	let { id }: { id?: string } = $props();

	let title = $state('');
	let systemMessageText = $state('');
	let userMessageText = $state('');

	// Get summary immediately from store (if available)
	const summary = $derived(id ? conversationStore.getSummary(id) : null);
	
	// Load conversation metadata and messages separately
	let conversation = $state<{ id: string; title: string; createdAt: Date; updatedAt: Date } | null>(null);
	let messages = $state<MessageWithMetadata[]>([]);
	let loadingConversation = $state(false);
	let loadingMessages = $state(false);
	let conversationError = $state<string | null>(null);
	let messagesError = $state<string | null>(null);

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

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault();

		console.log('handleSubmit', title, systemMessageText, userMessageText);
		
		if (title.trim().length > 0 && systemMessageText.trim().length > 0 && userMessageText.trim().length > 0) {
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			
			// Create the conversation first
			const { id: conversationId } = await createConversation({
				title: title.trim(),
				timezone
			});
			
			// Then insert the messages with indices
			await Promise.all([
				insertMessage({
					conversationId,
					index: 0,
					message: {
						sender: 'system',
						text: systemMessageText.trim()
					},
					timezone
				}),
				insertMessage({
					conversationId,
					index: 1,
					message: {
						sender: 'user',
						text: userMessageText.trim()
					},
					timezone
				})
			]);
			
			// Navigate to the new conversation
			window.location.href = `/${conversationId}`;
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
					{#if loadingMessages}
						<div class="flex-1 flex items-center justify-center">
							<div class="text-gray-400">Loading messages...</div>
						</div>
					{:else}
						<div class="space-y-4 flex-1 overflow-y-auto">
							{#each messages as message (message.id)}
								<div class="bg-gray-800 rounded-lg p-4">
									<div class="text-sm font-medium text-gray-400 mb-2 uppercase">
										{message.sender}
									</div>
									<div class="text-gray-100 whitespace-pre-wrap">{message.text}</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else if summary}
				<div class="flex-1 flex flex-col">
					<h1 class="text-2xl font-bold text-gray-100 mb-6">{summary.title}</h1>
					{#if loadingConversation || loadingMessages}
						<div class="flex-1 flex items-center justify-center">
							<div class="text-gray-400">Loading conversation...</div>
						</div>
					{/if}
				</div>
			{:else if loadingConversation || loadingMessages}
				<div class="flex-1 flex items-center justify-center">
					<div class="text-gray-400">Loading conversation...</div>
				</div>
			{/if}
		{:else}
			<form onsubmit={handleSubmit} class="flex-1 flex flex-col">
				<div class="space-y-4 mb-6">
					<div>
						<label for="title" class="block text-sm font-medium text-gray-300 mb-2">
							Title
						</label>
						<input
							id="title"
							type="text"
							bind:value={title}
							placeholder="Enter conversation title"
							class="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					
					<div>
						<label for="systemMessage" class="block text-sm font-medium text-gray-300 mb-2">
							System Message
						</label>
						<textarea
							id="systemMessage"
							bind:value={systemMessageText}
							placeholder="Enter system message"
							rows="3"
							class="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
						></textarea>
					</div>
				</div>

				<div class="mt-auto pt-6">
					<label for="userMessage" class="block text-sm font-medium text-gray-300 mb-2">
						User Message
					</label>
					<textarea
						id="userMessage"
						bind:value={userMessageText}
						placeholder="Enter your message"
						rows="3"
						class="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
					></textarea>
					<button
						type="submit"
						class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
					>
						Submit
					</button>
				</div>
			</form>
		{/if}
	</div>
</main>

