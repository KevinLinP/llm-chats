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

export const fetchEncryptedConversation = async (id: string): Promise<EncryptedConversation | null> => {
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

  // Convert to Uint8Array (Neon HTTP driver may return ArrayBuffer or Uint8Array)
  const titleIv = conversation.titleIv instanceof Uint8Array 
    ? conversation.titleIv 
    : new Uint8Array(conversation.titleIv as ArrayBuffer);
  const titleEncrypted = conversation.titleEncrypted instanceof Uint8Array
    ? conversation.titleEncrypted
    : new Uint8Array(conversation.titleEncrypted as ArrayBuffer);
  const messagesEncrypted = conversation.messagesEncrypted.map(item =>
    item instanceof Uint8Array ? item : new Uint8Array(item as ArrayBuffer)
  );
  const messagesIv = conversation.messagesIv.map(item =>
    item instanceof Uint8Array ? item : new Uint8Array(item as ArrayBuffer)
  );
  
  return {
    id: conversation.id,
    titleIv,
    titleEncrypted,
    messagesEncrypted,
    messagesIv,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  };
}

export const insertEncryptedConversation = async ({
  conversation,
  timezone
}: {
  conversation: Omit<EncryptedConversation, 'id' | 'createdAt' | 'updatedAt'>;
  timezone: string;
}): Promise<{id: string}> => {
  const db = getDb();

  // Use server-side timestamps with specified timezone
  // PostgreSQL requires timezone to be a quoted string literal
  // Note: timezone should be a valid PostgreSQL timezone name (e.g., 'UTC', 'America/New_York')
  // Escape single quotes in timezone to prevent SQL injection
  const escapedTimezone = timezone.replace(/'/g, "''");
  const timestampExpr = sql.raw(`NOW() AT TIME ZONE '${escapedTimezone}'`);

  // Convert bytea arrays to PostgreSQL array format using sql template
  // PostgreSQL bytea arrays need to be cast properly
  // Uint8Array works directly with Neon HTTP driver
  const messagesEncryptedArray = sql`ARRAY[${sql.join(
    conversation.messagesEncrypted.map(arr => sql`${arr}::bytea`),
    sql`, `
  )}]::bytea[]`;
  const messagesIvArray = sql`ARRAY[${sql.join(
    conversation.messagesIv.map(arr => sql`${arr}::bytea`),
    sql`, `
  )}]::bytea[]`;

  const [inserted] = await db
    .insert(conversations)
    .values({
      titleIv: conversation.titleIv,
      titleEncrypted: conversation.titleEncrypted,
      messagesEncrypted: messagesEncryptedArray,
      messagesIv: messagesIvArray,
      createdAt: timestampExpr,
      updatedAt: timestampExpr
    })
    .returning();

  return {
    id: inserted.id
  };
}

