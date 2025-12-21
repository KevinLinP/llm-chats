User: Add a button to the top right of ConversationList.svelte that navigates `/`. Functionally, this is a new conversation button.

agent: I've added a "New" button to the top right of the ConversationList component. The button:
- Is positioned in the header next to the "Conversations" title using flexbox
- Navigates to `/` when clicked (using a simple `<a>` tag, consistent with the existing navigation pattern in the component)
- Uses the same blue button styling (`bg-blue-600`) as other buttons in the app
- Includes hover and focus states for better UX

The header is now a flex container that positions the title on the left and the button on the right.