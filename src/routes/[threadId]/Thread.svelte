<script>
	import { onDestroy } from 'svelte';

	import { subscribeThread } from '$lib/thread';

	// TODO: remove Thread prefix
	import ThreadTitle from './ThreadTitle.svelte';
	import ThreadMessageInput from './ThreadMessageInput.svelte';
	import DeleteButton from './DeleteButton.svelte';
	import MarkdownRenderer from './MarkdownRenderer.svelte';
	import { modelNamesById } from '$lib/open-router';

	let { threadId } = $props();
	let thread = $state({});

	let unsubscribe = $state(null);
	$effect(() => {
		unsubscribe = subscribeThread({
			threadId,
			threadUpdated: (newThread) => thread = newThread
		}).unsubscribe;
	});
	onDestroy(() => unsubscribe && unsubscribe());

	$inspect(thread);
</script>

{#if thread}
	<div class="flex mb-3">
		<div class="flex-grow">
			<ThreadTitle {thread} />
		</div>

		<DeleteButton {thread} />
	</div>

	{#if thread?.messages?.length}
		<div class="pe-5">
			{#each thread.messages as message}
				{#if message.choices}
					<div class="mb-3">
						<div class="flex">
							<p class="flex-grow">{modelNamesById[message.modelId]}</p>
							<p class="text-sm text-gray-500">
								{message.usage.prompt_tokens}
								:
								{message.usage.completion_tokens}
							</p>
						</div>

						<MarkdownRenderer content={message.choices[0].text.content} />
					</div>
				{:else}
					<div class="mb-3">
						<p>{message.role}</p>
						<MarkdownRenderer content={message.content} />
					</div>
				{/if}
			{/each}
		</div>
	{/if}

	<ThreadMessageInput {thread} />
{/if}