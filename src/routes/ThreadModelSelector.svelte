<script>
	import { selectedModelIdStore, availableModels } from './model-stores.js';
</script>

<select class="form-select model-select" bind:value={$selectedModelIdStore}>
	{#each availableModels as { id, label }}
		<option value={id}>{label}</option>
	{/each}
</select>

<style lang="scss">
	.model-select {
		border: 0;
	}
</style>
