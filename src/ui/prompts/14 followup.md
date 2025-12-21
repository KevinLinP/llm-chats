user: When I send a followup user message after a assistant response, it seems to not be aware of the earlier messages in the conversation. Fix this by starting a stores/messages.svelte.ts so that the messages that are already loaded can be reused, without repeating a database call right before calling the OpenAI library.

agent: Implemented a messages store to cache loaded messages per conversation and modified `sendMessage` to require messages as a parameter instead of reloading from the database.

Changes made:
1. Created `src/ui/lib/stores/messages.ts` - A store similar to the conversation store pattern that caches messages per conversationId using `$state` with a Map. Provides methods: `getMessages`, `setMessages`, `addMessage`, and `clearMessages`.

2. Updated `src/data/send-message.ts` - Modified `sendMessage` to require a `messages: MessageWithMetadata[]` parameter and removed the `listMessages` call entirely. The function now uses the provided messages directly, eliminating redundant database calls.

3. Updated `src/ui/lib/composables/use-conversation-loader.svelte.ts` - Added calls to `messagesStore.setMessages` after loading messages (both in the initial load and in `reloadMessages`) to populate the cache.

4. Updated `src/ui/lib/composables/use-message-sender.svelte.ts` - Modified to use the messages store:
   - `triggerAgentResponse` now requires a `messages` parameter and passes it to `sendMessage`
   - `sendMessageToConversation` updates the store after inserting the user message and passes updated messages to `triggerAgentResponse`
   - After the assistant response, the store is updated with the final messages

5. Updated `src/ui/lib/components/Conversation.svelte` - Modified the `onAutoTrigger` callback to pass `loader.messages` to `triggerAgentResponse`.

This ensures that when sending a followup message, `sendMessage` uses the already-loaded messages from the store instead of making a database call, preventing race conditions and ensuring all conversation context is available.