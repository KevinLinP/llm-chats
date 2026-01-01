import { getDb } from './database'
import type { ColumnType, Insertable, Updateable } from "kysely"

// unique 'branded' type
export type UUID = string & { readonly __brand: unique symbol }

async function withErrorHandling<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export interface ConversationTable {
  id: ColumnType<UUID, undefined, undefined>
  createdAt: ColumnType<Date, 'now()', 'now()'>
  updatedAt: ColumnType<Date, 'now()', 'now()'>
  title: Uint8Array[]
}
export type NewEncryptedConversation = Insertable<ConversationTable>;
export type EncryptedConversationUpdate = Updateable<ConversationTable>;

export async function insertEncryptedConversation(conversation: NewEncryptedConversation)  {
  return withErrorHandling(() => {
    return getDb().insertInto('conversations')
      .values(conversation)
      .returningAll()
      .executeTakeFirstOrThrow()
  });
};

export async function getEncryptedConversation(id: UUID) {
  return withErrorHandling(() => {
    return getDb().selectFrom('conversations')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirstOrThrow()
  });
};

export async function getAllEncryptedConversations({ limit, orderByColumn, orderByDirection }: { limit: number, orderByColumn: 'createdAt' | 'updatedAt', orderByDirection: 'asc' | 'desc' }) {
  return withErrorHandling(() => {
    return getDb().selectFrom('conversations')
      .selectAll()
      .orderBy(orderByColumn, orderByDirection)
      .limit(limit)
      .execute()
  });
};

export async function updateEncryptedConversation(id: UUID, conversation: EncryptedConversationUpdate) {
  return withErrorHandling(() => {
    return getDb().updateTable('conversations')
      .where('id', '=', id)
      .set(conversation)
      .executeTakeFirstOrThrow()
  });
};