<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setupDb } from '../../db/db';
	import { setupEncryptionKey } from '../../data/encryption-key';

	let { children } = $props();

	onMount(async () => {
		// Initialize database and encryption key from localStorage
		const databaseUrl = localStorage.getItem('databaseUrl');
		const jwkEncryptionKey = localStorage.getItem('jwkEncryptionKey');

		if (databaseUrl) {
			try {
				setupDb(databaseUrl);
			} catch (error) {
				console.error('Failed to setup database:', error);
			}
		}

		if (jwkEncryptionKey) {
			try {
				const jwk = JSON.parse(jwkEncryptionKey);
				await setupEncryptionKey(jwk);
			} catch (error) {
				console.error('Failed to setup encryption key:', error);
			}
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
