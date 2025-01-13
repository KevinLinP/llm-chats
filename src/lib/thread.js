import { addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

import { getOpenAi } from '$lib/open-ai';
import { availableModels } from '$lib/ai-models';
import { db } from '$lib/firestore';
import { decrypt, encrypt } from '$lib/crypto';

export async function createThread() {
  const plain = { title: null };
  const { encrypted, iv } = await encrypt({ plain });

  const ref = await addDoc(
    collection(db, 'threads'),
    {
      iv,
      encrypted,
      created: serverTimestamp(),
      updated: serverTimestamp()
    }
  );

  return {
    threadId: ref.id,
  }
}

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

export async function deleteThread(thread) {
  const threadRef = doc(db, 'threads', thread.id);
  await deleteDoc(threadRef);
}

export async function sendMessage({
  thread,
  userMessage,
  systemMessage,
  selectedModelId,
  setTempMessages,
  setStreamingAssistantMessage,
}) {
  const openAi = await getOpenAi();
  if (!openAi) return;

  const previousMessages = thread.messages || [];
  const newMessages = previousMessages.length
  ? [{ role: 'user', content: userMessage }]
  : [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ];
  setTempMessages(newMessages);
  const messages = [...previousMessages, ...newMessages];


  const selectedModel = availableModels.find(model => model.id === selectedModelId);

  const completion = await openAi.chat.completions.create({
		messages,
		stream: true,
		...selectedModel.completionCreateOptions
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
    messages: [...messages, { role: 'assistant', content: assistantMessage.trim() }],
    selectedModelId
  });

  setStreamingAssistantMessage(null);
  setTempMessages(null);
}