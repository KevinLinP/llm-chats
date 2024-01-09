<script>
	import { getFirestore } from 'firebase/firestore';

  import ThreadList from './ThreadList.svelte';

  export let app;

	const db = getFirestore(app);

  let currentThread = null;
  const setCurrentThread = (thread) => {
    console.log(thread);
    currentThread = thread;
  }

</script>

<ThreadList {db} {setCurrentThread}/>

<div>Current Thread: {currentThread?.id}</div>