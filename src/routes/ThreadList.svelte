<script>
  import { onDestroy } from 'svelte';
  import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
  import { writable } from 'svelte/store';

  export let db;
  export let setCurrentThreadRef;

  let threads = writable([]);

  const q = query(collection(db, "threads"), orderBy("updated", "desc"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    $threads = querySnapshot.docs;
  });
  onDestroy(unsubscribe);

  const handleCreateThread = async () => {
    const docRef = await addDoc(collection(db, "threads"), {
      created: serverTimestamp(),
      updated: serverTimestamp(),
    });
    console.log({docRef});
  }

  const handleDestroy = (thread) => {
    deleteDoc(thread.ref);
  }
</script>

{#each $threads as thread (thread.id)}
  <div class="mb-2">
    <button class="btn btn-primary" on:click={setCurrentThreadRef(thread.ref)}>
      {thread.data().updated}
    </button>
    <button class="btn btn-danger" on:click={handleDestroy(thread)}>
      🗑
    </button>
  </div>
{/each}

<button class="btn btn-primary" on:click={handleCreateThread}>
  Create Thread
</button>