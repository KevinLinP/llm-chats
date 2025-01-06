<script>
	import { auth } from '$lib/firestore';
	import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
	import EncryptionContext from '$lib/components/EncryptionContext.svelte';
	import OpenAiConfigContext from '$lib/components/OpenAiConfigContext.svelte';

	import "../app.css";

	// Initialize Firebase

	let signedIn = false;
	auth.onAuthStateChanged((user) => {
		signedIn = !!user;
	});

	const handleSignIn = () => {
		const provider = new GoogleAuthProvider();

		signInWithPopup(auth, provider)
			.then((result) => {
				GoogleAuthProvider.credentialFromResult(result);
			})
			.catch((error) => {
				console.log({ error });
			});
	};
</script>

<div class="container mx-auto">
	{#if !signedIn}
		<button class="btn btn-primary" on:click={handleSignIn}>Sign In</button>
	{:else}
		<EncryptionContext>
			<OpenAiConfigContext>
				<slot />
			</OpenAiConfigContext>
		</EncryptionContext>
	{/if}
</div>
