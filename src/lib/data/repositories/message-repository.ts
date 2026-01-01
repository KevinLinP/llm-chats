import type { ColumnType, Insertable } from "kysely"
import type { EncryptedColumn, UUID } from "./helpers/types";
import { insert, withErrorHandling } from "./helpers/common-operations";
import { getDb } from "./helpers/database";

export interface EncryptedMessageTable {
  id: ColumnType<UUID, never, never>
  createdAt: ColumnType<EncryptedColumn, EncryptedColumn, never>
  conversationId: ColumnType<UUID, UUID, never>
  index: ColumnType<number, number, never>
  sender: ColumnType<EncryptedColumn, EncryptedColumn, never>
  text: ColumnType<EncryptedColumn | null, EncryptedColumn | null, never>
  chunks: ColumnType<EncryptedColumn | null, EncryptedColumn | null, never>
}
export type NewEncryptedMessage = Insertable<EncryptedMessageTable>;

const tableName = 'messages';

export async function insertEncryptedMessage(message: NewEncryptedMessage) {
  return insert({
    tableName,
    values: message
  });
}

export async function getEncryptedMessages( { conversationId }: { conversationId: UUID}) {
  return withErrorHandling(async () => {
    return getDb().selectFrom(tableName).selectAll().where('conversationId', '=', conversationId).orderBy('index', 'asc').execute();
  });
};