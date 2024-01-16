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

<div class="d-flex flex-direction-row" style="gap: 3rem;">
  <div>
    <ThreadList {db} {setCurrentThreadRef}/>
  </div>

  <div class="flex-grow-1">
    {#if $currentThread}
      {#each [$currentThread] as thread (thread.id)}
        {#if thread}
          <Thread {db} thread={thread}/>
        {/if}
      {/each}
    {/if}
  </div>
</div>

