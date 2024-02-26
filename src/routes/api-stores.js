import { writable, derived } from 'svelte/store';
import { selectedModelIdStore } from './model-stores.js';
import OpenAI from 'openai';

export const openAiConfigStore = writable(null);

export const openAiStore = derived(
	[selectedModelIdStore, openAiConfigStore],
	([selectedModelId, openAiConfig], set) => {
		const config =
			selectedModelId === 'local'
				? {
						apiKey: 'not needed',
						baseURL: 'http://localhost:1234/v1/'
					}
				: openAiConfig;

		const openAi = new OpenAI({ dangerouslyAllowBrowser: true, ...config });

		set(openAi);
	}
);
