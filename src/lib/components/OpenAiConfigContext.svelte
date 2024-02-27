<script>
	import { getContext, setContext } from 'svelte';
	import { doc, getDoc } from 'firebase/firestore';
	import { openAiConfigStore } from '../stores/api-stores.js';

	// const openAiConfig = writable(null);
	setContext('openAiConfig', openAiConfigStore);

	const auth = getContext('auth');
	const db = getContext('db');
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
