<script>
	import { getContext, onDestroy } from 'svelte';
	import { serverTimestamp, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
	import OpenAI from 'openai';
	import { writable } from 'svelte/store';

	import ThreadTitle from './Thread/ThreadTitle.svelte';
	import { decrypt, encrypt } from './crypto';
	import { currentThreadRefStore, threadStore } from './stores.js';

	// TODO: break this down into smaller files

	const encryptionKey = getContext('encryptionKey');

	$: currentThreadRef = $currentThreadRefStore;

	let thread = null;
	let plainStore = writable({});
	let displayedMessages = [];
	let isStreaming = false;
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
			id: 'openai-gpt-4-turbo',
			label: 'OpenAI GPT-4 Turbo',
			completionCreateOptions: {
				model: 'gpt-4-0125-preview'
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
	$: selectedModel = availableModels.find((model) => model.id === selectedModelId);

	threadStore.subscribe(async (value) => {
		thread = value;
		if (!thread) return;

		$plainStore = await decrypt({ encryptionKey, thread });
		displayedMessages = $plainStore.messages || [];
		if ($plainStore.selectedModelId) {
			selectedModelId = $plainStore.selectedModelId;
		}
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

	let systemMessage = 'You are a helpful assistant.';
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
				...$plainStore,
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

	const handleDestroy = () => {
		thread = null;
		deleteDoc(currentThreadRef);
		currentThreadRefStore.set(null);
	};
</script>

{#if thread}
	<div class="mb-3 d-flex flex-direction-row align-items-end">
		<div class="flex-grow-1">
			<ThreadTitle threadRef={currentThreadRef} {plainStore} />
		</div>

		<button class="btn btn-text" on:click={handleDestroy}>delete</button>
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
		</div>

		<div class="mt-2 d-flex flex-direction-row justify-content-end">
			<div>
				<select class="form-select model-select" bind:value={selectedModelId}>
					{#each availableModels as { id, label }}
						<option value={id}>{label}</option>
					{/each}
				</select>
			</div>
		</div>
	{/if}
{/if}

<style lang="scss">
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
