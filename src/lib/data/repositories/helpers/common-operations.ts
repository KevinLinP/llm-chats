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

// Extract only table names that have an 'id' column
type TableWithIdName = {
  [K in keyof Database]: Database[K] extends { id: any } ? K : never;
}[keyof Database];

export async function get<TableName extends TableWithIdName>({
  tableName,
  id,
}: {
  tableName: TableWithIdName
  id: UUID
}): Promise<Selectable<Database[TableWithIdName]>> {
  return withErrorHandling(() =>
    getDb().selectFrom(tableName)
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirstOrThrow()
  );
}

export async function getAll<TableName extends keyof Database>({
  tableName,
  limit,
  orderByColumn,
  orderByDirection
}: {
  tableName: TableName
  limit: number,
  orderByColumn?: keyof Database[TableName] & string,
  orderByDirection?: 'asc' | 'desc',
}): Promise<Selectable<Database[TableName]>[]> {
  return withErrorHandling(async () => {
    let query = getDb().selectFrom(tableName).selectAll();
    if (orderByColumn) {
      // as any: union of table types creates incompatible orderBy signatures that TypeScript can't unify
      query = (query as any).orderBy(orderByColumn, orderByDirection ?? 'asc');
    }
    const result = await query.limit(limit).execute();
    // TypeScript can't narrow the union result back to the specific generic type
    return result as Selectable<Database[TableName]>[];
  });
}

