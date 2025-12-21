import type { ChatCompletionChunk } from 'openai/resources/chat/completions';

export type TokenUsage = {
	input?: number;
	reasoning?: number;
	output?: number;
};

/**
 * Extract text content by accumulating content delta from all chunks
 */
export const extractText = (chunks: ChatCompletionChunk[]): string => {
	let text = '';
	for (const chunk of chunks) {
		const choice = chunk.choices[0];
		if (choice?.delta?.content) {
			text += choice.delta.content;
		}
	}
	return text;
};

/**
 * Extract model ID from the first chunk that contains a model field
 */
export const extractModelId = (chunks: ChatCompletionChunk[]): string | undefined => {
	for (const chunk of chunks) {
		if (chunk.model) {
			return chunk.model;
		}
	}
	return undefined;
};

/**
 * Extract token usage from the last chunk that contains usage information
 */
export const extractTokenUsage = (chunks: ChatCompletionChunk[]): TokenUsage | undefined => {
	// Iterate in reverse to find the last chunk with usage
	for (let i = chunks.length - 1; i >= 0; i--) {
		const chunk = chunks[i];
		if (chunk.usage) {
			return {
				input: chunk.usage.prompt_tokens,
				reasoning: chunk.usage.completion_tokens_details?.reasoning_tokens,
				output:
					chunk.usage.completion_tokens_details?.accepted_prediction_tokens ||
					chunk.usage.completion_tokens_details?.rejected_prediction_tokens ||
					chunk.usage.completion_tokens
			};
		}
	}
	return undefined;
};

/**
 * Extract citations from all chunks that contain citations (Perplexity format)
 * Accumulates citations across the entire stream
 */
export const extractCitations = (
	chunks: ChatCompletionChunk[]
): Record<string, string> | undefined => {
	const citationsMap: Record<string, string> = {};
	let citationIndex = 1;

	for (const chunk of chunks) {
		// Perplexity models include citations as an array in the chunk
		if ((chunk as any).citations && Array.isArray((chunk as any).citations)) {
			const chunkCitations = (chunk as any).citations as string[];
			for (const url of chunkCitations) {
				if (url && !Object.values(citationsMap).includes(url)) {
					citationsMap[citationIndex.toString()] = url;
					citationIndex++;
				}
			}
		}
	}

	return Object.keys(citationsMap).length > 0 ? citationsMap : undefined;
};

