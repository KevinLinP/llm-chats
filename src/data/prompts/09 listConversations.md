user: Add and implement a listConversations to conversation.ts

agent: I've added and implemented the `listConversations` function to `conversation.ts`. Here's what I added:

1. **Added `ConversationSummary` type**: A new type for conversation list items that includes id, title, createdAt, and updatedAt (without the full parts/messages):
```24:29:src/data/conversation.ts
export type ConversationSummary = {
	id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
};
```

2. **Imported `listEncryptedConversations`**: Added the import from the conversation store:
```1:1:src/data/conversation.ts
import { fetchEncryptedConversation, insertEncryptedConversation, listEncryptedConversations, type EncryptedConversation } from '../db/conversation-store';
```

3. **Implemented `listConversations` function**: This function:
   - Calls `listEncryptedConversations()` from the store to get the 50 most recent conversations
   - Gets the cached encryption key
   - Decrypts all titles in parallel using `Promise.all`
   - Returns an array of `ConversationSummary` objects with decrypted titles:
```132:156:src/data/conversation.ts
export const listConversations = async (): Promise<ConversationSummary[]> => {
  const encryptedConversations = await listEncryptedConversations();

  // get the cached encryption key
  const encryptionKey = getEncryptionKey();

  // decrypt all titles in parallel
  const titles = await Promise.all(
    encryptedConversations.map(encryptedConversation =>
      decryptField({
        encryptedData: encryptedConversation.titleEncrypted,
        iv: encryptedConversation.titleIv as BufferSource,
        encryptionKey
      })
    )
  );

  // combine decrypted titles with conversation metadata
  return encryptedConversations.map((encryptedConversation, index) => ({
    id: encryptedConversation.id,
    title: titles[index],
    createdAt: encryptedConversation.createdAt,
    updatedAt: encryptedConversation.updatedAt
  }));
}
```

The function efficiently decrypts all conversation titles in parallel and returns them sorted by `createdAt` in descending order (most recent first), limited to 50 results, matching the behavior of the underlying `listEncryptedConversations` function.