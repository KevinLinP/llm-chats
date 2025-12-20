user: Like db/db.ts, create a encryptionKey.ts with a setupEncryptionKey(), and a getEncryptionKey(). Then remove jwkEncryptionKey as a parameter from conversation.ts and have it use getEncryptionKey instead.

agent: I've created `src/data/encryptionKey.ts` following the same pattern as `db/db.ts`:

- `setupEncryptionKey(jwk: JsonWebKey)` - Imports the JWK as a CryptoKey and caches it. Returns the cached key if it already exists, or throws an error if trying to set up with a different key.
- `getEncryptionKey()` - Returns the cached CryptoKey, or throws an error if the key hasn't been set up yet.

I've also updated `conversation.ts`:
- Removed the `jwkEncryptionKey` parameter from `getConversation()`
- Updated it to use `getEncryptionKey()` instead of importing the key each time
- Removed the key import logic since it's now handled by the cached module

The encryption key is now cached and managed centrally, similar to how the database connection is handled.