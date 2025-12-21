import { listMessages as listEncryptedMessages, insertMessage as insertEncryptedMessage, type EncryptedMessage } from '../db/message-store';
import { getEncryptionKey } from './encryption-key';
import { decryptField, encryptField } from './crypto';
import type { ChatCompletionChunk } from 'openai/resources/chat/completions';
import { extractText, extractModelId, extractTokenUsage, extractCitations } from './chunks';

export type Message = {
	sender: 'system' | 'user' | 'assistant';
	text: string;
	// Optional metadata following schema.org/Message patterns
	modelId?: string; // LLM model identifier (e.g., "gpt-4", "claude-3-opus")
	tokenUsage?: {
		input?: number; // Input tokens
		reasoning?: number; // Reasoning tokens (if applicable, e.g., o1 models)
		output?: number; // Output/generated tokens
	};
	citations?: Record<string, string>; // Maps citation numbers to URLs (e.g., { "1": "https://...", "2": "https://..." })
	chunks?: ChatCompletionChunk[]; // Chat completion chunks (for assistant messages)
};

export type MessageWithMetadata = Message & {
	id: string;
	conversationId: string;
	index: number;
	createdAt: Date;
	updatedAt: Date;
};

export const listMessages = async ({ conversationId }: { conversationId: string }): Promise<MessageWithMetadata[]> => {
	const encryptedMessages = await listEncryptedMessages({ conversationId });

	// get the cached encryption key
	const encryptionKey = getEncryptionKey();

		// decrypt each message field
		const messages = await Promise.all(
			encryptedMessages.map(async (encryptedMessage) => {
				const [sender, text, chunksStr] = await Promise.all([
					decryptField({
						encryptedData: encryptedMessage.senderEncrypted,
						iv: encryptedMessage.senderIv as BufferSource,
						encryptionKey
					}),
					encryptedMessage.textEncrypted && encryptedMessage.textIv
						? decryptField({
								encryptedData: encryptedMessage.textEncrypted,
								iv: encryptedMessage.textIv as BufferSource,
								encryptionKey
							})
						: Promise.resolve(undefined),
					encryptedMessage.chunksEncrypted && encryptedMessage.chunksIv
						? decryptField({
								encryptedData: encryptedMessage.chunksEncrypted,
								iv: encryptedMessage.chunksIv as BufferSource,
								encryptionKey
							})
						: Promise.resolve(undefined)
				]);

				// Parse chunks if present
				const chunks: ChatCompletionChunk[] | undefined = chunksStr
					? JSON.parse(chunksStr)
					: undefined;

				// Extract data from chunks if present, otherwise use decrypted text
				const extractedText = chunks ? extractText(chunks) : text || '';
				const extractedModelId = chunks ? extractModelId(chunks) : undefined;
				const extractedTokenUsage = chunks ? extractTokenUsage(chunks) : undefined;
				const extractedCitations = chunks ? extractCitations(chunks) : undefined;

				return {
					id: encryptedMessage.id,
					conversationId: encryptedMessage.conversationId,
					index: encryptedMessage.index,
					sender: sender as 'system' | 'user' | 'assistant',
					text: extractedText,
					...(extractedModelId && { modelId: extractedModelId }),
					...(extractedTokenUsage && { tokenUsage: extractedTokenUsage }),
					...(extractedCitations && { citations: extractedCitations }),
					...(chunks && { chunks }),
					createdAt: encryptedMessage.createdAt,
					updatedAt: encryptedMessage.updatedAt
				};
			})
		);

	return messages;
};

export const insertMessage = async ({
	conversationId,
	index,
	message,
	timezone
}: {
	conversationId: string;
	index: number;
	message: Message;
	timezone: string;
}): Promise<{ id: string; index: number }> => {
	// get the cached encryption key
	const encryptionKey = getEncryptionKey();

	// If chunks are present, encrypt chunks and skip text
	// Otherwise, encrypt text as before (backward compatibility for user/system messages)
	const hasChunks = message.chunks && message.chunks.length > 0;

	const [senderEncrypted, textEncrypted, chunksEncrypted] = await Promise.all([
		encryptField({ plaintext: message.sender, encryptionKey }),
		hasChunks
			? Promise.resolve(null)
			: encryptField({ plaintext: message.text, encryptionKey }),
		hasChunks
			? encryptField({ plaintext: JSON.stringify(message.chunks), encryptionKey })
			: Promise.resolve(null)
	]);

	// insert the encrypted message
	return await insertEncryptedMessage({
		conversationId,
		index,
		message: {
			senderEncrypted: senderEncrypted.encryptedData,
			senderIv: senderEncrypted.iv,
			textEncrypted: textEncrypted?.encryptedData,
			textIv: textEncrypted?.iv,
			chunksEncrypted: chunksEncrypted?.encryptedData,
			chunksIv: chunksEncrypted?.iv
		},
		timezone
	});
};

