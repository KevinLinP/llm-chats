import { listMessages, insertMessage } from '../../../data/message';
import { sendMessage } from '../../../data/send-message';
import { modelNamesById } from '../../../data/open-router';
import type { MessageWithMetadata } from '../../../data/message';
import { messagesStore } from '../stores/messages.svelte';

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

	const triggerAgentResponse = async (userMessage: string, modelId: string, messages: MessageWithMetadata[]) => {
		if (!currentConversationId) return;

		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

		// Start streaming agent response
		streamingMessage = '';
		streamingModelName = modelNamesById[modelId] || modelId;

		try {
			const inserted = await sendMessage({
				conversationId: currentConversationId,
				userMessage,
				modelId,
				messages,
				onStreamUpdate: (text) => {
					streamingMessage = text;
				},
				timezone
			});

			// Reload messages after agent message is inserted to get the complete assistant message
			const finalMessages = await listMessages({ conversationId: currentConversationId });
			messagesStore.setMessages(currentConversationId, finalMessages);
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
		const insertedUserMessage = await insertMessage({
			conversationId: currentConversationId,
			index: nextIndex,
			message: {
				sender: 'user',
				text: userMessage
			},
			timezone
		});

		// Create updated messages array with the new user message
		// We need to reload to get the full message with metadata (id, timestamps, etc.)
		const updatedMessages = await listMessages({ conversationId: currentConversationId });
		messagesStore.setMessages(currentConversationId, updatedMessages);
		onMessagesUpdate(updatedMessages);

		// Trigger agent response with the updated messages
		await triggerAgentResponse(userMessage, modelId, updatedMessages);
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

