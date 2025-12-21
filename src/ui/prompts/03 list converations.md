user: Update ConversationList.svelte to use listConversations()

agent: Updated ConversationList.svelte to use the `listConversations()` function instead of placeholder data. The component now:

1. Imports `listConversations` from the conversation module
2. Uses `$state` to manage the conversations array with proper typing
3. Uses `$effect` to load conversations when the component mounts
4. The conversations are loaded asynchronously and displayed once available

The component will now display actual conversations from the database, showing their titles and updated dates.