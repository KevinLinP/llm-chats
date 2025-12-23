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
		<div class="relative">
			<MarkdownRenderer content={message.text} citations={message.citations} messageId={message.id} />
			{#if message.modelId || message.tokenUsage}
				<div class="text-xs text-gray-500 mt-2 text-right">
					{#if message.modelId}
						<span>{message.modelId}</span>
					{/if}
					{#if message.tokenUsage && (message.tokenUsage.input || message.tokenUsage.reasoning || message.tokenUsage.output)}
						{#if message.modelId}
							<span class="mx-1">•</span>
						{/if}
						<span>
							{#if message.tokenUsage.input}
								in: {message.tokenUsage.input.toLocaleString()}
							{/if}
							{#if message.tokenUsage.reasoning}
								{#if message.tokenUsage.input}
									<span class="mx-1">•</span>
								{/if}
								reasoning: {message.tokenUsage.reasoning.toLocaleString()}
							{/if}
							{#if message.tokenUsage.output}
								{#if message.tokenUsage.input || message.tokenUsage.reasoning}
									<span class="mx-1">•</span>
								{/if}
								out: {message.tokenUsage.output.toLocaleString()}
							{/if}
						</span>
					{/if}
				</div>
			{/if}
		</div>
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

