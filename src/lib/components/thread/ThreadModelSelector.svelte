<script>
	import { selectedModelIdStore, availableModels } from '$lib/stores/model-stores.js';
</script>

<select class="form-select model-select" bind:value={$selectedModelIdStore}>
	{#each availableModels as { id, label }}
		<option value={id}>{label}</option>
	{/each}
</select>

<style>
	.model-select {
		border: 0;
	}
</style>
