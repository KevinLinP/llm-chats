import type { MessageWithMetadata } from '../../../data/message';

type MessagesStore = {
	messages: Map<string, MessageWithMetadata[]>;
};

const store = $state<MessagesStore>({
	messages: new Map()
});

export const messagesStore = {
	getMessages(conversationId: string): MessageWithMetadata[] | null {
		return store.messages.get(conversationId) ?? null;
	},

	setMessages(conversationId: string, messages: MessageWithMetadata[]) {
		store.messages.set(conversationId, messages);
	},

	addMessage(conversationId: string, message: MessageWithMetadata) {
		const existing = store.messages.get(conversationId) ?? [];
		store.messages.set(conversationId, [...existing, message]);
	},

	clearMessages(conversationId: string) {
		store.messages.delete(conversationId);
	}
};

