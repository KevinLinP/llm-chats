<script>
	import SignoutButton from './SignoutButton.svelte';
	import OpenAi from './OpenAi.svelte';
	import OpenRouter from './OpenRouter.svelte';
	import EncryptionKey from './EncryptionKey.svelte';
</script>

<div class="mb-5">
	<EncryptionKey/>
</div>

<div class="mb-5">
	<OpenAi />
</div>

<div class="mb-5">
	<OpenRouter />
</div>

<div>
	<SignoutButton />
</div>
