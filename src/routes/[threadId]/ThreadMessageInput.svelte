<script>
	import { sendMessage } from '$lib/thread';
	import { modelGroups, defaultModelId } from '$lib/open-router';

	let { thread } = $props();

	let systemMessage = $state('You are a helpful assistant.');
	let userMessage = $state('');
	let selectedModelId = $state(defaultModelId);
	$effect(() => {
		selectedModelId = thread.selectedModelId || defaultModelId;
	});

	let tempMessages = $state([]);
	let streamingAssistantMessage = $state(null);

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
		<div>{message.content}</div>
	</div>
{/each}

{#if tempMessages.length > 0}
	<div class="mb-5">
		<div>assistant</div>
		<div>{streamingAssistantMessage}</div>
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