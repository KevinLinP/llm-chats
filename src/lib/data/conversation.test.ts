import { expect, test, beforeAll } from 'vitest';
import { setupDatabase } from './repositories/helpers/database';
import { setCryptoKey } from './helpers/cryptography';
import { createConversation, getConversation, listConversations } from './conversation';
import { testJwk } from './test-fixtures';

beforeAll(async () => {
  setupDatabase({
    url: 'http://localhost:8080',
    authorizationBearerToken: 'test-api-key',
  });
  await setCryptoKey(testJwk);
});

test('create 2 conversations, get the first one, and list to get both', async () => {
  // Create 2 conversations
  const conversation1 = await createConversation({ title: 'First Conversation' });
  const conversation2 = await createConversation({ title: 'Second Conversation' });

  expect(conversation1.id).toBeDefined();
  expect(conversation2.id).toBeDefined();
  expect(conversation1.title).toBe('First Conversation');
  expect(conversation2.title).toBe('Second Conversation');

  // Get the first one
  const retrieved = await getConversation({ id: conversation1.id });
  expect(retrieved).not.toBeNull();
  expect(retrieved?.id).toBe(conversation1.id);
  expect(retrieved?.title).toBe('First Conversation');
  expect(retrieved?.createdAt).toBeInstanceOf(Date);
  expect(retrieved?.updatedAt).toBeInstanceOf(Date);

  // List to get both
  const conversations = await listConversations();
  const conversationIds = conversations.map((conversation) => conversation.id);

  expect(conversationIds).toContain(conversation1.id);
  expect(conversationIds).toContain(conversation2.id);
  expect(conversations.length).toBeGreaterThanOrEqual(2);
});

