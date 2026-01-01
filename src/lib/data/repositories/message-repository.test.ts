import { expect, test, beforeAll } from 'vitest';
import { setupDatabase } from './helpers/database';
import { insertEncryptedConversation } from './conversation-repository';
import { insertEncryptedMessage, getEncryptedMessages } from './message-repository';

beforeAll(async () => {
  setupDatabase({
    url: 'http://localhost:8080',
    authorizationBearerToken: 'test-api-key',
  });
});

test('create a conversation, insert 2 messages on that conversation, then get both those messages', async () => {
  // Create a conversation
  const { id: conversationId } = await insertEncryptedConversation({
    title: [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])],
    createdAt: 'now()',
    updatedAt: 'now()',
  });

  expect(conversationId).toBeDefined();

  // Insert 2 messages on that conversation
  const { id: messageId1 } = await insertEncryptedMessage({
    conversationId,
    index: 0,
    sender: [new Uint8Array([10, 20, 30]), new Uint8Array([40, 50, 60])],
    createdAt: [new Uint8Array([100, 200, 300]), new Uint8Array([400, 500, 600])],
    text: [new Uint8Array([1, 1, 1]), new Uint8Array([2, 2, 2])],
    chunks: null,
  });

  const { id: messageId2 } = await insertEncryptedMessage({
    conversationId,
    index: 1,
    sender: [new Uint8Array([11, 21, 31]), new Uint8Array([41, 51, 61])],
    createdAt: [new Uint8Array([101, 201, 301]), new Uint8Array([401, 501, 601])],
    text: [new Uint8Array([3, 3, 3]), new Uint8Array([4, 4, 4])],
    chunks: null,
  });

  expect(messageId1).toBeDefined();
  expect(messageId2).toBeDefined();

  // Get both messages
  const messages = await getEncryptedMessages({ conversationId });

  expect(messages).toHaveLength(2);
  expect(messages[0].id).toBe(messageId1);
  expect(messages[0].index).toBe(0);
  expect(messages[1].id).toBe(messageId2);
  expect(messages[1].index).toBe(1);
});

