<script>
	import '../app.scss';
	import { FirebaseApp } from 'sveltefire';
	import { initializeApp } from 'firebase/app';
	import { getFirestore } from 'firebase/firestore';
	import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
	import { SignedIn, SignedOut } from 'sveltefire';

	// Initialize Firebase
	const firebaseConfig = {
	apiKey: "AIzaSyDpPsmgDCUuhJZ6UP3cJeY8MLZPKT1bgsY",
	authDomain: "llm-chats.firebaseapp.com",
	projectId: "llm-chats",
	storageBucket: "llm-chats.appspot.com",
	messagingSenderId: "223168031874",
	appId: "1:223168031874:web:97a85b31f915013520189b"
};
	const app = initializeApp(firebaseConfig);
	const firestore = getFirestore(app);
	const auth = getAuth(app);

	const handleSignIn = () => {
		const provider = new GoogleAuthProvider();

		signInWithPopup(auth, provider)
			.then((result) => {
				GoogleAuthProvider.credentialFromResult(result);
			}).catch((error) => {
				console.log({error})
			});
	};

</script>

<FirebaseApp {auth} {firestore}>
	<SignedOut>
    <button class="btn btn-primary" on:click={handleSignIn}>Sign In</button>
	</SignedOut>

	<SignedIn let:signOut let:auth>
		<slot {auth}/>
		<div>
			<button class="btn btn-link" on:click={signOut}>Sign Out</button>
		</div>
	</SignedIn>
</FirebaseApp>