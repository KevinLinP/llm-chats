<script lang="ts">
	import { onMount } from 'svelte';

	let databaseUrl = $state('');
	let jwkEncryptionKey = $state('');
	let openRouterApiKey = $state('');
	let initialized = $state(false);

	onMount(() => {
		// Load from localStorage on mount
		const storedDatabaseUrl = localStorage.getItem('databaseUrl');
		const storedJwkEncryptionKey = localStorage.getItem('jwkEncryptionKey');
		const storedOpenRouterApiKey = localStorage.getItem('openRouterApiKey');

		if (storedDatabaseUrl) {
			databaseUrl = storedDatabaseUrl;
		}
		if (storedJwkEncryptionKey) {
			jwkEncryptionKey = storedJwkEncryptionKey;
		}
		if (storedOpenRouterApiKey) {
			openRouterApiKey = storedOpenRouterApiKey;
		}
		initialized = true;
	});

	// Save to localStorage when values change (after initialization)
	$effect(() => {
		if (!initialized) return;
		if (databaseUrl) {
			localStorage.setItem('databaseUrl', databaseUrl);
		} else {
			localStorage.removeItem('databaseUrl');
		}
	});

	$effect(() => {
		if (!initialized) return;
		if (jwkEncryptionKey) {
			localStorage.setItem('jwkEncryptionKey', jwkEncryptionKey);
		} else {
			localStorage.removeItem('jwkEncryptionKey');
		}
	});

	$effect(() => {
		if (!initialized) return;
		if (openRouterApiKey) {
			localStorage.setItem('openRouterApiKey', openRouterApiKey);
		} else {
			localStorage.removeItem('openRouterApiKey');
		}
	});
</script>

<div class="min-h-screen bg-gray-950 p-6">
	<div class="max-w-2xl mx-auto">
		<h1 class="text-2xl font-semibold mb-6 text-gray-100">Settings</h1>

		<div class="space-y-6">
			<div>
				<label
					for="database-url"
					class="block text-sm font-medium mb-2 text-gray-200"
				>
					Database URL
				</label>
				<input
					id="database-url"
					type="text"
					bind:value={databaseUrl}
					class="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					placeholder="postgresql://user:password@host:port/database"
				/>
			</div>

			<div>
				<label
					for="jwk-encryption-key"
					class="block text-sm font-medium mb-2 text-gray-200"
				>
					JWK Encryption Key
				</label>
				<textarea
					id="jwk-encryption-key"
					bind:value={jwkEncryptionKey}
					rows="4"
					class="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
					placeholder="Paste your JWK encryption key here"
				></textarea>
			</div>

			<div>
				<label
					for="openrouter-api-key"
					class="block text-sm font-medium mb-2 text-gray-200"
				>
					OpenRouter API Key
				</label>
				<input
					id="openrouter-api-key"
					type="text"
					bind:value={openRouterApiKey}
					class="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					placeholder="Enter your OpenRouter API key"
				/>
			</div>
		</div>
	</div>
</div>

