<script>
	import { onDestroy } from 'svelte';

	import { subscribeThread } from '$lib/thread';

	// TODO: remove Thread prefix
	import ThreadTitle from './ThreadTitle.svelte';
	import ThreadMessageInput from './ThreadMessageInput.svelte';
	import DeleteButton from './DeleteButton.svelte';
	import MarkdownRenderer from './MarkdownRenderer.svelte';
	import { displayMessages } from '$lib/messages';

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

	const messages = $derived(displayMessages(thread.messages || []));
	$inspect(messages);

	$inspect(thread);
</script>

{#if thread}
	<div class="flex mb-3">
		<div class="flex-grow">
			<ThreadTitle {thread} />
		</div>

		<DeleteButton {thread} />
	</div>

	<div class="pe-5">
		{#each messages as message}
			<div class="mb-3">
				<div class="flex">
					<p class="flex-grow">{message.author}</p>

					{#if message.usage}
						<p class="text-sm text-gray-500">
							{message.usage.prompt_tokens}
							:
							{message.usage.completion_tokens}
						</p>
					{/if}
				</div>

				{#if message.reasoning}
					<p class="text-sm text-gray-500 my-3">{message.reasoning}</p>
				{/if}

				<MarkdownRenderer content={message.content} />

				{#if message.citations}
					<ul class="list-none">
						{#each Object.entries(message.citations) as [number, url]}
						<li>
							<span class="text-gray-300">{number}.</span> <a href={url} class="text-gray-400" target="_blank">{url}</a>
						</li>
					{/each}
					</ul>
				{/if}
			</div>
		{/each}
	</div>

	<ThreadMessageInput {thread} />
{/if}