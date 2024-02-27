<script>
	import { generateJwkKey } from '../crypto.js';
	import EncryptionContextSetter from './EncryptionContextSetter.svelte';
	import { encryptionKeyStore } from '../stores/crypto-stores.js';

	const localStorage = window.localStorage;
	const localStorageKey = 'base64EncryptionKey';

	$: encryptionKey = $encryptionKeyStore;
	let newJwk = '';

	const restoreKey = async () => {
		const jwk = localStorage.getItem(localStorageKey);
		if (!jwk) return;

		const key = await window.crypto.subtle.importKey(
			'jwk',
			JSON.parse(jwk),
			{ name: 'AES-GCM' },
			false,
			['encrypt', 'decrypt']
		);

		$encryptionKeyStore = key;
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
	<EncryptionContextSetter {encryptionKey}>
		<slot />
	</EncryptionContextSetter>
{:else}
	<textarea
		class="form-control"
		placeholder="base64 encryption key"
		bind:value={newJwk}
		on:blur={saveKey}
	></textarea>
{/if}
