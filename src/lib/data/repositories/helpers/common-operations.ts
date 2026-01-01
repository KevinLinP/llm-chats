import type { InsertObject, Selectable, SelectQueryBuilder } from "kysely";
import { getDb } from "./database";
import type { Database } from "./database";
import type { UUID } from "./types";

export async function withErrorHandling<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function insert<TableName extends keyof Database>({
  tableName,
  values,
}: {
  tableName: TableName
  values: InsertObject<Database, TableName>
}): Promise<Selectable<Database[TableName]>> {
  return withErrorHandling(() =>
    getDb()
      .insertInto(tableName)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow()
  );
}
