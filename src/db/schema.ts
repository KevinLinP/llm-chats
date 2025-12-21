import { pgTable, serial, integer, uuid, timestamp, customType } from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({
	dataType: () => 'bytea'
});

export const conversations = pgTable('conversations', {
	id: uuid('id').defaultRandom().primaryKey(),
	titleIv: bytea('titleIv').notNull(),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
	titleEncrypted: bytea('titleEncrypted').notNull(),
	messagesEncrypted: bytea('messagesEncrypted').array().notNull(),
	messagesIv: bytea('messagesIv').array().notNull()
});

