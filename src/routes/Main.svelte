<script>
	import { getFirestore, onSnapshot } from 'firebase/firestore';
  import { onDestroy } from 'svelte';

  import Thread from './Thread.svelte';
  import ThreadList from './ThreadList.svelte';
	import { writable } from 'svelte/store';

  export let app;

	const db = getFirestore(app);

  let unsubscribe = null;
  let currentThreadRef = null;
  const currentThread = writable(null);

  const setCurrentThreadRef = (threadRef) => {
    currentThreadRef = threadRef;
  }

  $: {
    if (currentThreadRef) {
      if (unsubscribe) unsubscribe();

      unsubscribe = onSnapshot(currentThreadRef, (doc) => {
        currentThread.set(doc);
      });
    }
  }

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });
</script>

<ThreadList {db} {setCurrentThreadRef}/>

{#if $currentThread}
  {#each [$currentThread] as thread (thread.id)}
    <Thread {db} thread={thread}/>
  {/each}
{/if}