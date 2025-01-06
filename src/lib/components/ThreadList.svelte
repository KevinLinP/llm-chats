<script>
	import { getContext, onDestroy } from 'svelte';
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
	import { currentThreadRefStore } from '$lib/stores/thread-stores';
	import { decrypt, encrypt } from '$lib/utils/crypto';
	import { getKey } from '$lib/encryption-key';

	let threads = writable([]);
	let plainThreads = writable({});

	const q = query(collection(db, 'threads'), orderBy('updated', 'desc'), limit(10));
	let unsubscribe = null;
	$: unsubscribe = onSnapshot(q, (querySnapshot) => {
		$threads = querySnapshot.docs;
	});
	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	const decryptThreads = async (threads) => {
		const promises = threads.map((thread) => {
			return decrypt({ thread }).then((plain) => {
				return [thread.id, plain];
			});
		});
		const plainThreadData = await Promise.all(promises);

		const something = {};
		plainThreadData.forEach((td) => {
			something[td[0]] = td[1];
		});

		$plainThreads = something;
	};

	$: decryptThreads($threads);

	const handleCreateThread = async () => {
		const plain = { title: null };
		const { encrypted, iv } = await encrypt({ plain });

		const ref = await addDoc(collection(db, 'threads'), {
			iv,
			encrypted,
			created: serverTimestamp(),
			updated: serverTimestamp()
		});

		setCurrentThreadRef(ref);
	};

	const setCurrentThreadRef = (ref) => {
		$currentThreadRefStore = ref;
	};
</script>

{#if $threads.length}
	<button class="px-3 py-2" on:click={handleCreateThread}>create thread</button>

	{#each $threads as thread (thread.id)}
		<div class="px-3 py-2">
			<button class="btn btn-text" on:click={setCurrentThreadRef(thread.ref)}>
				{$plainThreads[thread.id]?.title || 'untitled'}
			</button>
		</div>
	{/each}
{/if}
