import { addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

import { getOpenRouter } from '$lib/open-router';
import { db } from '$lib/firestore';
import { decrypt, encrypt } from '$lib/crypto';

export async function createThread() {
  const plain = { title: null };
  const { encrypted, iv } = await encrypt({ plain });

  const collectionRef = collection(db, 'threads');
  await assertUniqueIV({collectionRef, iv});

  const ref = await addDoc(
    collectionRef,
    {
      iv,
      encrypted,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
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
  const unwrappedPreviousMessages = previousMessages.map(message => {
    if (message.choices) {
      // unwrap raw completion
      return message.choices[0].text;
    } else {
      return message;
    }
  });

  const newMessages = previousMessages.length
  ? [{ role: 'user', content: userMessage }]
  : [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ];
  setTempMessages(newMessages);

  const completion = await openRouter.chat.completions.create({
    model: selectedModelId,
		messages: [...unwrappedPreviousMessages, ...newMessages],
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

  const chatCompletion = buildChatCompletion({lastChunk, assistantMessage, modelId: selectedModelId});

  await updateThread({
    ...thread,
    messages: [...previousMessages, ...newMessages, chatCompletion],
    selectedModelId
  });

  setStreamingAssistantMessage(null);
  setTempMessages([]);
}

const buildChatCompletion = ({lastChunk, assistantMessage, modelId}) => {
  const chatCompletion = structuredClone(lastChunk);
  chatCompletion.modelId = modelId;

  const choice = chatCompletion.choices[0];
  choice.text = choice.delta;
  delete choice.delta;
  choice.text.content = assistantMessage;

  return chatCompletion;
}

const assertUniqueIV = async ({collectionRef, iv}) => {
  const q = query(collectionRef, where('iv', '==', iv));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error('IV collision detected. Please try again.');
  }
}