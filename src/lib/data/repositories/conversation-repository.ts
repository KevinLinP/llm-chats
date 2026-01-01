import { getDb } from './database'
import type { ColumnType, Insertable } from "kysely"
import type { DateWithTimezone, DateWithTimezoneInput } from './types'

export interface ConversationTable {
  id: ColumnType<string, never, never>
  createdAt: ColumnType<DateWithTimezone, DateWithTimezoneInput, never>
  updatedAt: ColumnType<DateWithTimezone, DateWithTimezoneInput, DateWithTimezoneInput>
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