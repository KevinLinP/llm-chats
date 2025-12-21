user: Update Conversation.svelte to also show a persisted conversation. The id should be provided by a new route, which the Svelte component will then use to fetch.

agent: I've updated the Conversation component to support viewing persisted conversations and created a new dynamic route for accessing them.

**Changes made:**

1. **Created dynamic route** (`src/ui/routes/[id]/+page.svelte`):
   - Created a new route that captures the conversation ID from the URL
   - Uses `$page.params.id` to get the ID and passes it to the Conversation component
   - Maintains the same layout structure with ConversationList sidebar

2. **Updated Conversation.svelte**:
   - Added an optional `id` prop to the component
   - When `id` is provided, the component fetches and displays the persisted conversation
   - Uses `$effect` to reactively fetch the conversation when the `id` prop changes
   - Shows loading state while fetching
   - Displays error messages if the conversation can't be loaded
   - When no `id` is provided, shows the form for creating a new conversation
   - Displays conversation title and all message parts in a scrollable view

The component now supports both modes:
- **View mode**: When an `id` is provided, it fetches and displays the conversation
- **Create mode**: When no `id` is provided, it shows the form for creating a new conversation

The ConversationList component already links to `/{conversation.id}`, so clicking on a conversation in the list will now navigate to the new route and display the persisted conversation.

user: When I navigate from http://localhost:5173/ to http://localhost:5173/d3dfe20c-e0d2-4c43-a2f4-04275fab65a5, the ConversationList.svelte database query runs again. Update the layout somehow to prevent that?

agent: I've moved `ConversationList` to the `+layout.svelte` file so it persists across route changes. This prevents the database query from running again when navigating between routes.

**Changes made:**

1. **Updated `+layout.svelte`**:
   - Added `ConversationList` import and component
   - Moved the flex layout structure (`flex h-screen bg-gray-950`) to the layout
   - `ConversationList` now renders once in the layout and persists across all child routes

2. **Updated `+page.svelte`** (root route):
   - Removed `ConversationList` import and component
   - Removed the flex layout wrapper (now handled by layout)
   - Now only renders `Conversation` component

3. **Updated `[id]/+page.svelte`**:
   - Removed `ConversationList` import and component
   - Removed the flex layout wrapper (now handled by layout)
   - Now only renders `Conversation` component with the `id` prop

Now `ConversationList` is mounted once in the layout and persists when navigating between `/` and `/[id]`, so the database query only runs once when the app first loads.

user: tweak the layout some more so that the `/` and `/d3dfe20c-e0d2-4c43-a2f4-04275fab65a5` routes show the list, but `/settings` doesn't. You might have to add a sublayout for the first 2 or something.

agent: I've created a route group layout so that `ConversationList` only appears on `/` and `/[id]` routes, but not on `/settings`.

**Changes made:**

1. **Created route group** `(conversations)/+layout.svelte`:
   - Created a new route group folder `(conversations)` to group routes that need the conversation list
   - Moved `+page.svelte` (root route) and `[id]` folder into the `(conversations)` route group
   - Created `(conversations)/+layout.svelte` that contains `ConversationList` and the flex layout structure
   - This layout only applies to routes within the `(conversations)` group

2. **Updated main `+layout.svelte`**:
   - Removed `ConversationList` import and component
   - Removed the flex layout wrapper (moved to conversation sublayout)
   - Now only handles app-level initialization (database, encryption key, favicon)
   - Simply renders `{@render children()}` so child routes can use their own layouts

Now the routing structure is:
- `/` and `/[id]` routes use `(conversations)/+layout.svelte` → shows `ConversationList`
- `/settings` route uses only the main `+layout.svelte` → does NOT show `ConversationList`

The `ConversationList` still persists when navigating between `/` and `/[id]`, but is hidden on `/settings`.