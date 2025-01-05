<script>
	import { getContext, setContext } from 'svelte';
	import { doc, getDoc } from 'firebase/firestore';

	import { db, auth } from '$lib/firestore';
	import { openAiConfigStore } from '../stores/api-stores.js';

	// const openAiConfig = writable(null);
	setContext('openAiConfig', openAiConfigStore);

	const userRef = doc(db, 'users', auth.currentUser.uid);
	setContext('userRef', userRef);

	const readKey = async () => {
		let user = await getDoc(userRef);
		if (!user.exists()) return;

		openAiConfigStore.set({
			apiKey: user.data().openAi?.apiKey
		});
	};

	readKey();
</script>

<slot />
