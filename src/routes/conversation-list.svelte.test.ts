import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import ConversationList from './ConversationList.svelte';
import { setConversations } from '$lib/stores/conversation-store.svelte';

test('Component', async () => {
  setConversations([
    {
      id: '1',
      title: 'Conversation 1',
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Conversation 2',
      createdAt: new Date(),
    },
  ]);

	render(ConversationList);

  expect(screen.getByText('Conversation 1')).toBeTruthy();
  expect(screen.getByText('Conversation 2')).toBeTruthy();
});