<script>
	import { getContext, onDestroy } from 'svelte';
	import { doc, onSnapshot, setDoc } from 'firebase/firestore';

	const auth = getContext('auth');
	const db = getContext('db');
	const openAiConfig = getContext('openAiConfig');
	let user = null;
	let key = '';

	const userRef = doc(db, 'users', auth.currentUser.uid);

	let unsubscribe = null;
	unsubscribe = onSnapshot(userRef, (doc) => {
		if (!doc.exists()) return;

		key = doc.data().openAi?.apiKey;
	});
	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	const saveKey = () => {
		setDoc(userRef, { openAi: { apiKey: key } }, { merge: true });
	};
</script>

<label for="openai-key" class="form-label">OpenAI API Key</label>
<input type="text" id="openai-key" class="form-control" bind:value={key} on:blur={saveKey} />
