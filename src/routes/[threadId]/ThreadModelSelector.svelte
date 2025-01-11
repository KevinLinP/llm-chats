<script>
	import { selectedModelIdStore, availableModels } from '$lib/stores/model-stores.js';
</script>

<select class="dark:bg-gray-800 border-0" bind:value={$selectedModelIdStore}>
	{#each availableModels as { id, label }}
		<option value={id}>{label}</option>
	{/each}
</select>