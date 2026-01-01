import { getDb } from './database'
import type { ColumnType, Insertable } from "kysely"

export interface ConversationTable {
  id: ColumnType<string, never, never>
  createdAt: ColumnType<Date, Date, never>
  updatedAt: Date
  title: Uint8Array[]
}
export type NewEncryptedConversation = Insertable<ConversationTable>;

export async function insertEncryptedConversation(conversation: NewEncryptedConversation)  {
  return await getDb().insertInto('conversations')
    .values(conversation)
    .returningAll()
    .executeTakeFirstOrThrow()
};