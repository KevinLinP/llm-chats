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
  const { id, createdAt, updatedAt } = await insertEncryptedConversation({
    title: [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])],
    createdAt: { date: new Date('2026-01-01'), timezone: 'Europe/Madrid' },
    updatedAt: {timezone: 'Europe/Berlin'},
  });

  expect(id).toBeDefined();
  expect(createdAt).toEqual({ date: new Date('2026-01-01'), timezone: 'Europe/Madrid' });
  expect(updatedAt.timezone).toEqual('Europe/Berlin');
  expect(updatedAt.date).toBeInstanceOf(Date);
  expect(updatedAt.date.getTime()).toBeGreaterThan(new Date('2025-01-01').getTime());
});