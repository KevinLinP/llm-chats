import OpenAI from 'openai';

import { getUser } from './user';

export const getOpenAi = async () => {
  const user = await getUser();
  if (!user) return null;

  return new OpenAI({ dangerouslyAllowBrowser: true, apiKey: user.openAi?.apiKey });
};

export const availableModels = [
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

export const defaultModelId = 'openai-gpt-4o-mini';