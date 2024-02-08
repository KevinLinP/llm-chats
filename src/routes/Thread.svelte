<script>
	import { getContext, onDestroy } from 'svelte';
	import { serverTimestamp, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
	import { decrypt, encrypt } from './crypto';
	import OpenAI from 'openai';
	import { get } from 'svelte/store';

	export let currentThreadRefStore;
	const encryptionKey = getContext('encryptionKey');

	let currentThreadRef = null;
	let thread = null;
	let title = null;
	let plain = {};
	let unsubscribe = null;
	let displayedMessages = [];
	let isStreaming = false;
	let titleInput = null;
	let userMessageTextarea = null;

	const openAiConfig = getContext('openAiConfig');

	const availableModels = [
		{
			id: 'openai-gpt-3.5-turbo',
			label: 'OpenAI GPT-3.5 Turbo',
			completionCreateOptions: {
				model: 'gpt-3.5-turbo-0125'
			}
		},
		{
			id: 'local',
			label: 'local',
			completionCreateOptions: {}
		}
	];

	$: openAiOptions = [
		{
			id: 'local',
			options: {
				apiKey: 'not needed',
				baseURL: 'http://localhost:1234/v1/'
			}
		},
		{
			id: 'openai-gpt-3.5-turbo',
			options: $openAiConfig
		}
	];

	let selectedModelId = availableModels[0].id;
	console.log({ selectedModelId, availableModels });
	$: selectedModel = availableModels.find((model) => model.id === selectedModelId);

	currentThreadRefStore.subscribe((ref) => {
		currentThreadRef = ref;

		if (currentThreadRef) {
			if (unsubscribe) unsubscribe();

			unsubscribe = onSnapshot(currentThreadRef, async (doc) => {
				if (doc.exists()) {
					thread = doc;
					plain = await decrypt({ encryptionKey, thread });
					title = plain.title;
					displayedMessages = plain.messages || [];
					selectedModelId = plain.selectedModelId;
				} else {
					thread = null;
				}
			});
		} else {
			thread = null;
		}
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	let openai = null;
	$: {
		if (selectedModel) {
			const options = openAiOptions.find((option) => option.id === selectedModel.id)?.options;
			if (options) {
				openai = new OpenAI({ dangerouslyAllowBrowser: true, ...options });
			}
		}
	}

	let systemMessage = 'You are a helpful assistant that NEVER includes follow-up instructions.';
	let userMessage = '';
	// TODO: render Markdown properly
	let assistantMessage = '';
	let error = '';

	const handleSend = async () => {
		assistantMessage = '';
		error = '';

		// TODO: immediately show user message as submitted, even if isn't persisted yet

		if (displayedMessages.length) {
			displayedMessages = [...displayedMessages, { role: 'user', content: userMessage }];
		} else {
			displayedMessages = [
				{ role: 'system', content: systemMessage },
				{ role: 'user', content: userMessage }
			];
		}

		userMessage = '';

		try {
			isStreaming = true;

			const completion = await openai.chat.completions.create({
				messages: displayedMessages,
				stream: true,
				...selectedModel.completionCreateOptions
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

			displayedMessages = [
				...displayedMessages,
				{ role: 'assistant', content: assistantMessage.trim() }
			];

			isStreaming = false;
		} catch (e) {
			error = e;
			return;
		}

		const { encrypted, iv } = await encrypt({
			encryptionKey,
			plain: {
				...plain,
				messages: displayedMessages,
				selectedModelId
			}
		});

		if (userMessageTextarea) userMessageTextarea.focus();

		await updateDoc(currentThreadRef, {
			encrypted,
			iv,
			updated: serverTimestamp()
		});

		assistantMessage = '';
	};

	const saveTitle = async () => {
		const newPlain = {
			...plain,
			title
		};

		console.log({ newPlain });

		const { encrypted, iv } = await encrypt({
			encryptionKey,
			plain: newPlain
		});

		updateDoc(currentThreadRef, {
			encrypted,
			iv,
			updated: serverTimestamp()
		});
	};

	const handleDestroy = () => {
		thread = null;
		deleteDoc(currentThreadRef);
		currentThreadRefStore.set(null);
	};
</script>

{#if thread}
	<div class="mb-3 d-flex flex-direction-row align-items-end">
		<div class="flex-grow-1">
			<input
				type="text"
				bind:this={titleInput}
				bind:value={title}
				on:blur={saveTitle}
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						saveTitle();
						titleInput.blur();
					}
				}}
				class="form-control title-input"
				class:blank={!title?.length}
				placeholder="title"
			/>
		</div>

		<div>
			<select class="form-select model-select" bind:value={selectedModelId}>
				{#each availableModels as { id, label }}
					<option value={id}>{label}</option>
				{/each}
			</select>
		</div>

		<button class="btn btn-link" on:click={handleDestroy}>delete</button>
	</div>

	{#if displayedMessages?.length}
		<div class="pe-5">
			{#each displayedMessages as message, i (i)}
				<p class="mb-3">
					{message.role}
					<br />
					{message.content}
				</p>
			{/each}
		</div>
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

	{#if isStreaming}
		<div class="pe-5">
			<p class="mb-3">
				assistant
				<br />
				{assistantMessage}
			</p>
			<p class="text-danger">{error}</p>
		</div>
	{:else}
		<div class="d-flex flex-direction-row align-items-end">
			<div class="flex-grow-1">
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
			</div>

			<div>
				<button class="btn btn-text" on:click={handleSend}>Send</button>
			</div>
		</div>
	{/if}
{/if}

<style lang="scss">
	.title-input {
		border-radius: 0;
		font-size: 1.5rem;
		&:not(:focus) {
			&:not(.blank) {
				border-top: none;
				border-left: none;
				border-right: none;
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

	.model-select {
		border: 0;
	}
</style>
