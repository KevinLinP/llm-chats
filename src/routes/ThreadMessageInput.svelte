<script>
	import { plainStore, messagesStore, streamingMessageStore, errorStore } from './thread-stores.js';
	import { encryptionKeyStore } from './crypto-stores.js';

	let systemMessage = 'You are a helpful assistant.';
	let userMessage = '';
	let userMessageTextarea = null;

	$: encryptionKey = $encryptionKeyStore;

	const handleSend = async () => {
		$streamingMessageStore = '';
		$errorStore = '';

		// TODO: immediately show user message as submitted, even if isn't persisted yet

		if ($messagesStore.length) {
			messagesStore.update((messages) => [...messages, { role: 'user', content: userMessage }]);
		} else {
			messagesStore.set([
				{ role: 'system', content: systemMessage },
				{ role: 'user', content: userMessage }
			]);
		}

		userMessage = '';

		console.log(openai);
		try {
			const completion = await openai.chat.completions.create({
				messages: $messagesStore,
				stream: true,
				...selectedModel.completionCreateOptions
			});

			for await (const chunk of completion) {
				const choice = chunk.choices[0];
				const chunkContent = choice.delta.content;
				if (chunkContent) {
					streamingMessageStore.update((message) => message + chunkContent);
				}
				if (choice.finish_reason && choice.finish_reason != 'stop') {
					streamingMessageStore.update((message) => message + choice.finish_reason);
				}
			}

			messagesStore.update((messages) => [
				...messages,
				{ role: 'assistant', content: $streamingMessageStore.trim() }
			]);

			$streamingMessageStore = null;
		} catch (e) {
			$errorStore = e;
			return;
		}

		const { encrypted, iv } = await encrypt({
			encryptionKey,
			plain: {
				...$plainStore,
				messages: $messagesStore,
				selectedModelId
			}
		});

		if (userMessageTextarea) userMessageTextarea.focus();

		await updateDoc(currentThreadRef, {
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
