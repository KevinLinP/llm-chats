import { db, auth } from '$lib/firestore';
import { doc, getDoc } from 'firebase/firestore';

let userPromise = null;

auth.onAuthStateChanged(async (authUser) => {
  if (!authUser) {
    userPromise = async () => null;
  }

  const userRef = doc(db, 'users', authUser.uid);

	userPromise = getDoc(userRef).then(doc => {
    return {
      id: doc.id,
      ...doc.data()
    }
  });
});

export const getUser = async () => {
  return await userPromise;
}