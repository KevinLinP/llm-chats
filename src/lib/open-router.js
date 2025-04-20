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

export const defaultModelId = 'perplexity/sonar-pro';

export const modelGroups = [
  {
    name: 'Perplexity',
    models: [
      { id: 'perplexity/sonar', name: 'Sonar', functionCalling: false },
      { id: 'perplexity/sonar-pro', name: 'Sonar Pro', functionCalling: false },
      { id: 'perplexity/sonar-reasoning', name: 'Sonar Reasoning', functionCalling: false },
      { id: 'perplexity/sonar-reasoning-pro', name: 'Sonar Reasoning Pro', functionCalling: false },
      { id: 'perplexity/r1-1776', name: 'R1 1776', functionCalling: false },
    ]
  },
  {
    name: 'OpenAI',
    models: [
      { id: 'openai/chatgpt-4o-latest', name: 'ChatGPT-4o', functionCalling: false },
      { id: 'openai/gpt-4.1', name: 'GPT-4.1' },
      { id: 'openai/gpt-4.1-mini', name: 'GPT-4.1 Mini' },
      { id: 'openai/gpt-4.1-nano', name: 'GPT-4.1 Nano' },
      { id: 'openai/o3', name: 'o3' },
      { id: 'openai/o3-mini', name: 'o3 Mini' },
      { id: 'openai/o3-mini-high', name: 'o3 Mini High' },
      { id: 'openai/o4-mini', name: 'o4 Mini' },
      { id: 'openai/o4-mini-high', name: 'o4 Mini High' },
      { id: 'openai/gpt-4o-search-preview', name: 'GPT-4o Search Preview', functionCalling: false },
      { id: 'openai/gpt-4o-mini-search-preview', name: 'GPT-4o-mini Search Preview', functionCalling: false },
      { id: 'openai/gpt-4.5-preview', name: 'GPT-4.5 (Preview)' },
    ]
  },
  {
    name: 'Anthropic',
    models: [
      { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet' },
      { id: 'anthropic/claude-3.7-sonnet:thinking', name: 'Claude 3.7 Sonnet (thinking)' },
      { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku' },
    ]
  },
  {
    name: 'Google',
    models: [
      { id: 'google/gemini-2.5-pro-preview-03-25', name: 'Gemini 2.5 Pro Preview' },
      { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash Preview' },
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
];

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
