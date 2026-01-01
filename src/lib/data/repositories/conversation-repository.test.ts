import { expect, test, beforeAll } from 'vitest';
import { setupDatabase } from './helpers/database';
import { getAllEncryptedConversations, getEncryptedConversation, insertEncryptedConversation, updateEncryptedConversation } from './conversation-repository';

beforeAll(async () => {
  setupDatabase({
    url: 'http://localhost:8080',
    authorizationBearerToken: 'test-api-key',
  });
});

test('create 2 conversations, update one, get that one, get both', async () => {
  // Create 2 conversations
  const { id: id1 } = await insertEncryptedConversation({
    title: [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])],
    createdAt: 'now()',
    updatedAt: 'now()',
  });

  const { id: id2 } = await insertEncryptedConversation({
    title: [new Uint8Array([7, 8, 9]), new Uint8Array([10, 11, 12])],
    createdAt: 'now()',
    updatedAt: 'now()',
  });

  expect(id1).toBeDefined();
  expect(id2).toBeDefined();

  // Update one of them
  await updateEncryptedConversation(id1, {
    title: [new Uint8Array([7, 8, 9]), new Uint8Array([10, 11, 12])],
    updatedAt: 'now()',
  });

  // Get that one (the updated one)
  const retrieved = await getEncryptedConversation(id1);
  expect(retrieved).toBeDefined();
  expect(retrieved?.id).toBe(id1);
  expect(retrieved?.title).toEqual([new Uint8Array([7, 8, 9]), new Uint8Array([10, 11, 12])]);
  expect(retrieved?.createdAt).toBeInstanceOf(Date);
  expect(retrieved?.updatedAt).toBeInstanceOf(Date);

  // Get both
  const conversations = await getAllEncryptedConversations({
    limit: 50,
    orderByColumn: 'createdAt',
    orderByDirection: 'desc',
  });
  const conversationIds = conversations.map((conversation) => conversation.id);

  expect(conversationIds).toContain(id1);
  expect(conversationIds).toContain(id2);
});