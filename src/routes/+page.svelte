<script>
  import OpenAI from 'openai';
  import { setupCrypto } from './crypto.js';
  import { Collection } from 'sveltefire';

	import { FirebaseApp, userStore } from 'sveltefire';
	import { initializeApp } from 'firebase/app';
	import { getFirestore } from 'firebase/firestore';
	import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
	import { SignedIn, SignedOut } from 'sveltefire';
  import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 

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

	const user = userStore(auth);
	user.subscribe((user) => {
		if (user) console.log({user});
	});

  if (typeof window !== 'undefined') {
    setupCrypto();
  }

  // TODO: make model selectable
  // TODO: dark vs light mode

  const openai = new OpenAI({
    apiKey: 'not needed',
    baseURL: 'http://localhost:1234/v1/',
    dangerouslyAllowBrowser: true
  });

  let temperature = 0.7;
  let systemMessage = 'You are a helpful assistant.';
  let userMessage = 'Write a haiku about the sunset.';
  // TODO: render Markdown properly
  let assistantMessage = '';
  let error = '';

  const handleSend = async () => {
    assistantMessage = '';
    error = '';

    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemMessage},
          { role: 'user', content: userMessage }
        ],
        temperature,
        stream: true
      });

      for await (const chunk of completion) {
        const choice = chunk.choices[0];
        const chunkContent = choice.delta.content;
        if (chunkContent) {
          assistantMessage += chunkContent;
        }
        if (choice.finish_reason && choice.finish_reason != 'stop') {
          assistantMessage += choice.finish_reason;
        }
      }
    } catch (e) {
      error = e;
    }
  }

  $: {
    console.log(firestore, auth)
  }

  const db = firestore;

  let handleCreateThread = async () => {
    const docRef = await addDoc(collection(db, "threads"), {
      created: serverTimestamp(),
    });
    console.log({docRef});
  }


  // TODO: turn into array of messages
  // TODO: better layout
</script>

<FirebaseApp {auth} {firestore}>
  <SignedOut>
    <button class="btn btn-primary" on:click={handleSignIn}>Sign In</button>
  </SignedOut>

  <SignedIn let:signOut let:auth>
    <div class="container">
      <div class="d-flex justify-content-end">
        <button class="btn btn-link" on:click={signOut}>Sign Out</button>
      </div>

<Collection ref={'threads'} let:data>
  {#each data as thread}
    <p>{thread.created}</p>
  {/each}
</Collection>

<button class="btn btn-primary" on:click={handleCreateThread}>Create Thread</button>



<div class="mb-3">
  <label for="system-message" class="form-label">System Message</label>
  <textarea id="system-message" bind:value={systemMessage} class="form-control" rows="1"/>
</div>

<label for="user-message" class="form-label">User Message</label>
<textarea id="user-message" bind:value={userMessage} class="form-control" rows="3"/>

<!-- <label for="temperature" class="form-label">Temperature</label>
<input id="temperature" type="number" min="0" max="2" bind:value={temperature} class="form-control"/> -->

<p>{assistantMessage}</p>
<p class="text-danger">{error}</p>

<button class="btn btn-primary" on:click={handleSend}>Send</button>

    </div>
  </SignedIn>
</FirebaseApp>
