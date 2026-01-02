import { expect, test, beforeAll } from 'vitest';
import { setCryptoKey, encrypt, decrypt } from './cryptography';
import { testJwk } from '../test-fixtures';

beforeAll(async () => {
  await setCryptoKey(testJwk);
});

test('encrypts and decrypts text', async () => {
  const plainText = 'Hello, this is a test message!';
  
  const encrypted = await encrypt(plainText);
  const decrypted = await decrypt(encrypted);
  
  expect(decrypted).toBe(plainText);
});