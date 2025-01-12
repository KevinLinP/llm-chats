import { onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { get } from 'svelte/store';

import { openAiStore } from '$lib/stores/api-stores.js';
import { selectedModelStore } from '$lib/stores/model-stores.js';
import { db } from './firestore';
import { decrypt, encrypt } from './utils/crypto';

export function subscribeThread({threadId, threadUpdated}) {
  const threadRef = doc(db, 'threads', threadId);

  const unsubscribe = onSnapshot(threadRef, async (doc) => {
    const decryptedThread = await decrypt({thread: doc});
		threadUpdated(decryptedThread);
  });

  return {unsubscribe};
}

export async function updateThread(thread) {
  const threadRef = doc(db, 'threads', thread.id);

  const { encrypted, iv } = await encrypt({
    plain: thread
  });

  updateDoc(threadRef, {
    encrypted,
    iv,
    updated: serverTimestamp()
  });
}

export async function sendMessage({
  thread,
  userMessage,
  systemMessage,
  setTempMessages,
  setStreamingAssistantMessage,
}) {
  const previousMessages = thread.messages || [];
  const newMessages= previousMessages.length
  ? [{ role: 'user', content: userMessage }]
  : [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ];
  setTempMessages(newMessages);
  const messages = [...previousMessages, ...newMessages];

	const openAi = get(openAiStore);

  const completion = await openAi.chat.completions.create({
		messages,
		stream: true,
		...get(selectedModelStore).completionCreateOptions
	});

  let assistantMessage = '';
  for await (const chunk of completion) {
		const choice = chunk.choices[0];
		const chunkContent = choice.delta.content;
		if (chunkContent) {
      assistantMessage = assistantMessage + chunkContent;
      setStreamingAssistantMessage(assistantMessage);
		}
		if (choice.finish_reason && choice.finish_reason != 'stop') {
      assistantMessage = assistantMessage + choice.finish_reason;
      setStreamingAssistantMessage(assistantMessage);
		}
	}

  await updateThread({
    ...thread,
    messages: [...messages, { role: 'assistant', content: assistantMessage.trim() }]
  });

  setStreamingAssistantMessage(null);
  setTempMessages(null);
}