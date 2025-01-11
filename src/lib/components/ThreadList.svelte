<script>
	import { onDestroy } from 'svelte';
	import {
		collection,
		query,
		orderBy,
		onSnapshot,
		addDoc,
		serverTimestamp,
		limit
	} from 'firebase/firestore';
	import { writable } from 'svelte/store';

	import { db } from '$lib/firestore';
	import { decrypt, encrypt } from '$lib/utils/crypto';
	import { createThreadList } from '$lib/thread-list.svelte.js';

	const { plainThreads } = createThreadList();

	// const threadList = createThreadList();

	// let threads = writable([]);
	// let plainThreads = writable({});

	// const q = query(collection(db, 'threads'), orderBy('updated', 'desc'), limit(10));
	// let unsubscribe = null;
	// $: unsubscribe = onSnapshot(q, (querySnapshot) => {
	// 	$threads = querySnapshot.docs;
	// });
	// onDestroy(() => {
	// 	if (unsubscribe) unsubscribe();
	// });

	// const decryptThreads = async (threads) => {
	// 	const promises = threads.map((thread) => {
	// 		return decrypt({ thread }).then((plain) => {
	// 			return [thread.id, plain];
	// 		});
	// 	});
	// 	const plainThreadData = await Promise.all(promises);

	// 	const something = {};
	// 	plainThreadData.forEach((td) => {
	// 		something[td[0]] = td[1];
	// 	});

	// 	$plainThreads = something;
	// };

	// $: decryptThreads($threads);

	const handleCreateThread = async () => {
		const plain = { title: null };
		const { encrypted, iv } = await encrypt({ plain });

		const ref = await addDoc(collection(db, 'threads'), {
			iv,
			encrypted,
			created: serverTimestamp(),
			updated: serverTimestamp()
		});

		// TODO: bring back
		// setCurrentThreadRef(ref);
	};
</script>

{#if Object.keys(plainThreads).length}
	<button class="px-3 py-2" onclick={handleCreateThread}>create thread</button>

	{#each Object.entries(plainThreads) as [id, thread] (id)}
		<div class="px-3 py-2">
			<a href={`/${id}`}>{thread?.title || 'untitled'}</a>
		</div>
	{/each}
{:else}
	<p>no threads</p>
{/if}
