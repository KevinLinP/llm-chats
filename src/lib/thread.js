import { addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, collection } from 'firebase/firestore';

import { getOpenRouter } from '$lib/open-router';
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
    if (!doc.exists) {
      threadUpdated(null);
      return;
    }

    const decryptedThread = await decrypt({thread: doc});
    console.debug({decryptedThread});
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
  const openRouter = await getOpenRouter();
  if (!openRouter) return;

  const previousMessages = thread.messages || [];
  const newMessages = previousMessages.length
  ? [{ role: 'user', content: userMessage }]
  : [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ];
  setTempMessages(newMessages);
  const messages = [...previousMessages, ...newMessages];

  const completion = await openRouter.chat.completions.create({
    model: selectedModelId,
		messages,
		stream: true,
	});


  let assistantMessage = '';
  let lastChunk = null;

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

    lastChunk = chunk;
	}

  const previousChatCompletions = thread.chatCompletions || [];
  const chatCompletion = buildChatCompletion({lastChunk, assistantMessage});

  await updateThread({
    ...thread,
    chatCompletions: [...previousChatCompletions, chatCompletion],
    messages: [...messages, { role: 'assistant', content: assistantMessage.trim() }],
    selectedModelId
  });

  setStreamingAssistantMessage(null);
  setTempMessages([]);
}

const buildChatCompletion = ({lastChunk, assistantMessage}) => {
  const chatCompletion = structuredClone(lastChunk);
  const choice = chatCompletion.choices[0];

  const text = choice.delta;
  text.content = assistantMessage;
  delete choice.delta;
  choice.text = text;

  return chatCompletion;
}