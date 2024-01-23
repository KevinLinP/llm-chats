<script>
  import { onDestroy } from 'svelte';
  import { setDoc, onSnapshot, doc, getFirestore, serverTimestamp, updateDoc } from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';

  let wrapperKey = "";

  const auth = getAuth();
  const db = getFirestore();

  const docRef = doc(db, "users", auth.currentUser.uid);
  const unsub = onSnapshot(docRef, (doc) => {
    if (!doc.exists()) {
      setDoc(docRef, {created: serverTimestamp(), updated: serverTimestamp()});
      return;
    }

    wrapperKey = doc.data().wrapperKey;
  });
  onDestroy(unsub);

  const updateWrapperKey = async () => {
    await updateDoc(docRef, {wrapperKey, updated: serverTimestamp()});
  }
</script>

<div class="form-group">
  <label for="wrapper-key">Wrapper key</label>
  <textarea class="form-control" id="wrapper-key" rows="5" bind:value={wrapperKey} on:blur={updateWrapperKey}></textarea>
</div>