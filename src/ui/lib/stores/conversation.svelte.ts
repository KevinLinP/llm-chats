import { listConversations, getConversation as fetchConversation, type Conversation } from '../../../data/conversation';

type ConversationStore = {
	conversations: Conversation[];
	loading: boolean;
	error: string | null;
};

const store = $state<ConversationStore>({
	conversations: [],
	loading: false,
	error: null
});

export const conversationStore = {
	get conversations() {
		return store.conversations;
	},
	
	get loading() {
		return store.loading;
	},
	
	get error() {
		return store.error;
	},
	
	async loadConversations() {
		store.loading = true;
		store.error = null;
		
		try {
			const databaseUrl = localStorage.getItem('databaseUrl');
			if (!databaseUrl) {
				store.loading = false;
				return;
			}

			// Wait one tick to ensure setupDb in +layout.svelte's onMount has run
			await new Promise((resolve) => setTimeout(resolve, 0));

			const result = await listConversations();
			store.conversations = result;
		} catch (error) {
			console.error('Failed to load conversations:', error);
			store.error = error instanceof Error ? error.message : 'Failed to load conversations';
		} finally {
			store.loading = false;
		}
	},
	
	// Get a conversation by ID, checking store first, then fetching if not found
	async getConversation(id: string): Promise<Conversation | null> {
		// First check if it's already in the store
		const existing = store.conversations.find(c => c.id === id);
		if (existing) {
			return existing;
		}

		// If not in store, fetch it from the database
		// This handles cases where the conversation isn't in the limited loadConversations() result
		try {
			const databaseUrl = localStorage.getItem('databaseUrl');
			if (!databaseUrl) {
				return null;
			}

			// Wait one tick to ensure setupDb in +layout.svelte's onMount has run
			await new Promise((resolve) => setTimeout(resolve, 0));

			const conversation = await fetchConversation({ id });
			
			// If found, add it to the store for future lookups
			if (conversation) {
				this.updateConversation(conversation);
			}
			
			return conversation;
		} catch (error) {
			console.error('Failed to get conversation:', error);
			return null;
		}
	},
	
	// Update a conversation (e.g., after creating a new conversation)
	updateConversation(conversation: Conversation) {
		const index = store.conversations.findIndex(c => c.id === conversation.id);
		if (index >= 0) {
			store.conversations[index] = conversation;
		} else {
			store.conversations.unshift(conversation);
		}
		// Sort by updatedAt descending
		store.conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
	}
};

