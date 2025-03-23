import { db } from './lib/db.js';

const LIMIT = 10;

const snapshot = await db.collection('threads').orderBy('created', 'desc').limit(LIMIT).get();

snapshot.forEach((doc) => {
  console.log(doc.id, '=>', doc.data());
});