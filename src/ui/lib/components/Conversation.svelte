<script lang="ts">
	import { createConversation, getConversation, type Conversation as ConversationType } from '../../../data/conversation';

	let { id }: { id?: string } = $props();

	let title = $state('');
	let systemMessageText = $state('');
	let userMessageText = $state('');
	let conversation = $state<ConversationType | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	$effect(() => {
		if (id) {
			loading = true;
			error = null;
			conversation = null;
			
			(async () => {
				try {
					// Ensure database is set up before loading conversation
					const databaseUrl = localStorage.getItem('databaseUrl');
					if (!databaseUrl) {
						error = 'Database not configured';
						loading = false;
						return;
					}

					// Wait one tick to ensure setupDb in +layout.svelte's onMount has run
					await new Promise((resolve) => setTimeout(resolve, 0));

					const fetchedConversation = await getConversation({ id });
					if (fetchedConversation) {
						conversation = fetchedConversation;
					} else {
						error = 'Conversation not found';
					}
				} catch (err) {
					console.error('Failed to load conversation:', err);
					error = err instanceof Error ? err.message : 'Failed to load conversation';
				} finally {
					loading = false;
				}
			})();
		} else {
			conversation = null;
			loading = false;
			error = null;
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
			{#if loading}
				<div class="flex-1 flex items-center justify-center">
					<div class="text-gray-400">Loading conversation...</div>
				</div>
			{:else if error}
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

