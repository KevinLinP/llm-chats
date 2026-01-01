import { Kysely, sql } from 'kysely'

// PostgreSQL 18+

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createTable('messages')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuidv4()`))
    .addColumn('created_at', sql`bytea[]`, (col) => col.notNull())
    .addColumn('conversation_id', 'uuid', (col) => col.notNull().references('conversations.id').onDelete('cascade'))
    .addColumn('index', 'integer', (col) => col.notNull())
    .addColumn('sender', sql`bytea[]`, (col) => col.notNull())
    .addColumn('text', sql`bytea[]`)
    .addColumn('chunks', sql`bytea[]`)
    .execute()

    await db.schema.createIndex('messages_conversation_id_index').on('messages').columns(['conversation_id', 'index asc']).unique().execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('messages_conversation_id_index').execute();
  await db.schema.dropTable('messages').execute()
}