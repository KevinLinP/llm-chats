import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit
} from 'firebase/firestore';

import { db } from '$lib/firestore';
import { decrypt } from '$lib/crypto';

export function subscribeThreadList({threadListUpdated}) {
  const threadListQuery = query(collection(db, 'threads'), orderBy('updated', 'desc'), limit(10));

  const unsubscribe = onSnapshot(
    threadListQuery,
    async (querySnapshot) => {
      const threadList = await Promise.all(
        querySnapshot.docs.map(async thread => await decrypt({ thread }))
      );

      threadListUpdated(threadList);
    }
  );

  return {unsubscribe};
}