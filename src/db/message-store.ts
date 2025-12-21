import { messages } from './schema';
import { eq, desc, max, sql } from 'drizzle-orm';
import { getDb } from './db';

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
	return results.map(message => ({
		id: message.id,
		conversationId: message.conversationId,
		index: message.index,
		senderEncrypted: message.senderEncrypted instanceof Uint8Array
			? message.senderEncrypted
			: new Uint8Array(message.senderEncrypted as ArrayBuffer),
		senderIv: message.senderIv instanceof Uint8Array
			? message.senderIv
			: new Uint8Array(message.senderIv as ArrayBuffer),
		textEncrypted: message.textEncrypted instanceof Uint8Array
			? message.textEncrypted
			: new Uint8Array(message.textEncrypted as ArrayBuffer),
		textIv: message.textIv instanceof Uint8Array
			? message.textIv
			: new Uint8Array(message.textIv as ArrayBuffer),
		modelIdEncrypted: message.modelIdEncrypted
			? (message.modelIdEncrypted instanceof Uint8Array
				? message.modelIdEncrypted
				: new Uint8Array(message.modelIdEncrypted as ArrayBuffer))
			: null,
		modelIdIv: message.modelIdIv
			? (message.modelIdIv instanceof Uint8Array
				? message.modelIdIv
				: new Uint8Array(message.modelIdIv as ArrayBuffer))
			: null,
		tokenUsageEncrypted: message.tokenUsageEncrypted
			? (message.tokenUsageEncrypted instanceof Uint8Array
				? message.tokenUsageEncrypted
				: new Uint8Array(message.tokenUsageEncrypted as ArrayBuffer))
			: null,
		tokenUsageIv: message.tokenUsageIv
			? (message.tokenUsageIv instanceof Uint8Array
				? message.tokenUsageIv
				: new Uint8Array(message.tokenUsageIv as ArrayBuffer))
			: null,
		createdAt: message.createdAt,
		updatedAt: message.updatedAt
	}));
};

export const insertMessage = async ({
	conversationId,
	message,
	timezone
}: {
	conversationId: string;
	message: {
		senderEncrypted: Uint8Array;
		senderIv: Uint8Array;
		textEncrypted: Uint8Array;
		textIv: Uint8Array;
		modelIdEncrypted?: Uint8Array;
		modelIdIv?: Uint8Array;
		tokenUsageEncrypted?: Uint8Array;
		tokenUsageIv?: Uint8Array;
	};
	timezone: string;
}): Promise<{ id: string; index: number }> => {
	const db = getDb();

	// Get the maximum index for this conversation to calculate the next index
	const [maxIndexResult] = await db
		.select({ maxIndex: max(messages.index) })
		.from(messages)
		.where(eq(messages.conversationId, conversationId));

	const nextIndex = maxIndexResult?.maxIndex !== null && maxIndexResult?.maxIndex !== undefined
		? maxIndexResult.maxIndex + 1
		: 0;

	// Use server-side timestamps with specified timezone
	const escapedTimezone = timezone.replace(/'/g, "''");
	const timestampExpr = sql.raw(`NOW() AT TIME ZONE '${escapedTimezone}'`);

	const [inserted] = await db
		.insert(messages)
		.values({
			conversationId,
			index: nextIndex,
			senderEncrypted: message.senderEncrypted,
			senderIv: message.senderIv,
			textEncrypted: message.textEncrypted,
			textIv: message.textIv,
			modelIdEncrypted: message.modelIdEncrypted ?? null,
			modelIdIv: message.modelIdIv ?? null,
			tokenUsageEncrypted: message.tokenUsageEncrypted ?? null,
			tokenUsageIv: message.tokenUsageIv ?? null,
			createdAt: timestampExpr,
			updatedAt: timestampExpr
		})
		.returning();

	return {
		id: inserted.id,
		index: inserted.index
	};
};

