<script>
	import { onDestroy } from 'svelte';
	import {
		collection,
		addDoc,
		serverTimestamp,
	} from 'firebase/firestore';

	import { goto } from '$app/navigation';
	import { db } from '$lib/firestore';
	import { encrypt } from '$lib/crypto';
	import { createThreadList } from '$lib/thread-list.svelte';

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
	<button class="px-3 py-4 text-left" onclick={handleCreateThread}>create thread</button>

	<hr class="mb-3 mx-2 border-t border-gray-300 dark:border-gray-700">

	{#each plainThreads as thread (thread.id)}
		<div>
			<button class="px-3 py-3 text-left" onclick={() => goto(`/${thread.id}`)}>{thread.title || 'untitled'}</button>
		</div>
	{/each}
{/if}
