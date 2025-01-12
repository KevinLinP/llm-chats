import { onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

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