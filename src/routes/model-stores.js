import { writable, derived } from 'svelte/store';
import { plainStore } from './thread-stores.js';

export const availableModels = [
	{
		id: 'openai-gpt-4-turbo',
		label: 'OpenAI GPT-4 Turbo',
		completionCreateOptions: {
			model: 'gpt-4-0125-preview'
		}
	},
	{
		id: 'openai-gpt-3.5-turbo',
		label: 'OpenAI GPT-3.5 Turbo',
		completionCreateOptions: {
			model: 'gpt-3.5-turbo-0125'
		}
	},
	{
		id: 'local',
		label: 'local',
		completionCreateOptions: {}
	}
];

export const selectedModelIdStore = writable(availableModels[0].id);

plainStore.subscribe((plain) => {
	const selectedModelId = plain?.selectedModelId;
	if (selectedModelId) {
		selectedModelIdStore.set(selectedModelId);
	}
});

export const selectedModelStore = derived(selectedModelIdStore, (selectedModelId, set) => {
	set(availableModels.find((model) => model.id === selectedModelId));
});

// $: selectedModelId = $plainStore?.selectedModelId || availableModels[0].id;
// $: selectedModel = availableModels.find((model) => model.id === selectedModelId);
