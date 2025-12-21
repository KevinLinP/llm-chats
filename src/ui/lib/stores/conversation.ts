import { listConversations, getConversation, type ConversationSummary, type Conversation } from '../../../data/conversation';

type ConversationStore = {
	summaries: ConversationSummary[];
	fullConversations: Map<string, Conversation>;
	loading: boolean;
	error: string | null;
	loadingConversations: Set<string>;
	conversationErrors: Map<string, string>;
};

const store = $state<ConversationStore>({
	summaries: [],
	fullConversations: new Map(),
	loading: false,
	error: null,
	loadingConversations: new Set(),
	conversationErrors: new Map()
});

export const conversationStore = {
	get summaries() {
		return store.summaries;
	},
	
	get loading() {
		return store.loading;
	},
	
	get error() {
		return store.error;
	},
	
	getSummary(id: string): ConversationSummary | undefined {
		return store.summaries.find(c => c.id === id);
	},
	
	getFullConversation(id: string): Conversation | undefined {
		return store.fullConversations.get(id);
	},
	
	isLoadingConversation(id: string): boolean {
		return store.loadingConversations.has(id);
	},
	
	getConversationError(id: string): string | undefined {
		return store.conversationErrors.get(id);
	},
	
	async loadSummaries() {
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
			store.summaries = result;
		} catch (error) {
			console.error('Failed to load conversations:', error);
			store.error = error instanceof Error ? error.message : 'Failed to load conversations';
		} finally {
			store.loading = false;
		}
	},
	
	async loadFullConversation(id: string) {
		// If we already have the full conversation, don't reload
		if (store.fullConversations.has(id)) {
			return store.fullConversations.get(id)!;
		}
		
		// If already loading, don't start another load
		if (store.loadingConversations.has(id)) {
			return null;
		}
		
		store.loadingConversations.add(id);
		store.conversationErrors.delete(id);
		
		try {
			const databaseUrl = localStorage.getItem('databaseUrl');
			if (!databaseUrl) {
				throw new Error('Database not configured');
			}

			// Wait one tick to ensure setupDb in +layout.svelte's onMount has run
			await new Promise((resolve) => setTimeout(resolve, 0));

			const conversation = await getConversation({ id });
			if (conversation) {
				store.fullConversations.set(id, conversation);
				return conversation;
			}
			return null;
		} catch (error) {
			console.error('Failed to load conversation:', error);
			const errorMessage = error instanceof Error ? error.message : 'Failed to load conversation';
			store.conversationErrors.set(id, errorMessage);
			throw error;
		} finally {
			store.loadingConversations.delete(id);
		}
	},
	
	// Update a conversation summary (e.g., after creating a new conversation)
	updateSummary(summary: ConversationSummary) {
		const index = store.summaries.findIndex(c => c.id === summary.id);
		if (index >= 0) {
			store.summaries[index] = summary;
		} else {
			store.summaries.unshift(summary);
		}
		// Sort by updatedAt descending
		store.summaries.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
	}
};

