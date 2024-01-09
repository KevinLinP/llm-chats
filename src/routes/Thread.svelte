<script>
	import { serverTimestamp, updateDoc } from 'firebase/firestore';
  import OpenAI from 'openai';

  export let thread;

  $: {
    console.log(thread);
    console.log(thread.data());
  }

  const openai = new OpenAI({
    apiKey: 'not needed',
    baseURL: 'http://localhost:1234/v1/',
    dangerouslyAllowBrowser: true
  });

  let systemMessage = 'You are a helpful assistant.';
  let userMessage = '';
  // TODO: render Markdown properly
  let assistantMessage = '';
  let error = '';

  const messages = thread.data().plain?.messages || [
    { role: 'system', content: systemMessage }
  ];

  const handleSend = async () => {
    assistantMessage = '';
    error = '';

    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];

    try {
      const completion = await openai.chat.completions.create({
        messages: newMessages, 
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

      newMessages.push({ 
        role: 'assistant',
        content: assistantMessage.trim()
      });

      updateDoc(thread.ref, {
        plain: {messages: newMessages},
        updated: serverTimestamp()
      });

      userMessage = '';
      assistantMessage = '';
    } catch (e) {
      error = e;
    }
  }
</script>

<div>Thread: {thread?.id}</div>

{#if thread.data().plain?.messages}
  {#each thread.data().plain.messages as message, i (i)}
    <div class="mb-3">
      <div>{message.role}</div>
      <div>{message.content}</div>
    </div>
  {/each}
{:else}
  <div class="mb-3">
    <label for="system-message" class="form-label">system</label>
    <textarea id="system-message" bind:value={systemMessage} class="form-control" rows="1"/>
  </div>
{/if}

<label for="user-message" class="form-label">user</label>
<textarea id="user-message" bind:value={userMessage} class="form-control" rows="3"/>

<p>{assistantMessage}</p>
<p class="text-danger">{error}</p>

<button class="btn btn-primary" on:click={handleSend}>Send</button>