user: Update the `conversations` schema:

* Rename `iv` to `titleIv`.
* Rename `partsEncrypted` to `messagesEncrypted`
* Add a `bytea[]` column named `messagesIv`

agent: I've updated the schema and all related code:

1. **Schema updates** (`src/db/schema.ts`):
   - Renamed `iv` to `titleIv`
   - Renamed `partsEncrypted` to `messagesEncrypted`
   - Added `messagesIv` as a `bytea[]` column

2. **Type definition updates** (`src/db/conversation-store.ts`):
   - Updated `EncryptedConversation` type to use `titleIv`, `messagesEncrypted`, and `messagesIv`
   - Updated `getConversation` to handle the new field names and convert `messagesIv` from Buffer to Uint8Array
   - Updated `createConversation` to use the new field names when inserting

3. **Decryption logic updates** (`src/data/conversation.ts`):
   - Updated title decryption to use `titleIv` instead of `iv`
   - Updated message decryption to use `messagesEncrypted` and `messagesIv` (each message now uses its own IV from the `messagesIv` array)

All linter checks pass. You'll need to generate and run a database migration to apply these schema changes.