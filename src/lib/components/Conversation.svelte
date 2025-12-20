<script lang="ts">
	// TODO: Load current conversation messages
	// For now, using placeholder
	let messages = $state([
		{ id: '1', role: 'user', content: 'Hello, how are you?' },
		{ id: '2', role: 'assistant', content: 'I am doing well, thank you!' },
	]);
</script>

<main class="flex-1 overflow-y-auto h-full bg-gray-950">
	<div class="max-w-4xl mx-auto p-6">
		<div class="space-y-4">
			{#each messages as message (message.id)}
				<div
					class="rounded-lg p-4 {message.role === 'user'
						? 'bg-blue-900 ml-auto max-w-[80%]'
						: 'bg-gray-800 mr-auto max-w-[80%]'}"
				>
					<div class="text-sm font-medium mb-1 text-gray-200">
						{message.role === 'user' ? 'You' : 'Assistant'}
					</div>
					<div class="text-gray-100">{message.content}</div>
				</div>
			{/each}
		</div>
	</div>
</main>

