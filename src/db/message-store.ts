import { messages } from './schema';
import { eq, sql } from 'drizzle-orm';
import { getDb } from './db';
import { toUint8Array, toUint8ArrayOrNull } from './buffer-utils';

export type EncryptedMessage = {
	id: string;
	conversationId: string;
	index: number;
	senderEncrypted: Uint8Array;
	senderIv: Uint8Array;
	textEncrypted: Uint8Array;
	textIv: Uint8Array;
	modelIdEncrypted: Uint8Array | null;
	modelIdIv: Uint8Array | null;
	tokenUsageEncrypted: Uint8Array | null;
	tokenUsageIv: Uint8Array | null;
	citationsEncrypted: Uint8Array | null;
	citationsIv: Uint8Array | null;
	createdAt: Date;
	updatedAt: Date;
};

export const listMessages = async ({ conversationId }: { conversationId: string }): Promise<EncryptedMessage[]> => {
	const db = getDb();

	const results = await db
		.select()
		.from(messages)
		.where(eq(messages.conversationId, conversationId))
		.orderBy(messages.index);

	// Convert to Uint8Array (Neon HTTP driver may return ArrayBuffer or Uint8Array)
	return results.map((message: typeof results[0]) => ({
		id: message.id,
		conversationId: message.conversationId,
		index: message.index,
		senderEncrypted: toUint8Array(message.senderEncrypted),
		senderIv: toUint8Array(message.senderIv),
		textEncrypted: toUint8Array(message.textEncrypted),
		textIv: toUint8Array(message.textIv),
		modelIdEncrypted: toUint8ArrayOrNull(message.modelIdEncrypted),
		modelIdIv: toUint8ArrayOrNull(message.modelIdIv),
		tokenUsageEncrypted: toUint8ArrayOrNull(message.tokenUsageEncrypted),
		tokenUsageIv: toUint8ArrayOrNull(message.tokenUsageIv),
		citationsEncrypted: toUint8ArrayOrNull(message.citationsEncrypted),
		citationsIv: toUint8ArrayOrNull(message.citationsIv),
		createdAt: message.createdAt,
		updatedAt: message.updatedAt
	}));
};

export const insertMessage = async ({
	conversationId,
	index,
	message,
	timezone
}: {
	conversationId: string;
	index: number;
	message: {
		senderEncrypted: Uint8Array;
		senderIv: Uint8Array;
		textEncrypted: Uint8Array;
		textIv: Uint8Array;
		modelIdEncrypted?: Uint8Array;
		modelIdIv?: Uint8Array;
		tokenUsageEncrypted?: Uint8Array;
		tokenUsageIv?: Uint8Array;
		citationsEncrypted?: Uint8Array;
		citationsIv?: Uint8Array;
	};
	timezone: string;
}): Promise<{ id: string; index: number }> => {
	const db = getDb();

	// Use server-side timestamps with specified timezone
	const escapedTimezone = timezone.replace(/'/g, "''");
	const timestampExpr = sql.raw(`NOW() AT TIME ZONE '${escapedTimezone}'`);

	const [inserted] = await db
		.insert(messages)
		.values({
			conversationId,
			index,
			senderEncrypted: message.senderEncrypted,
			senderIv: message.senderIv,
			textEncrypted: message.textEncrypted,
			textIv: message.textIv,
			modelIdEncrypted: message.modelIdEncrypted ?? null,
			modelIdIv: message.modelIdIv ?? null,
			tokenUsageEncrypted: message.tokenUsageEncrypted ?? null,
			tokenUsageIv: message.tokenUsageIv ?? null,
			citationsEncrypted: message.citationsEncrypted ?? null,
			citationsIv: message.citationsIv ?? null,
			createdAt: timestampExpr,
			updatedAt: timestampExpr
		})
		.returning();

	return {
		id: inserted.id,
		index: inserted.index
	};
};

