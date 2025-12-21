<script lang="ts">
	import MarkdownRenderer from './MarkdownRenderer.svelte';
	import type { MessageWithMetadata } from '../../../data/message';

	let { message }: { message: MessageWithMetadata } = $props();
</script>

{#if message.sender === 'system'}
	<div class="text-sm text-gray-600 mb-2">
		system: {message.text}
	</div>
{:else if message.sender === 'user'}
	<div class="flex justify-end mb-4">
		<div class="bg-gray-800 text-gray-200 rounded-lg p-4 max-w-2xl">
			{message.text}
		</div>
	</div>
{:else}
	<div class="mb-6">
		<MarkdownRenderer content={message.text} citations={message.citations} messageId={message.id} />
		{#if message.citations}
			<ul class="list-none mt-4">
				{#each Object.entries(message.citations) as [number, url]}
					<li id="citation-{message.id}-{number}">
						<span class="text-gray-300">{number}.</span> <a href={url} class="text-gray-400" target="_blank">{url}</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

