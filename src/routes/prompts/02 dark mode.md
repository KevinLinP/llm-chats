user: I'd like this app to always be in 'dark mode'. What does TailwindCSS provide?

agent: Tailwind CSS provides dark mode support through the `dark:` variant prefix. For Tailwind v4 (which you're using), here's what's available:

**Dark Mode Strategies:**
1. **Class strategy** (default): Add a `dark` class to enable dark mode. This is the most flexible approach.
2. **Media strategy**: Uses the `prefers-color-scheme` media query automatically.

**For always-on dark mode**, the simplest approach is to:
- Add the `dark` class to the `<html>` element in your `app.html` file
- Use `dark:` variants in your components (e.g., `dark:bg-gray-900`, `dark:text-white`)

**Example usage:**
```svelte
<div class="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content
</div>
```

Since you want the app to ALWAYS be in dark mode, I'll:
1. Add the `dark` class to the HTML element
2. Update your existing components to use dark mode colors

Let me implement this now.

agent: I've implemented dark mode for your app:

**Changes made:**

1. **Added `dark` class to HTML** (`src/app.html`):
   - Added `class="dark"` to the `<html>` element to enable Tailwind's dark mode

2. **Updated ConversationList component** (`src/lib/components/ConversationList.svelte`):
   - Changed background from `bg-gray-50` to `bg-gray-900`
   - Changed border from `border-gray-200` to `border-gray-700`
   - Updated text colors: headings to `text-gray-100`, titles to `text-gray-100`, dates to `text-gray-400`
   - Changed hover state from `hover:bg-gray-100` to `hover:bg-gray-800`

3. **Updated Conversation component** (`src/lib/components/Conversation.svelte`):
   - Added dark background `bg-gray-950` to the main container
   - Changed user message background from `bg-blue-50` to `bg-blue-900`
   - Changed assistant message background from `bg-gray-100` to `bg-gray-800`
   - Updated text colors: labels to `text-gray-200`, content to `text-gray-100`

4. **Updated page layout** (`src/routes/+page.svelte`):
   - Added `bg-gray-950` background to the root container

The app is now always in dark mode with a cohesive dark color scheme throughout!