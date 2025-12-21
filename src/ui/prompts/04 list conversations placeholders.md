user: Show loading placeholder list items while waiting for the DB query to complete.

agent: I've added loading placeholder list items to the ConversationList component. The changes include:

1. **Added a loading state**: Introduced a `loading` state variable initialized to `true` using Svelte 5's `$state` rune.

2. **Updated the loading logic**: 
   - Set `loading = false` when there's no database URL (early return)
   - Set `loading = false` in a `finally` block after the query completes (whether successful or not)

3. **Added placeholder UI**: When loading, the component now displays 3 skeleton placeholder items with:
   - Animated pulse effect using Tailwind's `animate-pulse` class
   - Gray background bars that mimic the structure of actual conversation items
   - Two bars per placeholder (one for title, one for date) with different widths and colors

The placeholders match the visual structure of the actual conversation items, providing a smooth loading experience while the database query completes.

user: Show 20 placeholders.

agent: Updated the placeholder count from 3 to 20. The component now displays 20 skeleton placeholder items while loading.