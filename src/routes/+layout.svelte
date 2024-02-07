<script>
	import '../app.scss';
	import { initializeApp } from 'firebase/app';
	import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
	import { getFirestore } from 'firebase/firestore';
	import EncryptionContext from './EncryptionContext.svelte';
	import { setContext } from 'svelte';

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

	const handleSignOut = () => {
		auth.signOut();
	};
</script>

<div class="container-fluid">
	{#if !signedIn}
		<button class="btn btn-primary" on:click={handleSignIn}>Sign In</button>
	{:else}
		<div class="d-flex justify-content-end">
			<button class="btn btn-link" on:click={handleSignOut}>Sign Out</button>
		</div>

		<EncryptionContext>
			<slot />
		</EncryptionContext>
	{/if}
</div>
