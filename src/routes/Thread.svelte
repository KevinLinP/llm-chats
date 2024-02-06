<script>
	import { getContext } from 'svelte';
	import { serverTimestamp, updateDoc } from 'firebase/firestore';
	import OpenAI from 'openai';

	export let thread;

	const encryptionKey = getContext('encryptionKey');
	console.log(encryptionKey);

	$: {
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

	$: iv = new Uint8Array(thread.data().iv.toUint8Array());
	$: encrypted = new Uint8Array(thread.data().encrypted.toUint8Array());

	let plain = null;

	$: {
		const something = async () => {
			const decrypted = await window.crypto.subtle.decrypt(
				{
					name: 'AES-GCM',
					iv
				},
				encryptionKey,
				encrypted
			);

			plain = JSON.parse(new TextDecoder().decode(decrypted));
		};

		something();
	}

	$: console.log({ plain });

	$: messages = plain?.messages || [];

	const handleSend = async () => {
		assistantMessage = '';
		error = '';

		const newMessages = [
			...(messages || [{ role: 'system', content: systemMessage }]),
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
	};

	const saveTitle = async () => {
		updateDoc(thread.ref, {
			plain: {
				...plain,
				title
			},
			updated: serverTimestamp()
		});
	};
</script>

<div class="mb-3">
	<input
		type="text"
		bind:value={title}
		on:blur={saveTitle}
		class="form-control title-input"
		class:blank={!title.length}
		placeholder="title"
	/>
</div>

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
		<textarea
			id="system-message"
			bind:value={systemMessage}
			class="form-control minimal-input"
			rows="1"
		/>
	</div>
{/if}

<div class="d-flex flex-direction-row align-items-end">
	<div class="flex-grow-1">
		<label for="user-message" class="form-label">user</label>
		<textarea
			id="user-message"
			bind:value={userMessage}
			on:keydown={(e) => {
				if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
					e.preventDefault();
					handleSend();
				}
			}}
			class="form-control minimal-input"
			rows="1"
		/>
	</div>

	<div>
		<button class="btn btn-text" on:click={handleSend}>Send</button>
	</div>
</div>

<p>{assistantMessage}</p>
<p class="text-danger">{error}</p>

<style lang="scss">
	.title-input {
		border-radius: 0;
		&:not(:focus) {
			&:not(.blank) {
				border: none;
				padding-left: 0;
			}
		}

		&:focus,
		&.blank {
			border-top: none;
			border-left: none;
			border-right: none;
		}
	}
	.minimal-input {
		border-top: none;
		border-left: none;
		border-right: none;
		border-radius: 0;
	}
</style>
