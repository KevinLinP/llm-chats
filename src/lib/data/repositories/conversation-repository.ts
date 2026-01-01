import { getDb } from './database'
import type { ColumnType, Insertable } from "kysely"

export interface ConversationTable {
  id: ColumnType<string, undefined, undefined>
  createdAt: ColumnType<Date, 'now()', 'now()'>
  updatedAt: ColumnType<Date, 'now()', 'now()'>
  title: Uint8Array[]
}
export type NewEncryptedConversation = Insertable<ConversationTable>;

export async function insertEncryptedConversation(conversation: NewEncryptedConversation)  {
  try {
    return await getDb().insertInto('conversations')
      .values(conversation)
      .returningAll()
      .executeTakeFirstOrThrow()
  } catch (error) {
    console.error(error);
    throw error;
  }
};