import type { ColumnType, Insertable } from "kysely"
import type { EncryptedColumn, UUID } from "./helpers/types";
import { getDb } from "./helpers/database";
import { insertOne } from "./helpers/common-operations";

type Sender = 'system' | 'user' | 'assistant';

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

export async function insertEncryptedMessage(message: NewEncryptedMessage) {
  return insertOne({
    db: getDb(),
    table: 'messages',
    values: message
  });
}
