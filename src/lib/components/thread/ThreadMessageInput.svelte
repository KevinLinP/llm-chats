<script>
	import { messagesStore } from '$lib/stores/thread-stores.js';
	import { getCompletion } from '$lib/utils/thread.js';

	let systemMessage = 'You are a helpful assistant.';
	let userMessage = '';
	let userMessageTextarea = null;

	const handleSend = async () => {
		const userMessageCopy = userMessage;
		userMessage = '';

		await getCompletion({ systemMessage, userMessage: userMessageCopy });

		if (userMessageTextarea) userMessageTextarea.focus();
	};
</script>

{#if $messagesStore.length == 0}
	<div class="mb-3">
		<label for="system-message" class="form-label minimal-input">system</label>
		<textarea
			id="system-message"
			bind:value={systemMessage}
			class="form-control minimal-input"
			rows="1"
		/>
	</div>
{/if}

<label for="user-message" class="form-label">user</label>
<textarea
	id="user-message"
	bind:value={userMessage}
	bind:this={userMessageTextarea}
	on:keydown={(e) => {
		if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
			e.preventDefault();
			handleSend();
		}
	}}
	class="form-control minimal-input"
	rows="1"
/>

<style lang="scss">
	.minimal-input {
		border-top: none;
		border-left: none;
		border-right: none;
		border-radius: 0;
	}
</style>
