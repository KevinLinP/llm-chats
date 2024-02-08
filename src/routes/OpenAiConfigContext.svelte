<script>
	import { getContext, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { doc, getDoc } from 'firebase/firestore';

	const openAiConfig = writable(null);
	setContext('openAiConfig', openAiConfig);

	const readKey = async () => {
		const auth = getContext('auth');
		const db = getContext('db');
		const userRef = doc(db, 'users', auth.currentUser.uid);
		setContext('userRef', userRef);

		let user = await getDoc(userRef);
		if (!user.exists()) return;

		openAiConfig.set({
			apiKey: user.data().openAi?.apiKey
		});
	};

	readKey();
</script>

<slot />
