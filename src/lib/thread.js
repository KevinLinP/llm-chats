import { onSnapshot, doc } from 'firebase/firestore';

import { db } from './firestore';
import { decrypt } from './utils/crypto';

export function subscribeThread({threadId, threadUpdated}) {
  const threadRef = doc(db, 'threads', threadId);

	console.log({threadRef});

  const unsubscribe = onSnapshot(threadRef, async (doc) => {
		console.log({doc});
    const decryptedThread = await decrypt({thread: doc});
		console.log({decryptedThread});
		threadUpdated(decryptedThread);
  });

  return {unsubscribe};
}