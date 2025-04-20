<script>
	import { sendMessage } from '$lib/send-message';
	import { modelGroups, defaultModelId, modelNamesById } from '$lib/open-router';
	import MarkdownRenderer from './MarkdownRenderer.svelte';

	let { thread } = $props();

	const predefinedSystemMessages = [
		{text: 'You are a helpful assistant.'},
		{
			label: 'YouTube transcript',
			text: 'You are given a YouTube URL. Use the get_youtube_transcript function to fetch the transcript. Then give a long summary of the transcript.',
			modelId: 'openai/gpt-4.1'
		}
	];

	let systemMessage = $state('You are a helpful assistant.');
	let userMessage = $state('');
	let selectedModelId = $state(defaultModelId);
	$effect(() => {
		selectedModelId = thread.selectedModelId || defaultModelId;
	});

	let tempMessages = $state([]);
	let streamingAssistantMessage = $state(null);

	function selectSystemMessage(message) {
		systemMessage = message.text;

		if (message.modelId) {
			selectedModelId = message.modelId;
		}
	}

	async function handleSend() {
		const userMessageCopy = userMessage;
		userMessage = '';

		await sendMessage({
			thread,
			userMessage: userMessageCopy,
			systemMessage,
			selectedModelId,
			setStreamingAssistantMessage: (message) => streamingAssistantMessage = message,
			setTempMessages: (messages) => tempMessages = messages,
		});
	}
</script>

{#each tempMessages as message, i (i)}
	<div class="mb-5">
		<div>{message.role}</div>
		<MarkdownRenderer content={message.content} />
	</div>
{/each}

{#if tempMessages.length > 0}
	<div class="mb-5">
		<div>{modelNamesById[selectedModelId]}</div>
		<MarkdownRenderer content={streamingAssistantMessage || ''} />
	</div>
{:else}
	{#if tempMessages.length == 0 && (!thread.messages || thread.messages.length == 0)}
		<div class="mb-3">
			<label for="system-message">system</label>
			<textarea
				id="system-message"
				bind:value={systemMessage}
				class="dark:bg-gray-800 border-t-0 border-l-0 border-r-0 w-full"
				rows="1"
			></textarea>
			<div class="flex flex-wrap gap-2 mt-2">
				{#each predefinedSystemMessages as message}
					<button 
						type="button"
						class="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
						onclick={() => selectSystemMessage(message)}
					>
						{message.label || message.text}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<label for="user-message">user</label>
	<textarea
		id="user-message"
		bind:value={userMessage}
		onkeydown={(e) => {
			if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
				e.preventDefault();
				handleSend();
			}
		}}
		class="dark:bg-gray-800 border-t-0 border-l-0 border-r-0 w-full"
		rows="1"
	></textarea>

	<select class="dark:bg-gray-800 border-0" bind:value={selectedModelId}>
		{#each modelGroups as { name: groupName, models }}
			<optgroup label={groupName}>
				{#each models as { id, name}}
					<option value={id}>{groupName} {name}</option>
				{/each}
			</optgroup>
		{/each}
	</select>
{/if}