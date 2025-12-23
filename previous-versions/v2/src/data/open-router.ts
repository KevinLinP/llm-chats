import OpenAI from 'openai';

export const getOpenRouter = async (): Promise<OpenAI | null> => {
	const apiKey = localStorage.getItem('openRouterApiKey');
	if (!apiKey) return null;

	return new OpenAI({
		baseURL: 'https://openrouter.ai/api/v1',
		apiKey,
		dangerouslyAllowBrowser: true
	});
};

export const defaultModelId = 'perplexity/sonar-pro-search';

export const modelGroups = [
	{
		name: 'Perplexity',
		models: [
			{ id: 'perplexity/sonar-pro', name: 'Sonar Pro' },
			{ id: 'perplexity/sonar-pro-search', name: 'Sonar Pro Search' },
			{ id: 'perplexity/sonar-reasoning-pro', name: 'Sonar Reasoning Pro' },
		]
	},
	{
		name: 'OpenAI',
		models: [
			{ id: 'openai/gpt-5.2-pro', name: 'GPT-5.2 Pro' },
		]
	},
	{
		name: 'Anthropic',
		models: [
			{ id: 'anthropic/claude-opus-4.5', name: 'Claude Opus 4.5' },
			{ id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5' },
		]
	},
	{
		name: 'Google',
		models: [
			{ id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro Preview' },
		]
	},
];

export const modelsById = modelGroups.reduce(
	(acc, group) => {
		group.models.forEach((model) => {
			acc[model.id] = model;
		});
		return acc;
	},
	{} as Record<string, { id: string; name: string }>
);

export const modelNamesById = modelGroups.reduce(
	(acc, group) => {
		group.models.forEach((model) => {
			acc[model.id] = `${group.name} ${model.name}`;
		});
		return acc;
	},
	{} as Record<string, string>
);

