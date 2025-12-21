import { listConversations, type ConversationSummary } from '../../../data/conversation';

type ConversationStore = {
	summaries: ConversationSummary[];
	loading: boolean;
	error: string | null;
};

const store = $state<ConversationStore>({
	summaries: [],
	loading: false,
	error: null
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

