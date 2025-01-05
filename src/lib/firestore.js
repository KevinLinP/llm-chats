import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager} from 'firebase/firestore';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDpPsmgDCUuhJZ6UP3cJeY8MLZPKT1bgsY',
  authDomain: 'llm-chats.firebaseapp.com',
  projectId: 'llm-chats',
  storageBucket: 'llm-chats.appspot.com',
  messagingSenderId: '223168031874',
  appId: '1:223168031874:web:97a85b31f915013520189b'
};

const app = initializeApp(FIREBASE_CONFIG);

const auth = getAuth(app);

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
});

export { auth, db };