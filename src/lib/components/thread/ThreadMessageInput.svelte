<script>
	import { updateDoc, serverTimestamp } from 'firebase/firestore';

	import {
		plainStore,
		messagesStore,
		streamingMessageStore,
		errorStore,
		currentThreadRefStore
	} from '$lib/stores/thread-stores.js';
	import { openAiStore } from '$lib/stores/api-stores.js';
	import { encryptionKeyStore } from '$lib/stores/crypto-stores.js';
	import { encrypt } from '$lib/utils/crypto.js';
	import { selectedModelIdStore, selectedModelStore } from '$lib/stores/model-stores.js';

	let systemMessage = 'You are a helpful assistant.';
	let userMessage = '';
	let userMessageTextarea = null;

	$: encryptionKey = $encryptionKeyStore;

	const handleSend = async () => {
		$streamingMessageStore = '';
		$errorStore = '';

		const previousMessages = $messagesStore;
		let messages = previousMessages.length
			? [...previousMessages, { role: 'user', content: userMessage }]
			: [
					{ role: 'system', content: systemMessage },
					{ role: 'user', content: userMessage }
				];

		$messagesStore = messages;

		userMessage = '';

		// try {
		const completion = await $openAiStore.chat.completions.create({
			messages,
			stream: true,
			...$selectedModelStore.completionCreateOptions
		});

		let streamingMessage = '';

		for await (const chunk of completion) {
			const choice = chunk.choices[0];
			const chunkContent = choice.delta.content;
			if (chunkContent) {
				streamingMessage = streamingMessage + chunkContent;
				// streamingMessageStore.update((message) => message + chunkContent);
			}
			if (choice.finish_reason && choice.finish_reason != 'stop') {
				streamingMessage = streamingMessage + choice.finish_reason;
			}

			$streamingMessageStore = streamingMessage;
		}

		messages = [...messages, { role: 'assistant', content: streamingMessage.trim() }];
		$streamingMessageStore = null;
		$messagesStore = messages;

		// } catch (e) {
		// 	$errorStore = e;
		// 	return;
		// }

		const { encrypted, iv } = await encrypt({
			encryptionKey,
			plain: {
				...$plainStore,
				messages,
				selectedModelId: $selectedModelIdStore
			}
		});

		if (userMessageTextarea) userMessageTextarea.focus();

		await updateDoc($currentThreadRefStore, {
			encrypted,
			iv,
			updated: serverTimestamp()
		});
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
