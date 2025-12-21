import { getConversation } from '../../../data/conversation';
import { listMessages } from '../../../data/message';
import type { MessageWithMetadata } from '../../../data/message';
import { defaultModelId } from '../../../data/open-router';

type Conversation = {
	id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
};

type UseConversationLoaderOptions = {
	getId: () => string | undefined;
	onAutoTrigger?: (userMessage: string, modelId: string) => Promise<void>;
};

export function useConversationLoader(options: UseConversationLoaderOptions) {
	const { getId, onAutoTrigger } = options;

	// Derive the id to make it reactive
	const currentId = $derived(getId());

	let conversation = $state<Conversation | null>(null);
	let messages = $state<MessageWithMetadata[]>([]);
	let loadingConversation = $state(false);
	let loadingMessages = $state(false);
	let conversationError = $state<string | null>(null);
	let messagesError = $state<string | null>(null);

	$effect(() => {
		if (currentId) {
			// Load conversation metadata
			loadingConversation = true;
			conversationError = null;

			const databaseUrl = localStorage.getItem('databaseUrl');
			if (!databaseUrl) {
				conversationError = 'Database not configured';
				loadingConversation = false;
				return;
			}

			// Wait one tick to ensure setupDb in +layout.svelte's onMount has run
			Promise.resolve().then(async () => {
				try {
					const conv = await getConversation({ id: currentId });
					if (conv) {
						conversation = conv;
					} else {
						conversationError = 'Conversation not found';
					}
				} catch (error) {
					console.error('Failed to load conversation:', error);
					conversationError = error instanceof Error ? error.message : 'Failed to load conversation';
				} finally {
					loadingConversation = false;
				}
			});

			// Load messages for this conversation
			loadingMessages = true;
			messagesError = null;

			Promise.resolve().then(async () => {
				try {
					const msgs = await listMessages({ conversationId: currentId });
					messages = msgs;

					// Auto-trigger agent response for new conversations (only system + user messages, no assistant yet)
					if (
						onAutoTrigger &&
						msgs.length === 2 &&
						msgs[0]?.sender === 'system' &&
						msgs[1]?.sender === 'user' &&
						msgs.every((m) => m.sender !== 'assistant')
					) {
						const userMessage = msgs[1].text;
						// Get the modelId from sessionStorage if it was set during form submission, otherwise use default
						const storedModelId = sessionStorage.getItem(`conversation-${currentId}-modelId`);
						const modelIdToUse = storedModelId || defaultModelId;
						// Clean up the sessionStorage entry after using it
						if (storedModelId) {
							sessionStorage.removeItem(`conversation-${currentId}-modelId`);
						}
						await onAutoTrigger(userMessage, modelIdToUse);
					}
				} catch (error) {
					console.error('Failed to load messages:', error);
					messagesError = error instanceof Error ? error.message : 'Failed to load messages';
				} finally {
					loadingMessages = false;
				}
			});
		} else {
			conversation = null;
			messages = [];
			loadingConversation = false;
			loadingMessages = false;
			conversationError = null;
			messagesError = null;
		}
	});

	return {
		get conversation() {
			return conversation;
		},
		get messages() {
			return messages;
		},
		get loadingConversation() {
			return loadingConversation;
		},
		get loadingMessages() {
			return loadingMessages;
		},
		get conversationError() {
			return conversationError;
		},
		get messagesError() {
			return messagesError;
		},
		reloadMessages: async () => {
			if (!currentId) return;
			try {
				const msgs = await listMessages({ conversationId: currentId });
				messages = msgs;
			} catch (error) {
				console.error('Failed to reload messages:', error);
				messagesError = error instanceof Error ? error.message : 'Failed to reload messages';
			}
		},
		reloadConversation: async () => {
			if (!currentId) return;
			try {
				const conv = await getConversation({ id: currentId });
				if (conv) {
					conversation = conv;
				}
			} catch (error) {
				console.error('Failed to reload conversation:', error);
				conversationError = error instanceof Error ? error.message : 'Failed to reload conversation';
			}
		}
	};
}

