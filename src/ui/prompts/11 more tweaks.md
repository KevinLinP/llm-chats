user:

* When an OpenAI message is streaming, it has the background box. Check styling so that it's just like the non-streaming version

* There's something about the Conversation layout where when there isn't much content, the whole layout narrows. Fix it so it takes the whole available width.

* The Conversation delete button looks like a primary action. Restyle to make it a tertiary action.

* The ConversationList new button looks like a primary action. Style it like a secondary action.

* Pressing enter in the User message box doesn't do anything. Make it behave the same as pressing Submit.

agent:

All five UI tweaks have been implemented:

1. **Streaming message background box removed**: Removed `bg-gray-800 rounded-lg p-4` classes from `StreamingMessage.svelte` to match the non-streaming assistant message styling (no background box).

2. **Conversation layout width fixed**: Added `w-full` class to the inner flex container in `Conversation.svelte` (line 282) to ensure it takes the full available width within the max-width constraint.

3. **Delete button restyled as tertiary**: Changed the delete button in `Conversation.svelte` from primary red styling (`bg-red-600 hover:bg-red-700`) to tertiary text-based styling (`text-gray-400 hover:text-gray-300`) with no background.

4. **New button restyled as secondary**: Changed the "New" button in `ConversationList.svelte` from primary blue styling (`bg-blue-600 hover:bg-blue-700`) to secondary outline style (`border border-gray-600 text-gray-300 hover:bg-gray-800`).

5. **Enter key support added**: Added a `keydown` event handler to the textarea in `MessageInput.svelte` that submits the form when Enter is pressed (without Shift), allowing Shift+Enter for new lines.

All changes passed linting with no errors.