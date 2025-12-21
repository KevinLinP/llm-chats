user: Remove the concept of the Conversation's 'summary' from conversation.ts and the ui layer also.

agent: Removed the ConversationSummary concept throughout the codebase. Changes made:

1. **conversation.ts**: 
   - Removed `ConversationSummary` type definition
   - Changed `listConversations()` return type from `ConversationSummary[]` to `Conversation[]`

2. **conversation.svelte.ts** (store):
   - Removed import of `ConversationSummary`, now imports `Conversation` instead
   - Renamed `summaries` property to `conversations` with type `Conversation[]`
   - Removed `getSummary()` method
   - Renamed `loadSummaries()` to `loadConversations()`
   - Renamed `updateSummary()` to `updateConversation()` with parameter type `Conversation`

3. **Conversation.svelte**:
   - Removed the `summary` derived state that used `conversationStore.getSummary()`
   - Removed the `{:else if summary}` block that showed summary data while loading

4. **ConversationList.svelte**:
   - Changed `conversationStore.loadSummaries()` to `conversationStore.loadConversations()`
   - Changed `conversationStore.summaries` to `conversationStore.conversations`

The codebase now uses a single `Conversation` type throughout, eliminating the separate summary concept. The conversation store now manages full conversation objects instead of summary objects.

user: getSummary() might still need be around as getConveration(). The app needs to handle the case where a conversation loads even if it's not part of the limited loadConversations() row limit.

agent: Added `getConversation(id: string)` method to the conversation store. This method:

1. **Checks the store first**: Looks for the conversation in the existing `store.conversations` array (from the limited `loadConversations()` result)
2. **Fetches if not found**: If the conversation isn't in the store, it fetches it from the database using `getConversation()` from the data layer
3. **Updates the store**: If found, adds the conversation to the store for future lookups
4. **Handles edge cases**: Properly handles database configuration checks and error cases

This ensures that conversations can be loaded by ID even if they're not part of the limited 50-row result from `loadConversations()`, which is important for:
- Direct navigation to conversation URLs
- Loading older conversations that fall outside the limit
- Any scenario where a conversation needs to be accessed by ID

The method is async and returns `Promise<Conversation | null>`, matching the pattern of the data layer's `getConversation()` function.