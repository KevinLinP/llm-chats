<script>
	import { getContext, onDestroy } from 'svelte';
	import { decrypt, encrypt } from './crypto';
	import {
		collection,
		query,
		orderBy,
		onSnapshot,
		addDoc,
		serverTimestamp,
		deleteDoc
	} from 'firebase/firestore';
	import { writable } from 'svelte/store';

	export let currentThreadRefStore;

	const db = getContext('db');
	let threads = writable([]);
	let plainThreads = writable({});

	const q = query(collection(db, 'threads'), orderBy('updated', 'desc'));
	let unsubscribe = null;
	$: unsubscribe = onSnapshot(q, (querySnapshot) => {
		$threads = querySnapshot.docs;
	});
	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	const encryptionKey = getContext('encryptionKey');

	const decryptThreads = async (threads) => {
		const promises = threads.map((thread) => {
			return decrypt({ encryptionKey, thread }).then((plain) => {
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
		const plain = { title: 'testing' };
		const { encrypted, iv } = await encrypt({ encryptionKey, plain });

		const ref = await addDoc(collection(db, 'threads'), {
			iv,
			encrypted,
			created: serverTimestamp(),
			updated: serverTimestamp()
		});

		setCurrentThreadRef(ref);
	};

	const setCurrentThreadRef = (ref) => {
		currentThreadRefStore.set(ref);
	};

	const handleDestroy = (thread) => {
		deleteDoc(thread.ref);
	};
</script>

{#each $threads as thread (thread.id)}
	<div class="mb-2">
		<button class="btn btn-primary" on:click={setCurrentThreadRef(thread.ref)}>
			{$plainThreads[thread.id]?.title || 'Untitled'}
		</button>
		<button class="btn btn-danger" on:click={handleDestroy(thread)}> 🗑 </button>
	</div>
{/each}

<button class="btn btn-primary" on:click={handleCreateThread}> Create Thread </button>
