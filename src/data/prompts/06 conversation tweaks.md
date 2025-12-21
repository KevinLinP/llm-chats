user: Please tweak the Message.sender type to be one of the following strings: system, user, agent

agent: Updated the `Message.sender` type to be a union type of `'system' | 'user' | 'agent'` instead of a generic `string`. This provides better type safety and ensures only valid sender values can be used.

user: I keep confusing myself with conversation.ts's exported methods, and conversation-store.ts's methods of the same name. Suggest some names to rename conversation-store's methods to.

agent: Here are several naming options for the `conversation-store.ts` methods to avoid confusion with `conversation.ts`:

**Option 1: Match existing aliases (Recommended)**
- `getEncryptedConversation` / `createEncryptedConversation`
- Pros: Already matches the aliases used in `conversation.ts` (line 1), clearly indicates encrypted data
- Cons: Slightly longer names

**Option 2: Store prefix**
- `storeGetConversation` / `storeCreateConversation`
- Pros: Makes it clear these are from the store layer
- Cons: Less descriptive about the encryption aspect

**Option 3: Database prefix**
- `dbGetConversation` / `dbCreateConversation`
- Pros: Makes it clear these are database operations
- Cons: Less descriptive about encryption

**Option 4: Record suffix**
- `getConversationRecord` / `createConversationRecord`
- Pros: Indicates these work with raw database records
- Cons: Doesn't emphasize the encryption aspect

**Option 5: Fetch/Insert verbs**
- `fetchEncryptedConversation` / `insertEncryptedConversation`
- Pros: Uses clear database verbs, emphasizes encryption
- Cons: Different verb pattern than the public API

**Recommendation:** Option 1 (`getEncryptedConversation` / `createEncryptedConversation`) is the best choice since `conversation.ts` already imports them with these exact aliases, making the rename straightforward and consistent.

Would you like me to proceed with renaming them to Option 1, or do you prefer a different option?

user: Do option 5 please.

agent: Renamed the methods in `conversation-store.ts` to use Option 5:
- `getConversation` → `fetchEncryptedConversation`
- `createConversation` → `insertEncryptedConversation`

Updated all references in `conversation.ts` to use the new method names. The import statement now directly imports the renamed methods without aliases, making the code clearer and avoiding confusion with the public API methods.