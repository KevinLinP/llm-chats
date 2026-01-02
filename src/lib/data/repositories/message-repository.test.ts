import { expect, test, beforeAll } from 'vitest';
import { setupDatabase } from './helpers/database';
import { insertEncryptedConversation } from './conversation-repository';
import { insertEncryptedMessage, getEncryptedMessages } from './message-repository';
import { encrypted } from '../test-fixtures';

beforeAll(async () => {
  setupDatabase({
    url: 'http://localhost:8080',
    authorizationBearerToken: 'test-api-key',
  });
});

test('create a conversation, insert 2 messages on that conversation, then get both those messages', async () => {
  // Create a conversation
  const { id: conversationId } = await insertEncryptedConversation({
    title: encrypted,
    createdAt: 'now()',
    updatedAt: 'now()',
  });

  expect(conversationId).toBeDefined();

  // Insert 2 messages on that conversation
  const { id: messageId1 } = await insertEncryptedMessage({
    conversationId,
    index: 0,
    sender: encrypted,
    createdAt: encrypted,
    text: encrypted,
    chunks: null,
  });

  const { id: messageId2 } = await insertEncryptedMessage({
    conversationId,
    index: 1,
    sender: encrypted,
    createdAt: encrypted,
    text: encrypted,
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

