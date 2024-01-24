<script>
	import { generateJwkKey } from './crypto.js';
	import EncryptionContextSetter from './EncryptionContextSetter.svelte';
	const localStorage = window.localStorage;
	const localStorageKey = 'base64EncryptionKey';

	let encryptionKey = null;
	let newJwk = '';

	const restoreKey = async () => {
		const jwk = localStorage.getItem(localStorageKey);
		if (!jwk) return; 

		encryptionKey = await window.crypto.subtle.importKey(
			'jwk',
			JSON.parse(jwk),
			{ name: 'AES-GCM' },
			false,
			['encrypt', 'decrypt']
		);
	};

	const run = async () => {
		await restoreKey();

		if (!encryptionKey) {
			generateJwkKey();
		}
	};

	run();

	const saveKey = () => {
		localStorage.setItem(localStorageKey, newJwk);
	};
</script>


{#if encryptionKey}
	<EncryptionContextSetter encryptionKey={encryptionKey}>
		<slot/>
	</EncryptionContextSetter>
{:else}
	<textarea class="form-control" placeholder="base64 encryption key" bind:value={newJwk} on:blur={saveKey}></textarea>
{/if}
