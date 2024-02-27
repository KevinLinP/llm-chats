<script>
	import { getContext } from 'svelte';
	import { deleteDoc } from 'firebase/firestore';
	import OpenAI from 'openai';

	import ThreadTitle from './ThreadTitle.svelte';
	import {
		currentThreadRefStore,
		threadStore,
		// plainStore,
		messagesStore,
		streamingMessageStore,
		errorStore
	} from '$lib/stores/thread-stores.js';
	import ThreadMessageInput from './ThreadMessageInput.svelte';
	import ThreadModelSelector from './ThreadModelSelector.svelte';

	// TODO: break this down into smaller files

	$: currentThreadRef = $currentThreadRefStore;
	$: thread = $threadStore;

	const openAiConfig = getContext('openAiConfig');

	// const availableModels = [
	// 	{
	// 		id: 'openai-gpt-3.5-turbo',
	// 		label: 'OpenAI GPT-3.5 Turbo',
	// 		completionCreateOptions: {
	// 			model: 'gpt-3.5-turbo-0125'
	// 		}
	// 	},
	// 	{
	// 		id: 'openai-gpt-4-turbo',
	// 		label: 'OpenAI GPT-4 Turbo',
	// 		completionCreateOptions: {
	// 			model: 'gpt-4-0125-preview'
	// 		}
	// 	},
	// 	{
	// 		id: 'local',
	// 		label: 'local',
	// 		completionCreateOptions: {}
	// 	}
	// ];

	// $: selectedModelId = $plainStore?.selectedModelId || availableModels[0].id;
	// $: selectedModel = availableModels.find((model) => model.id === selectedModelId);

	// let openai = null;
	// $: {
	// 	if (selectedModel) {
	// 		const options = openAiOptions.find((option) => option.id === selectedModel.id)?.options;
	// 		if (options) {
	// 			openai = new OpenAI({ dangerouslyAllowBrowser: true, ...options });
	// 		}
	// 	}
	// }

	const handleDestroy = () => {
		currentThreadRefStore.set(null);
		deleteDoc(currentThreadRef);
	};
</script>

{#if thread}
	<div class="mb-3 d-flex flex-direction-row align-items-end">
		<div class="flex-grow-1">
			<ThreadTitle />
		</div>

		<button class="btn btn-text" on:click={handleDestroy}>delete</button>
	</div>

	{#if $messagesStore.length}
		<div class="pe-5">
			{#each $messagesStore as message, i (i)}
				<p class="mb-3">
					{message.role}
					<br />
					{message.content}
				</p>
			{/each}
		</div>
	{/if}

	{#if $streamingMessageStore}
		<div class="pe-5">
			<p class="mb-3">
				assistant
				<br />
				{$streamingMessageStore}
			</p>
			<p class="text-danger">{$errorStore}</p>
		</div>
	{:else}
		<div class="d-flex flex-direction-row align-items-end">
			<div class="flex-grow-1">
				<ThreadMessageInput />
			</div>
		</div>

		<div class="mt-2 d-flex flex-direction-row justify-content-end">
			<div>
				<ThreadModelSelector />
				<!-- <select class="form-select model-select" bind:value={selectedModelId}>
					{#each availableModels as { id, label }}
						<option value={id}>{label}</option>
					{/each}
				</select> -->
			</div>
		</div>
	{/if}
{/if}
