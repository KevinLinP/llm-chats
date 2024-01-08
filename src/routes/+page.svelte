<script>
  import OpenAI from 'openai';
  import { setupCrypto } from './crypto.js';
  // import { userStore } from 'sveltefire';

  // export let auth;

  // const user = userStore(auth);

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

  const handleSend = async () => {
    assistantMessage = '';

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
      console.error(e);
    }
  }

  // TODO: turn into array of messages
  // TODO: better layout
</script>

<div class="mb-3">
  <label for="system-message" class="form-label">System Message</label>
  <textarea id="system-message" bind:value={systemMessage} class="form-control" rows="1"/>
</div>

<label for="user-message" class="form-label">User Message</label>
<textarea id="user-message" bind:value={userMessage} class="form-control" rows="3"/>

<!-- <label for="temperature" class="form-label">Temperature</label>
<input id="temperature" type="number" min="0" max="2" bind:value={temperature} class="form-control"/> -->

<p>{assistantMessage}</p>

<button class="btn btn-primary" on:click={handleSend}>Send</button>