<script>
  import OpenAI from 'openai';
  import { setupCrypto } from './crypto.js';
  // import { userStore } from 'sveltefire';

  // export let auth;

  // const user = userStore(auth);

  if (typeof window !== 'undefined') {
    setupCrypto();
  }

  const openai = new OpenAI({
    apiKey: 'not needed',
    baseURL: 'http://localhost:1234/v1/',
    dangerouslyAllowBrowser: true
  });

  let userMessage = '';
  let assistantMessage = '';

  const handleHello = async () => {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: userMessage }]
    });
    assistantMessage = chatCompletion.choices[0].message.content;
  }

</script>

<textarea bind:value={userMessage} rows="5"/>

<p>{assistantMessage}</p>

<button class="btn btn-primary" on:click={handleHello}>Hello!</button>