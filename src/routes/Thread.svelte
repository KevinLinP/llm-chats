<script>
	import { serverTimestamp, updateDoc } from 'firebase/firestore';
  import OpenAI from 'openai';

  export let thread;
  export let db;

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
  let title = thread.data().plain?.title || '';
  
  $: plain = thread.data()?.plain;
  $: messages = plain.messages;
  $: console.log({plain});

  const handleSend = async () => {
    assistantMessage = '';
    error = '';

    const newMessages = [
      ...(messages || [{role: 'system', content: systemMessage}]),
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
        plain: {
          ...plain,
          messages: newMessages
        },
        updated: serverTimestamp()
      });

      userMessage = '';
      assistantMessage = '';
    } catch (e) {
      error = e;
    }
  }

  const saveTitle = async () => {
    updateDoc(thread.ref, {
      plain: {
        ...plain,
        title
      },
      updated: serverTimestamp()
    });
  }
</script>

<input type="text" bind:value={title} on:blur={saveTitle} class="form-control minimal-input" placeholder="title"/>

{#if messages?.length > 0}
  {#each messages as message, i (i)}
    <div class="mb-3">
      <div>{message.role}</div>
      <div>{message.content}</div>
    </div>
  {/each}
{:else}
  <div class="mb-3">
    <label for="system-message" class="form-label minimal-input">system</label>
    <textarea id="system-message" bind:value={systemMessage} class="form-control" rows="1"/>
  </div>
{/if}

<label for="user-message" class="form-label">user</label>
<textarea id="user-message" bind:value={userMessage} class="form-control minimal-input" rows="1"/>

<p>{assistantMessage}</p>
<p class="text-danger">{error}</p>

<button class="btn btn-primary" on:click={handleSend}>Send</button>

<style lang="scss">
  .minimal-input {
    border-top: none;
    border-left: none;
    border-right: none;
    border-radius: 0;
  }
</style>