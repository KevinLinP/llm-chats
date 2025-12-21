import { listMessages, insertMessage } from '../../../data/message';
import { sendMessage } from '../../../data/send-message';
import { modelNamesById } from '../../../data/open-router';
import type { MessageWithMetadata } from '../../../data/message';

type UseMessageSenderOptions = {
	getConversationId: () => string | undefined;
	onMessagesUpdate: (messages: MessageWithMetadata[]) => void;
};

export function useMessageSender(options: UseMessageSenderOptions) {
	const { getConversationId, onMessagesUpdate } = options;

	// Derive the conversationId to make it reactive
	const currentConversationId = $derived(getConversationId());

	let streamingMessage = $state<string | null>(null);
	let streamingModelName = $state<string>('');

	const triggerAgentResponse = async (userMessage: string, modelId: string) => {
		if (!currentConversationId) return;

		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

		// Start streaming agent response
		streamingMessage = '';
		streamingModelName = modelNamesById[modelId] || modelId;

		try {
			await sendMessage({
				conversationId: currentConversationId,
				userMessage,
				modelId,
				onStreamUpdate: (text) => {
					streamingMessage = text;
				},
				timezone
			});

			// Reload messages after agent message is inserted
			const finalMessages = await listMessages({ conversationId: currentConversationId });
			onMessagesUpdate(finalMessages);
		} catch (error) {
			console.error('Failed to send message:', error);
			// TODO: Show error to user
		} finally {
			streamingMessage = null;
			streamingModelName = '';
		}
	};

	const sendMessageToConversation = async (userMessage: string, modelId: string, currentMessages: MessageWithMetadata[]) => {
		if (!currentConversationId) return;

		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

		// Insert user message first
		const nextIndex = currentMessages.length;
		await insertMessage({
			conversationId: currentConversationId,
			index: nextIndex,
			message: {
				sender: 'user',
				text: userMessage
			},
			timezone
		});

		// Reload messages to include the new user message
		const updatedMessages = await listMessages({ conversationId: currentConversationId });
		onMessagesUpdate(updatedMessages);

		// Trigger agent response
		await triggerAgentResponse(userMessage, modelId);
	};

	return {
		get streamingMessage() {
			return streamingMessage;
		},
		get streamingModelName() {
			return streamingModelName;
		},
		get isStreaming() {
			return streamingMessage !== null;
		},
		triggerAgentResponse,
		sendMessage: sendMessageToConversation
	};
}

