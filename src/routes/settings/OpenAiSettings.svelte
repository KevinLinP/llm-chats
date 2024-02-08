<script>
	import { getContext, onDestroy } from 'svelte';

	const userRef = getContext('userRef');
	const openAiConfig = getContext('openAiConfig');
	let apiKey = '';

	openAiConfig.subscribe((config) => {
		apiKey = config?.apiKey;
	});

	const save = () => {
		setDoc(userRef, { openAi: { apiKey: key } }, { merge: true });
	};
</script>

<label for="openai-key" class="form-label">openAi.apiKey</label>

<input type="text" id="openai-key" class="form-control" bind:value={apiKey} on:blur={save} />
