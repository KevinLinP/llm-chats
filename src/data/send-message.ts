import { getOpenRouter } from './open-router';
import { listMessages, insertMessage } from './message';
import { toOpenAIMessages } from './messages';
import type { ChatCompletionChunk } from 'openai/resources/chat/completions';

export const sendMessage = async ({
	conversationId,
	userMessage,
	modelId,
	onStreamUpdate,
	timezone
}: {
	conversationId: string;
	userMessage: string;
	modelId: string;
	onStreamUpdate: (text: string) => void;
	timezone: string;
}): Promise<{ id: string; index: number }> => {
	const openRouter = await getOpenRouter();
	if (!openRouter) {
		throw new Error('OpenRouter API key not configured');
	}

	// Load existing messages (which should already include the user message that was just inserted)
	const existingMessages = await listMessages({ conversationId });

	// Convert to OpenAI format (includes all messages including the new user message)
	const openAIMessages = toOpenAIMessages({ messages: existingMessages });

	// Create streaming completion request
	const completion = await openRouter.chat.completions.create({
		model: modelId,
		messages: openAIMessages,
		stream: true
	});

	// Stream chunks and accumulate content
	let streamingText = '';
	let modelIdFromStream: string | undefined;
	let tokenUsage: { input?: number; reasoning?: number; output?: number } | undefined;
	let citations: Record<string, string> | undefined;
	let firstChunk: ChatCompletionChunk | null = null;
  const chunks: ChatCompletionChunk[] = [];

	for await (const chunk of completion) {
		const choice = chunk.choices[0];
		if (!choice) continue;
		chunks.push(chunk);

		// Track first chunk for citations extraction
		if (!firstChunk) {
			firstChunk = chunk;
			// Extract citations from first chunk (Perplexity Sonar models)
			if ((chunk as any).citations && Array.isArray((chunk as any).citations)) {
				citations = (chunk as any).citations.reduce((acc: Record<string, string>, url: string, index: number) => {
					acc[(index + 1).toString()] = url;
					return acc;
				}, {});
			}
		}

		// Extract model ID from first chunk if available
		if (chunk.model && !modelIdFromStream) {
			modelIdFromStream = chunk.model;
		}

		// Extract token usage from final chunk
		if (chunk.usage) {
			tokenUsage = {
				input: chunk.usage.prompt_tokens,
				reasoning: chunk.usage.completion_tokens_details?.reasoning_tokens,
				output: chunk.usage.completion_tokens_details?.accepted_prediction_tokens ||
					chunk.usage.completion_tokens_details?.rejected_prediction_tokens ||
					chunk.usage.completion_tokens
			};
		}

		// Extract content delta
		const chunkContent = choice.delta?.content;
		if (chunkContent) {
			streamingText += chunkContent;
			onStreamUpdate(streamingText);
		}
	}

	// Insert agent message when stream completes
	// The index should be after all existing messages (including the user message that was just added)
	const nextIndex = existingMessages.length;
	const inserted = await insertMessage({
		conversationId,
		index: nextIndex,
		message: {
			sender: 'assistant',
			text: streamingText,
			...(modelIdFromStream && { modelId: modelIdFromStream }),
			...(tokenUsage && { tokenUsage }),
			...(citations && { citations })
		},
		timezone
	});

	return inserted;
};

