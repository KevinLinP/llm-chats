<script>
	import { onDestroy } from 'svelte';
	import {
		collection,
		addDoc,
		serverTimestamp,
	} from 'firebase/firestore';

	import { db } from '$lib/firestore';
	import { encrypt } from '$lib/utils/crypto';
	import { createThreadList } from '$lib/thread-list.svelte.js';

	const { plainThreads, unsubscribe } = createThreadList();
	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

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

{#if plainThreads.length}
	<button class="px-3 py-2" onclick={handleCreateThread}>create thread</button>

	{#each plainThreads as thread (thread.id)}
		<div class="px-3 py-2">
			<a href={`/${thread.id}`}>{thread?.title || 'untitled'}</a>
		</div>
	{/each}
{/if}
