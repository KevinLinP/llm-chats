<script>
	import SignoutButton from '$lib/components/SignoutButton.svelte';
	import OpenAiSettings from '$lib/components/OpenAiSettings.svelte';
	import EncryptionKeySettings from '$lib/components/EncryptionKeySettings.svelte';
</script>

<div class="mb-5">
	<EncryptionKeySettings/>
</div>

<div class="mb-5">
	<OpenAiSettings />
</div>

<div>
	<SignoutButton />
</div>
