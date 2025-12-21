<script lang="ts">
	let { text, modelName }: { text: string | null; modelName: string } = $props();
</script>

{#if text !== null}
	<div class="bg-gray-800 rounded-lg p-4">
		<div class="text-sm font-medium text-gray-400 mb-2 uppercase">
			agent ({modelName})
		</div>
		<div class="text-gray-100 whitespace-pre-wrap">{text}</div>
	</div>
{/if}

