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
      { id: 'openai/chatgpt-4o-latest', name: 'ChatGPT-4o', functionCalling: false },
      { id: 'openai/gpt-4o', name: 'GPT-4o' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'openai/o1', name: 'o1' },
      { id: 'openai/o1-mini', name: 'o1 Mini' },
      { id: 'openai/o3-mini', name: 'o3 Mini' },
      { id: 'openai/o3-mini-high', name: 'o3 Mini High' },
      { id: 'openai/gpt-4.5-preview', name: 'GPT-4.5 (Preview)' },
    ]
  },
  {
    name: 'Anthropic',
    models: [
      { id: 'anthropic/claude-3.7-sonnet:beta', name: 'Claude 3.7 Sonnet' },
      { id: 'anthropic/claude-3.7-sonnet:thinking', name: 'Claude 3.7 Sonnet (thinking)' },
      { id: 'anthropic/claude-3.5-haiku:beta', name: 'Claude 3.5 Haiku' },
    ]
  },
  {
    name: 'DeepSeek',
    models: [
      { id: 'deepseek/deepseek-r1:nitro', name: 'R1 (nitro)' },
      { id: 'deepseek/deepseek-r1', name: 'R1' },
    ]
  },
  {
    name: 'Google',
    models: [
      { id: 'google/gemini-2.5-pro-exp-03-25:free', name: 'Gemini Pro 2.5 Experimental (free)' },
      { id: 'google/gemini-2.0-flash-001', name: 'Gemini Flash 2.0' },
      { id: 'google/gemini-2.0-pro-exp-02-05:free', name: 'Gemini Pro 2.0 Experimental (free)' },
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5' },
    ]
  },
  {
    name: 'Meta',
    models: [
      { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B Instruct', functionCalling: false },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct', functionCalling: false },
      { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'Llama 3.1 Nemotron 70B Instruct', functionCalling: false },
    ]
  },
  {
    name: 'Mistral',
    models: [
      { id: 'mistralai/mistral-large', name: 'Large' },
      { id: 'cognitivecomputations/dolphin-mixtral-8x22b', name: 'Dolphin Mixtral 8x22B', functionCalling: false },
    ]
  }
]

export const modelsById = modelGroups.reduce((acc, group) => {
  group.models.forEach(model => {
    acc[model.id] = model;
  });
  return acc;
}, {});

export const modelNamesById = modelGroups.reduce((acc, group) => {
  group.models.forEach(model => {
    acc[model.id] = `${group.name} ${model.name}`;
  });
  return acc;
}, {});

export const defaultModelId = 'openai/chatgpt-4o-latest';