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
	textEncrypted: Uint8Array | null;
	textIv: Uint8Array | null;
	chunksEncrypted: Uint8Array | null;
	chunksIv: Uint8Array | null;
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
		textEncrypted: toUint8ArrayOrNull(message.textEncrypted),
		textIv: toUint8ArrayOrNull(message.textIv),
		chunksEncrypted: toUint8ArrayOrNull(message.chunksEncrypted),
		chunksIv: toUint8ArrayOrNull(message.chunksIv),
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
		textEncrypted?: Uint8Array | null;
		textIv?: Uint8Array | null;
		chunksEncrypted?: Uint8Array | null;
		chunksIv?: Uint8Array | null;
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
			textEncrypted: message.textEncrypted ?? null,
			textIv: message.textIv ?? null,
			chunksEncrypted: message.chunksEncrypted ?? null,
			chunksIv: message.chunksIv ?? null,
			createdAt: timestampExpr,
			updatedAt: timestampExpr
		})
		.returning();

	return {
		id: inserted.id,
		index: inserted.index
	};
};

