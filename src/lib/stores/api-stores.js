import { writable, derived } from 'svelte/store';
import OpenAI from 'openai';

export const openAiConfigStore = writable(null);

export const openAiStore = derived(
	[openAiConfigStore],
	([openAiConfig], set) => {
		const openAi = new OpenAI({ dangerouslyAllowBrowser: true, ...openAiConfig });

		set(openAi);
	}
);
