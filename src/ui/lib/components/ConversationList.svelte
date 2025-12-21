<script lang="ts">
	import { onMount } from 'svelte';
	import { listConversations } from '../../../data/conversation';

	let conversations = $state<Awaited<ReturnType<typeof listConversations>>>([]);
	let loading = $state(true);

	onMount(async () => {
		// Ensure database is set up before loading conversations
		// The layout's onMount should run first, but we check for the database URL
		// and wait a tick to ensure setupDb has been called
		const databaseUrl = localStorage.getItem('databaseUrl');
		if (!databaseUrl) {
			loading = false;
			return;
		}

		// Wait one tick to ensure setupDb in +layout.svelte's onMount has run
		await new Promise((resolve) => setTimeout(resolve, 0));

		try {
			const result = await listConversations();
			conversations = result;
		} catch (error) {
			console.error('Failed to load conversations:', error);
		} finally {
			loading = false;
		}
	});
</script>

<aside class="w-64 border-r border-gray-700 bg-gray-900 overflow-y-auto h-full">
	<div class="p-4">
		<h2 class="text-lg font-semibold mb-4 text-gray-100">Conversations</h2>
		<nav class="space-y-1">
			{#if loading}
				{#each Array(20) as _, i}
					<div
						class="block px-3 py-2 rounded-md text-sm animate-pulse"
					>
						<div class="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
						<div class="h-3 bg-gray-800 rounded w-1/2"></div>
					</div>
				{/each}
			{:else}
				{#each conversations as conversation (conversation.id)}
					<a
						href="/{conversation.id}"
						class="block px-3 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
					>
						<div class="font-medium text-gray-100">{conversation.title}</div>
						<div class="text-xs text-gray-400 mt-1">
							{conversation.updatedAt.toLocaleDateString()}
						</div>
					</a>
				{/each}
			{/if}
		</nav>
	</div>
</aside>

