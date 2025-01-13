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
	import { subscribeThreadList } from '$lib/thread-list.svelte';

	let threadList = $state([]);

	const { unsubscribe } = subscribeThreadList({
		threadListUpdated: (newThreadList) => {
			threadList = newThreadList;
		}
	});
	onDestroy(() => unsubscribe());

	// TODO: move to thread.js
	const handleCreateThread = async () => {
		const plain = { title: null };
		const { encrypted, iv } = await encrypt({ plain });

		const { threadId } = await addDoc(collection(db, 'threads'), {
			iv,
			encrypted,
			created: serverTimestamp(),
			updated: serverTimestamp()
		});

		goto(`/${threadId}`);
	};
</script>

{#if threadList.length}
	<button class="px-3 py-4 text-left" onclick={handleCreateThread}>create thread</button>

	<hr class="mb-3 mx-2 border-t border-gray-300 dark:border-gray-700">

	{#each threadList as thread (thread.id)}
		<div>
			<button class="px-3 py-3 text-left" onclick={() => goto(`/${thread.id}`)}>{thread.title || 'untitled'}</button>
		</div>
	{/each}
{/if}
