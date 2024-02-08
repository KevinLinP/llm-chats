<script>
	import '../app.scss';
	import { initializeApp } from 'firebase/app';
	import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
	import { getFirestore } from 'firebase/firestore';
	import EncryptionContext from './EncryptionContext.svelte';
	import { setContext } from 'svelte';
	import OpenAiConfigContext from './OpenAiConfigContext.svelte';

	// Initialize Firebase
	const firebaseConfig = {
		apiKey: 'AIzaSyDpPsmgDCUuhJZ6UP3cJeY8MLZPKT1bgsY',
		authDomain: 'llm-chats.firebaseapp.com',
		projectId: 'llm-chats',
		storageBucket: 'llm-chats.appspot.com',
		messagingSenderId: '223168031874',
		appId: '1:223168031874:web:97a85b31f915013520189b'
	};

	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);
	setContext('auth', auth);
	const db = getFirestore(app);
	setContext('db', db);

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

<div class="container-fluid py-5">
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
