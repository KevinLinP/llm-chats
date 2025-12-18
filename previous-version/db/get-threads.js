import { db } from './lib/db.js';
import { decrypt } from './lib/crypto.js';
const LIMIT = 1;

const snapshot = await db.collection('threads').orderBy('createdAt', 'desc').limit(LIMIT).get();

snapshot.forEach(async (doc) => {
  console.log(doc.id, '=>', doc.data());

  const decryptedThread = await decrypt({ thread: doc });
  console.log(decryptedThread);
});