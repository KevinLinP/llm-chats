import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { setDb } from '../db/db';
import { setupEncryptionKey } from './encryption-key';
import { createConversation, getConversation } from './conversation';
import { insertMessage, listMessages, type Message } from './message';
import { getDb } from '../db/db';
import { conversations } from '../db/schema';
import * as schema from '../db/schema';

describe('conversation', () => {
	// Test database URL - adjust as needed for your local setup
	const testDatabaseUrl = 'postgresql://localhost/llm_chats_test';

	// Test encryption key (AES-GCM requires 128, 192, or 256-bit keys)
	// This is a test key - in production, use a proper key
	const testJwk: JsonWebKey = {
		"alg": "A256GCM",
		"ext": true,
		"k": "kISGaHbZ04MPu8Gf8eFDiJVPTwhwb9Rxp-MQlpr7_mg",
		"key_ops": [
			"encrypt",
			"decrypt"
		],
		"kty": "oct"
	}

	let postgresClient: ReturnType<typeof postgres>;

	beforeAll(async () => {
		// Set up database connection using postgres.js for local testing
		postgresClient = postgres(testDatabaseUrl);
		const db = drizzle(postgresClient, { schema });
		setDb(db);

		// Set up encryption key
		await setupEncryptionKey(testJwk);
	});

	afterAll(async () => {
		// Clean up: delete all test conversations
		const db = getDb();
		await db.delete(conversations);
		
		// Close the postgres connection
		await postgresClient.end();
	});

	it('createConversation and getConversation', async () => {
		const systemMessage: Message = {
			sender: 'system',
			text: 'You are a helpful assistant.'
		};

		const userMessage: Message = {
			sender: 'user',
			text: 'Hello, how are you?',
			modelId: 'gpt-4',
			tokenUsage: {
				input: 10,
				output: 20
			}
		};

		// Create a conversation
		const { id } = await createConversation({
			title: 'Test Conversation',
			timezone: 'UTC'
		});

		// Create messages separately
		await insertMessage({
			conversationId: id,
			message: systemMessage,
			timezone: 'UTC'
		});

		await insertMessage({
			conversationId: id,
			message: userMessage,
			timezone: 'UTC'
		});

		// Retrieve conversation
		const retrieved = await getConversation({ id });

		expect(retrieved).not.toBeNull();
		expect(retrieved?.id).toBe(id);
		expect(retrieved?.title).toBe('Test Conversation');
		expect(retrieved?.createdAt).toBeInstanceOf(Date);
		expect(retrieved?.updatedAt).toBeInstanceOf(Date);

		// Retrieve messages separately
		const messages = await listMessages({ conversationId: id });
		expect(messages).toHaveLength(2);
		expect(messages[0].sender).toBe(systemMessage.sender);
		expect(messages[0].text).toBe(systemMessage.text);
		expect(messages[1].sender).toBe(userMessage.sender);
		expect(messages[1].text).toBe(userMessage.text);
		expect(messages[1].modelId).toBe(userMessage.modelId);
		expect(messages[1].tokenUsage).toEqual(userMessage.tokenUsage);
	});
});

