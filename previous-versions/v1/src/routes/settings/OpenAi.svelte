<script>
	import { getContext } from 'svelte';

	const userRef = getContext('userRef');
	let apiKey = $state('TODO: fix hydration ?');

	const save = () => {
		setDoc(userRef, { openAi: { apiKey: key } }, { merge: true });
	};
</script>

<div class="mb-2">
	<label for="openai-key" class="form-label">openAi.apiKey</label>

	<input type="text" id="openai-key" class="form-control" bind:value={apiKey} onblur={save} />
</div>

<a href="https://platform.openai.com/usage" target="_blank">OpenAI Usage ⌝</a>
