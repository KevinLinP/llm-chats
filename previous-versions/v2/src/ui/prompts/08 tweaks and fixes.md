user: Have the system message input default to `You are a helpful assistant.`.

agent: Updated the `systemMessageText` state in `ConversationForm.svelte` to default to `'You are a helpful assistant.'` instead of an empty string. This means whenever a new conversation form is displayed, the system message textarea will be pre-filled with this default value.

user: After a user message is submitted on a new convo, the page seems to navigate, which might be then canceling the openai network call.

agent: Fixed the navigation issue that was canceling the OpenAI network call. The problem was that `handleFormSubmit` was using `window.location.href` which causes a full page reload, potentially canceling any ongoing network requests. 

Changes made:
1. Replaced `window.location.href` with SvelteKit's `goto()` function, which performs client-side navigation without a full page reload
2. Added automatic agent response triggering for new conversations - when messages are loaded and the conversation only has system + user messages (no assistant message yet), it automatically triggers the agent response
3. This ensures the network call happens after navigation completes, preventing it from being canceled

The agent response now triggers automatically after navigation when a new conversation is created, ensuring the OpenAI call completes successfully.

user: The streaming message and send message part seems to be duplicated in Conversation.svelte. Dedup.

agent: Extracted the duplicated streaming and send message logic into a shared `triggerAgentResponse` function. This function handles:
- Setting up streaming state (streamingMessage, streamingModelName)
- Calling sendMessage with proper error handling
- Reloading messages after completion
- Resetting streaming state in the finally block

Both the auto-trigger logic (for new conversations) and `handleSendMessage` now use this shared function, eliminating code duplication.

user: Add whatever library I used in previous-version/ to display the Message.text as Markdown

agent: Added the `marked` library (v15.0.7) to package.json dependencies and created a `MarkdownRenderer.svelte` component based on the previous version's implementation. The component uses Svelte 5 syntax with `$props()` and includes the same styling for markdown elements (headings, lists, code blocks, tables, etc.) adapted for dark mode.

Updated both `MessageCard.svelte` and `StreamingMessage.svelte` to use the new `MarkdownRenderer` component instead of displaying plain text with `whitespace-pre-wrap`. Now all message text (both completed messages and streaming messages) will be rendered as formatted markdown.

Note: The `marked` package needs to be installed by running `bun install` (or `npm install`) since package managers require network permissions.

user: The markdown is working, but it broke dark mode a little bit. All Message.text is now black. Tailwind CSS's typography library is available if it helps.

agent: Fixed the dark mode text color issue by using Tailwind's typography plugin. Replaced the custom CSS styles with `prose prose-invert` classes which properly handle all text colors for dark mode. The `prose-invert` variant is specifically designed for dark backgrounds and ensures all markdown elements (headings, paragraphs, lists, etc.) have appropriate light text colors. Kept minimal custom overrides for code blocks, blockquotes, and links to maintain design consistency.

user: Display the model selector in the non-persisted version of Converation. I'd like to select before sending the first user message.

agent: Added a model selector to `ConversationForm.svelte` (the non-persisted version) so users can select the model before sending the first user message. The model selector uses the same `modelGroups` and styling as `MessageInput.svelte`.

Changes made:
1. Added `modelGroups` and `defaultModelId` imports to `ConversationForm.svelte`
2. Added `selectedModelId` state initialized to `defaultModelId`
3. Added a model selector dropdown in the form UI, positioned between the user message textarea and the submit button
4. Updated the `onSubmit` prop type to accept `modelId` as a fourth parameter
5. Updated `handleFormSubmit` in `Conversation.svelte` to accept and store the `modelId` in sessionStorage
6. Modified the auto-trigger logic in `Conversation.svelte` to retrieve the stored `modelId` from sessionStorage when triggering the agent response for new conversations, falling back to `defaultModelId` if not found

The model selector is now displayed in the conversation form, allowing users to choose their preferred model before creating a new conversation and sending the first message.