import { pgTable, serial, integer, uuid, timestamp, customType, index, uniqueIndex } from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({
	dataType: () => 'bytea'
});

export const conversations = pgTable('conversations', {
	id: uuid('id').defaultRandom().primaryKey(),
	titleIv: bytea('titleIv').notNull(),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
	titleEncrypted: bytea('titleEncrypted').notNull(),
}, (table) => ({
	createdAtIdx: index('conversations_createdAt_idx').on(table.createdAt),
	updatedAtIdx: index('conversations_updatedAt_idx').on(table.updatedAt)
}));

export const messages = pgTable('messages', {
	id: uuid('id').defaultRandom().primaryKey(),
	conversationId: uuid('conversationId').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
	index: integer('index').notNull(),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
	senderEncrypted: bytea('senderEncrypted').notNull(),
	senderIv: bytea('senderIv').notNull(),
	textEncrypted: bytea('textEncrypted'),
	textIv: bytea('textIv'),
	chunksEncrypted: bytea('chunksEncrypted'),
	chunksIv: bytea('chunksIv')
}, (table) => ({
	conversationIdIndexIdx: uniqueIndex('messages_conversationId_index_idx').on(table.conversationId, table.index)
}));

