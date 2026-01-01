import { getDb } from './helpers/database'
import type { ColumnType, Insertable, Selectable, Updateable } from "kysely"
import type { EncryptedColumn, UUID } from './helpers/types';
import { get, getAll, insert, withErrorHandling } from './helpers/common-operations';

export interface ConversationTable {
  id: ColumnType<UUID, never, never>
  createdAt: ColumnType<Date, 'now()', never>
  updatedAt: ColumnType<Date, 'now()', 'now()'>
  title: EncryptedColumn
}
export type EncryptedConversation = Selectable<ConversationTable>;
export type NewEncryptedConversation = Insertable<ConversationTable>;
export type EncryptedConversationUpdate = Updateable<ConversationTable>;

const tableName = 'conversations';

export async function insertEncryptedConversation(conversation: NewEncryptedConversation)  {
  return insert({
    tableName,
    values: conversation
  });
};

export async function getEncryptedConversation(id: UUID) {
  return get({
    tableName,
    id: id
  });
};

export async function getAllEncryptedConversations({ limit, orderByColumn, orderByDirection }: { limit: number, orderByColumn: 'createdAt' | 'updatedAt', orderByDirection: 'asc' | 'desc' }) {
  return getAll({
    tableName: 'conversations',
    limit,
    orderByColumn,
    orderByDirection
  });
};

export async function updateEncryptedConversation(id: UUID, conversation: EncryptedConversationUpdate) {
  return withErrorHandling(
   () => {
    return getDb().updateTable('conversations')
      .where('id', '=', id)
      .set(conversation)
      .executeTakeFirstOrThrow()
  });
};