user: In data/conversations.ts, add a `getConversation` function that takes a string `id`, and a `jwkEncryptionKey` object. This method then uses drizzle to fetch the data, decrypts the title and text using the `iv` field and the `jwkEncryptionKey`, and returns the Conversation.

agent: I've implemented the `getConversation` function in `src/data/conversation.ts`. The function:

1. Fetches the conversation from the database using Drizzle ORM with a where clause on the id
2. Imports the JWK encryption key using the Web Crypto API
3. Converts the bytea fields (iv, titleEncrypted, textEncrypted) from Buffer to Uint8Array
4. Decrypts both the title and text using AES-GCM with the IV and encryption key
5. Returns a Conversation object with the decrypted title and text

The implementation follows the same encryption pattern used in the previous version of the codebase, using AES-GCM with a 12-byte IV for decryption.

user: Dedup the decryption code for the individual fields in conversation.ts

agent: I've deduplicated the decryption code by creating a `decryptField` helper function that handles the decryption of a single encrypted field. The function takes the encrypted data as a parameter and returns the decrypted string. Both the title and text fields now use this helper function, and I've also optimized it to decrypt both fields in parallel using `Promise.all()` for better performance.

user: Move decryptField outside of the method, but don't export it.

agent: I've moved `decryptField` outside of the `getConversation` method. The function is now defined at the module level (not exported) and accepts `iv` and `encryptionKey` as parameters instead of accessing them from the closure. The calls to `decryptField` have been updated to pass these parameters explicitly.

user: Update decryptField to not use positional parameters. Have it take an object instead.

agent: I've updated `decryptField` to accept an object parameter instead of positional parameters. The function now takes `{ encryptedData, iv, encryptionKey }` as a single object parameter, and all calls to `decryptField` have been updated to pass these values as an object.