import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit
} from 'firebase/firestore';

import { db } from '$lib/firestore';
import { decrypt } from '$lib/utils/crypto';

export function createThreadList() {
  const plainThreads = $state({});
  let unsubscribe = () => {};

  unsubscribe = onSnapshot(
    query(collection(db, 'threads'), orderBy('updated', 'desc'), limit(10)),
    async (querySnapshot) => {
      const encryptedThreads = querySnapshot.docs;
      const promises = encryptedThreads.map((thread) => {
        return decrypt({ thread }).then((plain) => {
          return [thread.id, plain];
        });
      });

      const plainThreadsArray = await Promise.all(promises);
      
      const newPlainThreads = Object.fromEntries(plainThreadsArray);
      Object.assign(plainThreads, newPlainThreads);
    }
  );

  return {
    plainThreads,
    unsubscribe
  }
}