user: Add createConversation({title: string, systemMessage: Message, userMessage: Message, timezone: string}) to conversation.ts

agent: I've added the `createConversation` function to `conversation.ts`. The function:

1. Takes the required parameters: `title`, `systemMessage`, `userMessage`, and `timezone`
2. Gets the cached encryption key using `getEncryptionKey()`
3. Encrypts the title and both messages (systemMessage and userMessage) using AES-GCM encryption with randomly generated IVs
4. Calls the database store's `createConversation` function with the encrypted data
5. Returns the conversation ID

I also added a helper function `encryptField` that mirrors the existing `decryptField` function, generating a random 12-byte IV for each encryption operation (as required by AES-GCM).

The function is now available at:
```90:123:src/data/conversation.ts
export const createConversation = async ({
  title,
  systemMessage,
  userMessage,
  timezone
}: {
  title: string;
  systemMessage: Message;
  userMessage: Message;
  timezone: string;
}): Promise<{id: string}> => {
  // get the cached encryption key
  const encryptionKey = getEncryptionKey();

  // encrypt the title and messages
  const [titleEncrypted, systemMessageEncrypted, userMessageEncrypted] = await Promise.all([
    encryptField({ plaintext: title, encryptionKey }),
    encryptField({ plaintext: JSON.stringify(systemMessage), encryptionKey }),
    encryptField({ plaintext: JSON.stringify(userMessage), encryptionKey })
  ]);

  // create the encrypted conversation in the database
  const { id } = await createEncryptedConversation({
    conversation: {
      titleIv: titleEncrypted.iv,
      titleEncrypted: titleEncrypted.encryptedData,
      messagesEncrypted: [systemMessageEncrypted.encryptedData, userMessageEncrypted.encryptedData],
      messagesIv: [systemMessageEncrypted.iv, userMessageEncrypted.iv]
    },
    timezone
  });

  return { id };
}
```