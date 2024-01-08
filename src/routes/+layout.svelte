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
				// This gives you a Google Access Token. You can use it to access the Google API.
				const credential = GoogleAuthProvider.credentialFromResult(result);
				const token = credential.accessToken;
				// The signed-in user info.
				const user = result.user;
				// IdP data available using getAdditionalUserInfo(result)
				// ...
			}).catch((error) => {
				// Handle Errors here.
				const errorCode = error.code;
				const errorMessage = error.message;
				// The email of the user's account used.
				const email = error.customData.email;
				// The AuthCredential type that was used.
				const credential = GoogleAuthProvider.credentialFromError(error);
				// ...
			});
	};

</script>

<FirebaseApp {auth} {firestore}>
	<SignedOut>
    <button on:click={handleSignIn}>Sign In</button>
	</SignedOut>

	<SignedIn let:signOut>
		<slot />
		<button on:click={signOut}>Sign Out</button>
	</SignedIn>
</FirebaseApp>