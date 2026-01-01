import { expect, test, beforeAll } from 'vitest';
import { setupDatabase } from './database';
import { insertEncryptedConversation } from './conversation-repository';

beforeAll(async () => {
  setupDatabase({
    url: 'http://localhost:8080',
    authorizationBearerToken: 'test-api-key',
  });
});

test('create', async () => {
  const { id } = await insertEncryptedConversation({
    title: [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  expect(id).toBeDefined();
});