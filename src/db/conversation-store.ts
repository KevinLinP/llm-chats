import { conversations } from './schema';
import { eq, sql, desc } from 'drizzle-orm';
import { getDb } from './db';

export type EncryptedConversation = {
	id: string;
	titleIv: Uint8Array;
	titleEncrypted: Uint8Array;
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
  
  return {
    id: conversation.id,
    titleIv,
    titleEncrypted,
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

  const [inserted] = await db
    .insert(conversations)
    .values({
      titleIv: conversation.titleIv,
      titleEncrypted: conversation.titleEncrypted,
      createdAt: timestampExpr,
      updatedAt: timestampExpr
    })
    .returning();

  return {
    id: inserted.id
  };
}

export const listEncryptedConversations = async (): Promise<EncryptedConversation[]> => {
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
  return results.map((conversation: typeof results[0]) => ({
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

