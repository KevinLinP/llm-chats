const openAiModels = [
	{ name: 'GPT-4', id: 'gpt-4' },
	{ name: 'GPT-4 Turbo', id: 'gpt-4-turbo' },
	{ name: 'o1 Preview', id: 'o1-preview' },
	{ name: 'o1 Mini', id: 'o1-mini' },
	{ name: 'GPT-4o', id: 'gpt-4o' },
	{ name: 'GPT-4o Mini', id: 'gpt-4o-mini' },
].map((model) => ({
	id: `openai-${model.id}`,
	label: `OpenAI ${model.name}`,
	completionCreateOptions: {
		model: model.id
	}
}));

export const availableModels = [
	...openAiModels,
	// TODO: fix local model case
	// { id: 'local', label: 'Local', completionCreateOptions: {} }
];

export const defaultModelId = 'openai-gpt-4o-mini';