import { writable, derived } from 'svelte/store';
import { plainStore } from './thread-stores.js';

const openAiModels = [
	{ name: 'GPT-4o Mini', id: 'gpt-4o-mini' },
	{ name: 'GPT-4o', id: 'gpt-4o' },
	{ name: 'GPT-4 Turbo', id: 'gpt-4-turbo' },
	{ name: 'GPT-4', id: 'gpt-4' },
	{ name: 'o1 Mini', id: 'o1-mini' },
	{ name: 'o1 Preview', id: 'o1-preview' },
	{ name: 'GPT-3.5 Turbo', id: 'gpt-3.5-turbo' },
].map((model) => ({
	id: `openai-${model.id}`,
	label: `OpenAI ${model.name}`,
	completionCreateOptions: {
		model: model.id
	}
}));

export const availableModels = [
	...openAiModels,
	{ id: 'local', label: 'Local', completionCreateOptions: {} }
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
