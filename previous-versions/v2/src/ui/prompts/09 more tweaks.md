user:

* ConversationList: add a 24-hour time, and the day of the week to the timestamps.
* Conversation: let the title be editable. add data and db layer stuff as nessary.
* MessageList
  * remove the background box for the system message
  * move the user message so it's right-aligned
  * make the assistant messages the main content. remove the box around it and make sure it's wide.

agent: Implemented all requested changes:

1. **ConversationList timestamp formatting**: Updated to show day of week (short format) and 24-hour time format (HH:MM) instead of just the date.

2. **Editable conversation title**: 
   - Added `updateEncryptedConversation` function to `src/db/conversation-store.ts` to handle database updates with encrypted title data
   - Added `updateConversation` function to `src/data/conversation.ts` to handle encryption/decryption and call the db layer
   - Updated `Conversation.svelte` to make the title editable with click-to-edit functionality, Enter to save, Escape to cancel, and auto-focus on the input field
   - Title updates are saved to the database and the conversation store is updated

3. **MessageList styling**:
   - System messages: Removed background box, now display as simple text with gray color
   - User messages: Right-aligned with background box, max-width constrained
   - Assistant messages: Removed background box, made wide and prominent as main content

All changes maintain accessibility standards and follow the existing code patterns.