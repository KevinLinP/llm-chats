import { Kysely, sql } from 'kysely'

// PostgreSQL 18+

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createTable('conversations')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuidv4()`))
    .addColumn('title', sql`bytea[]`, (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute()

  await db.schema.createIndex('conversations_created_at_idx').on('conversations').columns(['created_at']).execute()
  await db.schema.createIndex('conversations_updated_at_idx').on('conversations').columns(['updated_at']).execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('conversations_created_at_idx').execute()
  await db.schema.dropIndex('conversations_updated_at_idx').execute()
  await db.schema.dropTable('conversations').execute()
}