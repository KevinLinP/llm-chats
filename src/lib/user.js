import { db, auth } from '$lib/firestore';
import { doc, getDoc } from 'firebase/firestore';

export const getUser = async () => {
  const userRef = doc(db, 'users', auth.currentUser.uid);
	const user = await getDoc(userRef);
  if (!user.exists()) return null;

  return {
    id: user.id,
    ...user.data()
  }
};