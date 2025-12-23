user: Update ConversationList.svelte to use listConversations()

agent: Updated ConversationList.svelte to use the `listConversations()` function instead of placeholder data. The component now:

1. Imports `listConversations` from the conversation module
2. Uses `$state` to manage the conversations array with proper typing
3. Uses `$effect` to load conversations when the component mounts
4. The conversations are loaded asynchronously and displayed once available

The component will now display actual conversations from the database, showing their titles and updated dates.

user:

```
Error: Database not set up. Call setupDb() first.
```

agent: Fixed the race condition issue. The problem was that `ConversationList` was using `$effect` which runs immediately during component initialization, but the database setup happens asynchronously in `+layout.svelte`'s `onMount`.

The fix:
1. Changed from `$effect` to `onMount` - this ensures the component waits for mount, which runs after the layout's `onMount`
2. Added a check for the database URL in localStorage before attempting to load conversations
3. Added a small delay (one tick) to ensure `setupDb()` in the layout has completed
4. Added error handling to catch and log any errors

Now the conversations will only load after the database has been properly initialized.