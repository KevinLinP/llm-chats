import OpenAI from 'openai';

import { getUser } from './user';

export const getOpenRouter = async () => {
  const user = await getUser();
  if (!user) return null;

  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: user.openRouter.apiKey,
    dangerouslyAllowBrowser: true,
  });
};

export const modelGroups = [
  {
    name: 'OpenAI',
    models: [
      { id: 'openai/gpt-4', name: 'GPT-4' },
      { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'openai/o1', name: 'o1' },
      { id: 'openai/o1-mini', name: 'o1 Mini' },
      { id: 'openai/gpt-4o', name: 'GPT-4o' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
    ]
  },
  {
    name: 'Anthropic',
    models: [
      { id: 'anthropic/claude-3.5-sonnet:beta', name: 'Claude 3.5 Sonnet' },
      { id: 'anthropic/claude-3.5-haiku:beta', name: 'Claude 3.5 Haiku' },
    ]
  },
  {
    name: 'Google',
    models: [
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5' },
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (free)' },
      { id: 'google/gemini-2.0-flash-thinking-exp:free', name: 'Gemini 2.0 Flash Thinking (free)' },
    ]
  },
  {
    name: 'Meta',
    models: [
      { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B Instruct' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct' },
      { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'Llama 3.1 Nemotron 70B Instruct' },
    ]
  },
  {
    name: 'Mistral',
    models: [
      { id: 'mistralai/mistral-large', name: 'Mistral Large' },
      { id: 'cognitivecomputations/dolphin-mixtral-8x22b', name: 'Dolphin Mixtral 8x22B' },
    ]
  }
]


export const defaultModelId = 'openai/gpt-4o-mini';