import { pgTable, serial, integer, uuid, timestamp, customType } from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Uint8Array; driverData: Buffer }>({
	dataType: () => 'bytea'
});

export const conversations = pgTable('conversations', {
	id: uuid('id').defaultRandom().primaryKey(),
	iv: bytea('iv').notNull(),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
	titleEncrypted: bytea('titleEncrypted').notNull(),
	partsEncrypted: bytea('partsEncrypted').array().notNull()
});

