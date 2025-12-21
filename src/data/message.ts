import { listMessages as listEncryptedMessages, insertMessage as insertEncryptedMessage, type EncryptedMessage } from '../db/message-store';
import { getEncryptionKey } from './encryption-key';
import { decryptField, encryptField } from './crypto';

export type Message = {
	sender: 'system' | 'user' | 'agent';
	text: string;
	// Optional metadata following schema.org/Message patterns
	modelId?: string; // LLM model identifier (e.g., "gpt-4", "claude-3-opus")
	tokenUsage?: {
		input?: number; // Input tokens
		reasoning?: number; // Reasoning tokens (if applicable, e.g., o1 models)
		output?: number; // Output/generated tokens
	};
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
			const [sender, text, modelId, tokenUsage] = await Promise.all([
				decryptField({
					encryptedData: encryptedMessage.senderEncrypted,
					iv: encryptedMessage.senderIv as BufferSource,
					encryptionKey
				}),
				decryptField({
					encryptedData: encryptedMessage.textEncrypted,
					iv: encryptedMessage.textIv as BufferSource,
					encryptionKey
				}),
				encryptedMessage.modelIdEncrypted && encryptedMessage.modelIdIv
					? decryptField({
							encryptedData: encryptedMessage.modelIdEncrypted,
							iv: encryptedMessage.modelIdIv as BufferSource,
							encryptionKey
						})
					: Promise.resolve(undefined),
				encryptedMessage.tokenUsageEncrypted && encryptedMessage.tokenUsageIv
					? decryptField({
							encryptedData: encryptedMessage.tokenUsageEncrypted,
							iv: encryptedMessage.tokenUsageIv as BufferSource,
							encryptionKey
						}).then(str => JSON.parse(str))
					: Promise.resolve(undefined)
			]);

			return {
				id: encryptedMessage.id,
				conversationId: encryptedMessage.conversationId,
				index: encryptedMessage.index,
				sender: sender as 'system' | 'user' | 'agent',
				text,
				...(modelId && { modelId }),
				...(tokenUsage && { tokenUsage }),
				createdAt: encryptedMessage.createdAt,
				updatedAt: encryptedMessage.updatedAt
			};
		})
	);

	return messages;
};

export const insertMessage = async ({
	conversationId,
	message,
	timezone
}: {
	conversationId: string;
	message: Message;
	timezone: string;
}): Promise<{ id: string; index: number }> => {
	// get the cached encryption key
	const encryptionKey = getEncryptionKey();

	// encrypt all message fields
	const [senderEncrypted, textEncrypted, modelIdEncrypted, tokenUsageEncrypted] = await Promise.all([
		encryptField({ plaintext: message.sender, encryptionKey }),
		encryptField({ plaintext: message.text, encryptionKey }),
		message.modelId
			? encryptField({ plaintext: message.modelId, encryptionKey })
			: Promise.resolve(null),
		message.tokenUsage
			? encryptField({ plaintext: JSON.stringify(message.tokenUsage), encryptionKey })
			: Promise.resolve(null)
	]);

	// insert the encrypted message
	return await insertEncryptedMessage({
		conversationId,
		message: {
			senderEncrypted: senderEncrypted.encryptedData,
			senderIv: senderEncrypted.iv,
			textEncrypted: textEncrypted.encryptedData,
			textIv: textEncrypted.iv,
			...(modelIdEncrypted && {
				modelIdEncrypted: modelIdEncrypted.encryptedData,
				modelIdIv: modelIdEncrypted.iv
			}),
			...(tokenUsageEncrypted && {
				tokenUsageEncrypted: tokenUsageEncrypted.encryptedData,
				tokenUsageIv: tokenUsageEncrypted.iv
			})
		},
		timezone
	});
};

