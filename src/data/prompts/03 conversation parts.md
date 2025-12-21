user: Update the Conversation.parts from a string[] to a Message[]. Message is defined as:

type Message {
  sender: string
  text: string
}

agent: I've updated the `Conversation` type to use `Message[]` instead of `string[]` for the `parts` field. Here's what changed:

1. **Added the `Message` type** with `sender: string` and `text: string` properties
2. **Updated the `Conversation` type** to have `parts: Message[]` instead of `parts: string[]`
3. **Updated the `getConversation` function** to parse each decrypted string as JSON to convert it into a `Message` object
4. **Exported both types** (`Message` and `Conversation`) so they can be used in other parts of the codebase

The decryption logic now:
- Decrypts all the parts as strings (as before)
- Parses each decrypted string as JSON to create `Message` objects
- Returns the conversation with `parts` as `Message[]`

The changes are in `src/data/conversation.ts`.