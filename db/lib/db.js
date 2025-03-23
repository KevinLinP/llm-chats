import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(fs.readFileSync('db/lib/firebase-adminsdk.secret.json'));

initializeApp({
  credential: cert(serviceAccount)
});

export const db = getFirestore();