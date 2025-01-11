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
  const plainThreads = $state([]);
  let unsubscribe = () => {};

  unsubscribe = onSnapshot(
    query(collection(db, 'threads'), orderBy('updated', 'desc'), limit(10)),
    async (querySnapshot) => {
      const newPlainThreads = await Promise.all(
        querySnapshot.docs.map(async thread => await decrypt({ thread }))
      );
      
      plainThreads.length = 0;
      plainThreads.push(...newPlainThreads);
    }
  );

  return {
    plainThreads,
    unsubscribe
  }
}