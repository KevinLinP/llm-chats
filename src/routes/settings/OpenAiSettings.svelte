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

<div class="mb-2">
	<label for="openai-key" class="form-label">openAi.apiKey</label>

	<input type="text" id="openai-key" class="form-control" bind:value={apiKey} on:blur={save} />
</div>

<a href="https://platform.openai.com/usage" target="_blank">OpenAI Usage ⌝</a>
