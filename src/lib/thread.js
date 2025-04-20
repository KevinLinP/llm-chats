import { addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

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

export const unwrapMessages = (messages) => {
  return messages.map(message => {
    if (message.chunks) {
      return {
        role: message.chunks[0].choices[0].delta.role,
        content: message.chunks.reduce((acc, chunk) => {
          return acc + chunk.choices[0].delta.content;
        }, '')
      }
    } else if (message.choices) {
      // unwrap raw completion
      return message.choices[0].text;
    } else {
      return message;
    }
  });
};

const assertUniqueIV = async ({collectionRef, iv}) => {
  const q = query(collectionRef, where('iv', '==', iv));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const message = 'IV collision detected. Please try again.';
    alert(message);
    throw new Error(message);
  }
}