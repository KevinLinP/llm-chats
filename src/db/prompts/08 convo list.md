user: Update EncryptedConversation.messagesEncrypted and EncryptedConversation.messagesIv types to allow undefined values. Then add a method that returns the 50 most recent createdAt `conversations`, but leaves those 2 message* fields out of the select portion of the query.

agent: I've updated the `EncryptedConversation` type to make `messagesEncrypted` and `messagesIv` optional (allowing undefined values), and added a new `listEncryptedConversations` method that returns the 50 most recent conversations ordered by `createdAt`, excluding those two fields from the select.

Here's what I changed:

1. **Updated `EncryptedConversation` type**: Made `messagesEncrypted` and `messagesIv` optional with `?`:
```5:13:src/db/conversation-store.ts
export type EncryptedConversation = {
	id: string;
	titleIv: Uint8Array;
	titleEncrypted: Uint8Array;
	messagesEncrypted?: Uint8Array[];
	messagesIv?: Uint8Array[];
	createdAt: Date;
	updatedAt: Date;
};
```

2. **Updated `fetchEncryptedConversation` return type**: Since this function always selects all fields, I made the return type explicitly require those fields to be present:
```15:15:src/db/conversation-store.ts
export const fetchEncryptedConversation = async (id: string): Promise<(EncryptedConversation & {
  messagesEncrypted: Uint8Array[];
  messagesIv: Uint8Array[];
}) | null> => {
```

3. **Updated `insertEncryptedConversation` parameter type**: Made those fields required for insert operations:
```54:60:src/db/conversation-store.ts
export const insertEncryptedConversation = async ({
  conversation,
  timezone
}: {
  conversation: Omit<EncryptedConversation, 'id' | 'createdAt' | 'updatedAt'> & {
    messagesEncrypted: Uint8Array[];
    messagesIv: Uint8Array[];
  };
  timezone: string;
}): Promise<{id: string}> => {
```

4. **Added `listEncryptedConversations` method**: This new method returns the 50 most recent conversations ordered by `createdAt`, excluding `messagesEncrypted` and `messagesIv` from the select:
```99:126:src/db/conversation-store.ts
export const listEncryptedConversations = async (): Promise<Omit<EncryptedConversation, 'messagesEncrypted' | 'messagesIv'>[]> => {
  const db = getDb();

  const results = await db
    .select({
      id: conversations.id,
      titleIv: conversations.titleIv,
      titleEncrypted: conversations.titleEncrypted,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt
    })
    .from(conversations)
    .orderBy(desc(conversations.createdAt))
    .limit(50);

  // Convert to Uint8Array (Neon HTTP driver may return ArrayBuffer or Uint8Array)
  return results.map(conversation => ({
    id: conversation.id,
    titleIv: conversation.titleIv instanceof Uint8Array 
      ? conversation.titleIv 
      : new Uint8Array(conversation.titleIv as ArrayBuffer),
    titleEncrypted: conversation.titleEncrypted instanceof Uint8Array
      ? conversation.titleEncrypted
      : new Uint8Array(conversation.titleEncrypted as ArrayBuffer),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  }));
}
```

The method properly handles the Uint8Array conversion (as the Neon HTTP driver may return ArrayBuffer) and returns conversations sorted by `createdAt` in descending order (most recent first), limited to 50 results.

user: Create a new type called FullEncryptedConversation that requires those two message* fields.

agent: I've created the `FullEncryptedConversation` type that extends `EncryptedConversation` and requires the `messagesEncrypted` and `messagesIv` fields. I've also updated the function signatures to use this cleaner type instead of intersection types.

Here's what I changed:

1. **Added `FullEncryptedConversation` type**: This type extends `EncryptedConversation` and requires the message fields:
```15:18:src/db/conversation-store.ts
export type FullEncryptedConversation = EncryptedConversation & {
	messagesEncrypted: Uint8Array[];
	messagesIv: Uint8Array[];
};
```

2. **Updated `fetchEncryptedConversation` return type**: Now uses `FullEncryptedConversation` instead of the intersection type:
```20:20:src/db/conversation-store.ts
export const fetchEncryptedConversation = async (id: string): Promise<FullEncryptedConversation | null> => {
```

3. **Updated `insertEncryptedConversation` parameter type**: Now uses `Omit<FullEncryptedConversation, ...>` for cleaner type definition:
```59:65:src/db/conversation-store.ts
export const insertEncryptedConversation = async ({
  conversation,
  timezone
}: {
  conversation: Omit<FullEncryptedConversation, 'id' | 'createdAt' | 'updatedAt'>;
  timezone: string;
}): Promise<{id: string}> => {
```

This provides a cleaner type system where:
- `EncryptedConversation` is the base type with optional message fields
- `FullEncryptedConversation` extends it and requires those fields
- Functions that always work with full conversations use `FullEncryptedConversation`
- Functions that work with partial data (like `listEncryptedConversations`) use `EncryptedConversation`

user: Actually, update EncryptedConversation so that those two message* fields are required, start a new type called PartialEncryptedConversation which is EncryptedConversation but with the two message* fields ommitted.

Then switch the current usages of EncryptedConversation to PartialEncryptedConversation, and FullEncryptedConversation to EncryptedConversation.

agent: I've refactored the types to make `EncryptedConversation` the primary type with required message fields, and created `PartialEncryptedConversation` for cases where those fields are omitted. I've also removed `FullEncryptedConversation` and updated all usages accordingly.

Here's what I changed:

1. **Updated `EncryptedConversation` type**: Made `messagesEncrypted` and `messagesIv` required (removed the `?`):
```5:13:src/db/conversation-store.ts
export type EncryptedConversation = {
	id: string;
	titleIv: Uint8Array;
	titleEncrypted: Uint8Array;
	messagesEncrypted: Uint8Array[];
	messagesIv: Uint8Array[];
	createdAt: Date;
	updatedAt: Date;
};
```

2. **Created `PartialEncryptedConversation` type**: This type omits the message fields from `EncryptedConversation`:
```15:15:src/db/conversation-store.ts
export type PartialEncryptedConversation = Omit<EncryptedConversation, 'messagesEncrypted' | 'messagesIv'>;
```

3. **Removed `FullEncryptedConversation`**: This type is no longer needed since `EncryptedConversation` now has required message fields.

4. **Updated `fetchEncryptedConversation` return type**: Changed from `FullEncryptedConversation` to `EncryptedConversation`:
```17:17:src/db/conversation-store.ts
export const fetchEncryptedConversation = async (id: string): Promise<EncryptedConversation | null> => {
```

5. **Updated `insertEncryptedConversation` parameter type**: Changed from `Omit<FullEncryptedConversation, ...>` to `Omit<EncryptedConversation, ...>`:
```56:62:src/db/conversation-store.ts
export const insertEncryptedConversation = async ({
  conversation,
  timezone
}: {
  conversation: Omit<EncryptedConversation, 'id' | 'createdAt' | 'updatedAt'>;
  timezone: string;
}): Promise<{id: string}> => {
```

6. **Updated `listEncryptedConversations` return type**: Changed from `Omit<EncryptedConversation, 'messagesEncrypted' | 'messagesIv'>[]` to `PartialEncryptedConversation[]`:
```101:101:src/db/conversation-store.ts
export const listEncryptedConversations = async (): Promise<PartialEncryptedConversation[]> => {
```

The new type system is cleaner and more intuitive:
- `EncryptedConversation` is the complete type with all required fields including messages
- `PartialEncryptedConversation` is used when message fields are omitted (like in list operations)
- Functions that work with full conversations use `EncryptedConversation`
- Functions that work with partial data use `PartialEncryptedConversation`