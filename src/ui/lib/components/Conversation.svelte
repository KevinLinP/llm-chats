<script lang="ts">
	import { createConversation } from '../../../data/conversation';
	import { conversationStore } from '../stores/conversation.svelte';

	let { id }: { id?: string } = $props();

	let title = $state('');
	let systemMessageText = $state('');
	let userMessageText = $state('');

	// Get summary immediately from store (if available)
	const summary = $derived(id ? conversationStore.getSummary(id) : null);
	
	// Get full conversation from store (if already loaded)
	// Track version to ensure reactivity when Map is mutated
	const conversation = $derived.by(() => {
		if (!id) return null;
		// Access version to create reactive dependency
		void conversationStore.fullConversationsVersion;
		return conversationStore.fullConversations.get(id) ?? null;
	});
	
	// Get loading and error state from store
	const isLoadingFullConversation = $derived(id ? conversationStore.isLoadingConversation(id) : false);
	const error = $derived(id ? conversationStore.getConversationError(id) : null);

	$effect(() => {
		if (id) {
			// If we don't have the full conversation yet, load it
			if (!conversationStore.fullConversations.has(id) && !conversationStore.isLoadingConversation(id)) {
				conversationStore.loadFullConversation(id).catch(() => {
					// Error is already handled in the store
				});
			}
		}
	});

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault();

		console.log('handleSubmit', title, systemMessageText, userMessageText);
		
		if (title.trim().length > 0 && systemMessageText.trim().length > 0 && userMessageText.trim().length > 0) {
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			
			await createConversation({
				title: title.trim(),
				systemMessage: {
					sender: 'system',
					text: systemMessageText.trim()
				},
				userMessage: {
					sender: 'user',
					text: userMessageText.trim()
				},
				timezone
			});
		}
	};
</script>

<main class="flex-1 overflow-y-auto h-full bg-gray-950 flex flex-col">
	<div class="max-w-4xl mx-auto p-6 flex-1 flex flex-col">
		{#if id}
			{#if error}
				<div class="flex-1 flex items-center justify-center">
					<div class="text-red-400">{error}</div>
				</div>
			{:else if conversation}
				<div class="flex-1 flex flex-col">
					<h1 class="text-2xl font-bold text-gray-100 mb-6">{conversation.title}</h1>
					<div class="space-y-4 flex-1 overflow-y-auto">
						{#each conversation.parts as part (part)}
							<div class="bg-gray-800 rounded-lg p-4">
								<div class="text-sm font-medium text-gray-400 mb-2 uppercase">
									{part.sender}
								</div>
								<div class="text-gray-100 whitespace-pre-wrap">{part.text}</div>
							</div>
						{/each}
					</div>
				</div>
			{:else if summary}
				<div class="flex-1 flex flex-col">
					<h1 class="text-2xl font-bold text-gray-100 mb-6">{summary.title}</h1>
					{#if isLoadingFullConversation}
						<div class="flex-1 flex items-center justify-center">
							<div class="text-gray-400">Loading conversation...</div>
						</div>
					{/if}
				</div>
			{:else if isLoadingFullConversation}
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

