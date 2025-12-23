user: For an existing conversation, have the model selector default to the model of the last assistant message.

agent: I've implemented the feature to default the model selector to the model of the last assistant message for existing conversations.

The changes I made:

1. **Updated `MessageInput.svelte`**: Added an optional `defaultModelId` prop that can override the default model. When this prop changes, the component reactively updates the selected model using `$effect`.

2. **Updated `Conversation.svelte`**: Added logic to find the last assistant message with a `modelId` and pass it as the `defaultModelId` prop to `MessageInput`. This uses an IIFE to compute the value reactively based on `loader.messages`.

Now when you open an existing conversation, the model selector will automatically default to whatever model was used for the last assistant message in that conversation, making it easier to continue using the same model.

user: MessageCard: for assistant messages, display the model name and token usage counts as small muted text at the bottom right of the main text content.

agent: I've updated the MessageCard component to display the model name and token usage counts for assistant messages.

The changes I made:

1. **Updated `MessageCard.svelte`**: Added a metadata section that displays below the main text content for assistant messages. This section shows:
   - The model name (if available)
   - Token usage counts formatted as "in: X • reasoning: Y • out: Z" (showing only the fields that are present)
   - The text is styled as small (`text-xs`), muted (`text-gray-500`), and right-aligned
   - Token counts are formatted with locale-aware number formatting (e.g., "1,234" instead of "1234")

The metadata appears at the bottom right of the main text content, separated from the citations list below. It only displays when either `modelId` or `tokenUsage` is present on the message.