<script>
	import { auth } from '$lib/firestore';
	import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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

<div>
	{#if !signedIn}
		<button on:click={handleSignIn}>Sign In</button>
	{:else}
		<OpenAiConfigContext>
			<slot />
		</OpenAiConfigContext>
	{/if}
</div>
