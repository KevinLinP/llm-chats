import { Kysely, sql } from 'kysely'

// PostgreSQL 18+

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('conversations')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('title', sql`bytea[]`, (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull(),
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull(),
    )
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('conversations').execute()
}