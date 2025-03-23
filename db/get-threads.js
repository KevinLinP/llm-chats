import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(fs.readFileSync('db/firebase-adminsdk.secret.json'));

const LIMIT = 10;

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const snapshot = await db.collection('threads').orderBy('created', 'desc').limit(LIMIT).get();

snapshot.forEach((doc) => {
  console.log(doc.id, '=>', doc.data());
});