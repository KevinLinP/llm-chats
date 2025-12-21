<script lang="ts">
	import { onMount } from 'svelte';
	import { conversationStore } from '../stores/conversation.svelte';

	onMount(() => {
		conversationStore.loadSummaries();
	});
</script>

<aside class="w-64 border-r border-gray-700 bg-gray-900 overflow-y-auto h-full">
	<div class="p-4">
		<h2 class="text-lg font-semibold mb-4 text-gray-100">Conversations</h2>
		<nav class="space-y-1">
			{#if conversationStore.loading}
				{#each Array(20) as _, i}
					<div
						class="block px-3 py-2 rounded-md text-sm animate-pulse"
					>
						<div class="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
						<div class="h-3 bg-gray-800 rounded w-1/2"></div>
					</div>
				{/each}
			{:else}
				{#each conversationStore.summaries as conversation (conversation.id)}
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

