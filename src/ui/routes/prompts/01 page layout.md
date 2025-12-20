user: On +page.svelte, please make a page layout where there is a scrolling left-side nav of the conversation history. The main right-side content portion should be the current conversation. Also, start a svelte component for those two things.

agent: I've created the page layout with two Svelte components:

1. **ConversationSidebar** (`src/lib/components/ConversationSidebar.svelte`) - A left-side navigation component that displays a scrolling list of conversation history. It includes placeholder data for now and will need to be connected to the database later.

2. **ConversationView** (`src/lib/components/ConversationView.svelte`) - The main content area on the right that displays the current conversation messages. It shows user and assistant messages with different styling.

3. **Updated +page.svelte** - The main page now uses a flex layout with the sidebar on the left and the conversation view on the right, taking up the full screen height.

Both components use Svelte 5 runes (`$state`) and are styled with Tailwind CSS. The sidebar has a fixed width of 256px (w-64) and scrolls when needed, while the main content area is flexible and scrollable. The components are ready to be connected to your database and encryption logic.

user: Please rename ConversationSidebar to ConversationList, and ConversationView to Conversation

agent: I've renamed the components:
- `ConversationSidebar.svelte` → `ConversationList.svelte`
- `ConversationView.svelte` → `Conversation.svelte`

Updated the imports in `+page.svelte` to use the new component names. All files have been updated and there are no linter errors.