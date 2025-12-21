<script lang="ts">
	import { listConversations } from '../../../data/conversation';

	let conversations = $state<Awaited<ReturnType<typeof listConversations>>>([]);

	$effect(() => {
		listConversations().then((result) => {
			conversations = result;
		});
	});
</script>

<aside class="w-64 border-r border-gray-700 bg-gray-900 overflow-y-auto h-full">
	<div class="p-4">
		<h2 class="text-lg font-semibold mb-4 text-gray-100">Conversations</h2>
		<nav class="space-y-1">
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
		</nav>
	</div>
</aside>

