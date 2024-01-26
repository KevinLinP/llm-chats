<script>
  import { getContext, onDestroy } from 'svelte';
  import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, Bytes } from "firebase/firestore";
  import { writable } from 'svelte/store';

  export let db;
  export let setCurrentThreadRef;

  let threads = writable([]);

  const q = query(collection(db, "threads"), orderBy("updated", "desc"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    $threads = querySnapshot.docs;
  });
  onDestroy(unsubscribe);

  const encryptionKey = getContext('encryptionKey');

  const handleCreateThread = async () => {
    const enc = new TextEncoder();
    const plain = {title: 'testing'}
    const encoded = enc.encode(JSON.stringify(plain));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      encryptionKey,
      encoded,
    );

    const docRef = await addDoc(collection(db, "threads"), {
      iv: Bytes.fromUint8Array(iv),
      encrypted: Bytes.fromUint8Array(new Uint8Array(encrypted)),
      created: serverTimestamp(),
      updated: serverTimestamp(),
    });
    console.log({docRef});
  }

  const handleDestroy = (thread) => {
    deleteDoc(thread.ref);
  }

  const plain = (thread) => {
    const iv = new Uint8Array(thread.data().iv.toUint8Array());
    const encrypted = new Uint8Array(thread.data().encrypted.toUint8Array());

    const decrypted = window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      encryptionKey,
      encrypted,
    );

    return decrypted.then((decrypted) => {
      const dec = new TextDecoder();
      return JSON.parse(dec.decode(decrypted));
    });
  }
</script>

{#each $threads as thread (thread.id)}
  <div class="mb-2">
    <button class="btn btn-primary" on:click={setCurrentThreadRef(thread.ref)}>
      {plain(thread).title || 'Untitled'}
    </button>
    <button class="btn btn-danger" on:click={handleDestroy(thread)}>
      🗑
    </button>
  </div>
{/each}

<button class="btn btn-primary" on:click={handleCreateThread}>
  Create Thread
</button>