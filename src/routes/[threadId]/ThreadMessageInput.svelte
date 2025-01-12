<script>
	import { sendMessage } from '$lib/thread.js';

	import ThreadModelSelector from './ThreadModelSelector.svelte';

	let { thread } = $props();
	let systemMessage = $state('You are a helpful assistant.');
	$effect(() => {
		systemMessage = thread.systemMessage || 'You are a helpful assistant.';
	});

	let userMessage = $state('');
	let userMessageTextarea = $state(null);

	let tempMessages = $state([]);
	let streamingAssistantMessage = $state(null);

	function handleSend() {
		const userMessageCopy = userMessage;
		userMessage = '';

		sendMessage({
			thread,
			userMessage: userMessageCopy,
			systemMessage,
			setStreamingAssistantMessage: (message) => streamingAssistantMessage = message,
			setTempMessages: (messages) => tempMessages = messages,
		});
	}
</script>

{#each tempMessages as message, i (i)}
	<div class="mb-5">
		<div>{message.role}</div>
		<div>{message.content}</div>
	</div>
{/each}

{#if streamingAssistantMessage}
	<div class="mb-5">
		<div>assistant</div>
		<div>{streamingAssistantMessage}</div>
	</div>
{:else}
	{#if thread.messages?.length == 0}
		<div class="mb-3">
			<label for="system-message">system</label>
			<textarea
				id="system-message"
				bind:value={systemMessage}
				class="dark:bg-gray-800 border-t-0 border-l-0 border-r-0 w-full"
				rows="1"
			></textarea>
		</div>
	{/if}

	<label for="user-message">user</label>
	<textarea
		id="user-message"
		bind:value={userMessage}
		bind:this={userMessageTextarea}
		onkeydown={(e) => {
			if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
				e.preventDefault();
				handleSend();
			}
		}}
		class="dark:bg-gray-800 border-t-0 border-l-0 border-r-0 w-full"
		rows="1"
	></textarea>

	<ThreadModelSelector />
{/if}