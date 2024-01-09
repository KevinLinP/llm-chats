<script>
	import { initializeApp } from 'firebase/app';
	import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

  import Main from './Main.svelte';

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
	const auth = getAuth(app);

  let signedIn = false;
  auth.onAuthStateChanged(user => {
    signedIn = !!user;
  });

	const handleSignIn = () => {
		const provider = new GoogleAuthProvider();

		signInWithPopup(auth, provider)
			.then((result) => {
				GoogleAuthProvider.credentialFromResult(result);
			}).catch((error) => {
				console.log({error})
			});
	};

  const handleSignOut = () => {
    auth.signOut();
  };
</script>

<div class="container">
  {#if !signedIn}
  <button class="btn btn-primary" on:click={handleSignIn}>Sign In</button>
  {:else}
    <div class="d-flex justify-content-end">
      <button class="btn btn-link" on:click={handleSignOut}>Sign Out</button>
    </div>

    <Main {app}/>
  {/if}
</div>