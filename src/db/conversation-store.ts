import { conversations } from './schema';
import { eq, sql } from 'drizzle-orm';
import { getDb } from './db';

export type EncryptedConversation = {
	id: string;
	titleIv: Uint8Array;
	titleEncrypted: Uint8Array;
	messagesEncrypted: Uint8Array[];
	messagesIv: Uint8Array[];
	createdAt: Date;
	updatedAt: Date;
};

export const getConversation = async (id: string): Promise<EncryptedConversation | null> => {
  const db = getDb();

  // fetch the conversation from the database
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);

  if (!conversation) {
    return null;
  }

  // Convert Buffer to Uint8Array (postgres-js returns bytea as Buffer)
  const titleIvBuffer = conversation.titleIv as unknown as ArrayBuffer;
  const titleBuffer = conversation.titleEncrypted as unknown as ArrayBuffer;
  const messagesEncryptedArray = conversation.messagesEncrypted as unknown as ArrayBuffer[];
  const messagesIvArray = conversation.messagesIv as unknown as ArrayBuffer[];
  
  return {
    id: conversation.id,
    titleIv: new Uint8Array(titleIvBuffer),
    titleEncrypted: new Uint8Array(titleBuffer),
    messagesEncrypted: messagesEncryptedArray.map(buffer => new Uint8Array(buffer)),
    messagesIv: messagesIvArray.map(buffer => new Uint8Array(buffer)),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  };
}

export const createConversation = async ({
  conversation,
  timezone
}: {
  conversation: Omit<EncryptedConversation, 'id' | 'createdAt' | 'updatedAt'>;
  timezone: string;
}): Promise<{id: string}> => {
  const db = getDb();

  // Convert Uint8Array to Buffer for database storage
  const titleIvBuffer = Buffer.from(conversation.titleIv);
  const titleBuffer = Buffer.from(conversation.titleEncrypted);
  const messagesEncryptedBuffers = conversation.messagesEncrypted.map(arr => Buffer.from(arr));
  const messagesIvBuffers = conversation.messagesIv.map(arr => Buffer.from(arr));

  // Use server-side timestamps with specified timezone
  // PostgreSQL requires timezone to be a quoted string literal
  // Note: timezone should be a valid PostgreSQL timezone name (e.g., 'UTC', 'America/New_York')
  // Using template literal interpolation - timezone is validated to be a standard name
  const timestampExpr = sql`NOW() AT TIME ZONE '${timezone}'`;

  const [inserted] = await db
    .insert(conversations)
    .values({
      titleIv: titleIvBuffer,
      titleEncrypted: titleBuffer,
      messagesEncrypted: messagesEncryptedBuffers,
      messagesIv: messagesIvBuffers,
      createdAt: timestampExpr,
      updatedAt: timestampExpr
    })
    .returning();

  return {
    id: inserted.id
  };
}

