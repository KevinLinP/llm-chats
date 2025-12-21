<script lang="ts">
	import MarkdownRenderer from './MarkdownRenderer.svelte';
	let { text, modelName }: { text: string | null; modelName: string } = $props();
</script>

{#if text !== null}
	<div class="bg-gray-800 rounded-lg p-4">
		<div class="text-sm font-medium text-gray-400 mb-2 uppercase">
			agent ({modelName})
		</div>
		<MarkdownRenderer content={text} />
	</div>
{/if}

