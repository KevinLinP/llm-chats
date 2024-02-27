<script>
	import { deleteDoc } from 'firebase/firestore';

	import { currentThreadRefStore } from '$lib/stores/thread-stores.js';
	import { get } from 'svelte/store';

	const handleDestroy = () => {
		const threadRef = get(currentThreadRefStore);

		currentThreadRefStore.set(null);

		deleteDoc(threadRef);
	};
</script>

<button class="btn btn-text" on:click={handleDestroy}>delete</button>
