import { pgTable, serial, integer, uuid, bytea, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', { id: serial('id').primaryKey(), age: integer('age') });

export const conversations = pgTable('conversations', {
	id: uuid('id').defaultRandom().primaryKey(),
	iv: bytea('iv').notNull(),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
	titleEncrypted: bytea('titleEncrypted').notNull(),
	textEncrypted: bytea('textEncrypted').notNull()
});

