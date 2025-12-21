<script lang="ts">
	import MarkdownRenderer from './MarkdownRenderer.svelte';
	import type { MessageWithMetadata } from '../../../data/message';

	let { message }: { message: MessageWithMetadata } = $props();
</script>

{#if message.sender === 'system'}
	<div class="text-sm text-gray-500 mb-2">
		<MarkdownRenderer content={`system: ${message.text}`} />
	</div>
{:else if message.sender === 'user'}
	<div class="flex justify-end mb-4">
		<div class="bg-gray-800 rounded-lg p-4 max-w-2xl">
			<MarkdownRenderer content={message.text} />
		</div>
	</div>
{:else}
	<div class="mb-6">
		<MarkdownRenderer content={message.text} />
	</div>
{/if}

