import { expect, test } from 'vitest';
import { createConversation, getConversation } from './conversation';

test('create and read', async () => {
  const { id } = createConversation({
    title: 'test conversation',
  });

  const conversation = getConversation(id);

  expect(conversation?.title).toBe('test conversation');
});