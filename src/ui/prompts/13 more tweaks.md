user:

* For the system message input, have it be a non-obvious input like title is on the persisted Conversation.svelte.

* Move the title input on the non-persisted Conversation.svelte to the bottom, above the user message input.

* For the small citations buttons, when they're clicked, have it scroll down to the full link, and highlight that link.

agent:

Implemented all three UI tweaks:

1. **System Message Input (Non-obvious Pattern)**: Created a new `ConversationSystemMessage.svelte` component that follows the same click-to-edit pattern as `ConversationTitle.svelte`. The system message now appears as clickable text that expands into a textarea when clicked, with save on blur/Ctrl+Enter and cancel on Escape.

2. **Title Input Position**: Moved the title input from the top of `ConversationForm.svelte` to the bottom section, positioned above the user message input as requested.

3. **Citation Scrolling and Highlighting**: 
   - Added unique IDs to citation list items in `MessageCard.svelte` using the format `citation-{messageId}-{number}`
   - Updated `MarkdownRenderer.svelte` to handle citation link clicks with:
     - Smooth scrolling to the target citation using `scrollIntoView`
     - Temporary highlight effect (2-second fade animation) when scrolled to
   - Citation links now scroll to the full citation list instead of opening in a new tab
   - Added CSS animation for the highlight effect

All changes have been implemented and tested for linting errors.

user:

Prefix the system message input with `system: `

agent:

Updated `ConversationSystemMessage.svelte` to prefix the displayed system message with "system: " when shown in the non-editing state.

user:

* Style the system message to be muted, on both the persisted and non-persisted.

* Update the non-persisted Conversation model selection and button to be one line, and the button renamed to 'Send'. It should be like the persisted version

agent:

Implemented both UI tweaks:

1. **Muted System Message Styling**: Updated both system message displays to use `text-gray-600` for a more muted appearance:
   - `MessageCard.svelte` (line 9): Changed from `text-gray-500` to `text-gray-600` for persisted conversation system messages
   - `ConversationSystemMessage.svelte` (line 62): Changed from `text-gray-400` to `text-gray-600` for the non-persisted conversation system message button

2. **Non-Persisted Form Layout Update**: Updated `ConversationForm.svelte` to match the persisted version's layout:
   - Changed model selection and button to display on one line using flexbox (`flex items-end gap-4`)
   - Model select is now in a `flex-1` container alongside the button
   - Changed button text from "Submit" to "Send"
   - Button styling now matches `MessageInput.svelte` (no longer full-width, positioned inline with model select)

user:

MessageCard: text-gray-600 seems to have no effect. Skip the MarkdownRenderer for both system and user messages.

agent:

Updated `MessageCard.svelte` to skip `MarkdownRenderer` for system and user messages, rendering them as plain text instead. This allows the `text-gray-600` color to properly apply to system messages. The `MarkdownRenderer` is still used for assistant messages (which may contain markdown formatting and citations).