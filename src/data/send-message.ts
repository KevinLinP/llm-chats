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
	const chunks: ChatCompletionChunk[] = [];

	for await (const chunk of completion) {
		const choice = chunk.choices[0];
		if (!choice) continue;

		// Collect all chunks
		chunks.push(chunk);

		// Extract content delta for streaming UI updates
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
			text: '', // Not used when chunks are present
			chunks // Pass chunks array - text, modelId, tokenUsage, citations will be extracted from chunks
		},
		timezone
	});

	return inserted;
};

