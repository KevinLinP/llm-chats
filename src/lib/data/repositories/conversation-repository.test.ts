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
  const { id, createdAt, updatedAt, title } = await insertEncryptedConversation({
    title: [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])],
    createdAt: 'now()',
    updatedAt: 'now()',
  });

  expect(id).toBeDefined();
  expect(title).toEqual([new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])]);
  expect(createdAt).toBeInstanceOf(Date);
  expect(updatedAt).toBeInstanceOf(Date);
  expect(createdAt.getTime()).toBeGreaterThan(new Date('2025-01-01').getTime());
  expect(updatedAt.getTime()).toBeGreaterThan(new Date('2025-01-01').getTime());
});