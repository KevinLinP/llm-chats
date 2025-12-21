user: Update Conversation.svelte with:

* title text input at the top
* systemMessageText input at the top
* userMessageText input at the bottom

When the user presses enter in the user prompt input, and all 3 text inputs are not blank, call conversation.ts's createConversation. Read the timezone from the browser.

agent: Updated Conversation.svelte with the requested functionality:

1. Added three state variables using Svelte 5's `$state` rune:
   - `title` for the conversation title
   - `systemMessageText` for the system message
   - `userMessageText` for the user message

2. Added input elements:
   - Title text input at the top with a label
   - System message textarea at the top with a label
   - User message textarea at the bottom with a label

3. Implemented the `handleUserMessageKeydown` function that:
   - Listens for Enter key press (without Shift)
   - Prevents default behavior
   - Checks that all three inputs are not blank (using `.trim()`)
   - Gets the timezone from the browser using `Intl.DateTimeFormat().resolvedOptions().timeZone`
   - Calls `createConversation` with the proper Message objects (system message with `sender: 'system'` and user message with `sender: 'user'`)

4. Updated the layout to use flexbox for proper positioning:
   - The title and system message inputs are at the top
   - The user message input is at the bottom using `mt-auto`

The component now imports `createConversation` from `../../data/conversation` and handles the conversation creation flow as requested.

user: Instead of just the enter key, how about just when the user input fires the submit event?

agent: Updated the component to use a form submit event instead of the Enter keydown handler:

1. Replaced `handleUserMessageKeydown` with `handleSubmit` that takes a `SubmitEvent`
2. Wrapped all inputs in a `<form>` element with `onsubmit={handleSubmit}`
3. Removed the `onkeydown` handler from the user message textarea
4. Updated the placeholder text to remove the Enter key reference

The form will now submit when the user presses Enter in any input field (standard form behavior), and the submit event will be handled by `handleSubmit`. This is more semantic and follows standard HTML form patterns.

user: If you trim an blank string, does it become null?

agent: No, `.trim()` on a blank string returns an empty string `""`, not `null`. Empty strings are falsy in JavaScript, so the current check works, but they're still strings, not null.

user: Yeah, go with the length check please

agent: Updated the validation check to use explicit length checks (`.trim().length > 0`) instead of relying on truthiness, making the intent clearer and more explicit.

User: Add form submit button

agent: Added a submit button to the form, positioned below the user message textarea. The button uses dark mode styling with a blue background that matches the focus ring color, includes hover and focus states, and will trigger the form submission when clicked.