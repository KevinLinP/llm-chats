<script>
	import { getKey, saveKey } from '$lib/encryption-key';
  const key = getKey();
  let newJwk = $state('');
</script>

{#if key}
	<p>Encryption key set</p>
{:else}
	<textarea
		class="form-control"
		placeholder="base64 encryption key"
		bind:value={newJwk}
		onblur={() => saveKey(newJwk)}
	></textarea>
{/if}
