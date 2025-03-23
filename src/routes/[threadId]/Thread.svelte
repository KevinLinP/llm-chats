<script>
	import { onDestroy } from 'svelte';

	import { subscribeThread } from '$lib/thread';

	// TODO: remove Thread prefix
	import ThreadTitle from './ThreadTitle.svelte';
	import ThreadMessageInput from './ThreadMessageInput.svelte';
	import DeleteButton from './DeleteButton.svelte';
	import { debug } from 'openai/core';

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

	{#if thread.chatCompletions?.length}
		<div class="pe-5">
			{#each thread.chatCompletions as completion }
				<pre class="whitespace-pre-wrap font-sans">{completion.choices[0].text.content}</pre>
			{/each}
		</div>
	{:else}
		{#if thread?.messages?.length}
			<div class="pe-5">
				{#each thread.messages as message, i (i)}
					<div class="mb-3">
						<p>{message.role}</p>
						<pre class="whitespace-pre-wrap font-sans {message.role === 'user' ? 'text-gray-400' : ''}">{message.content}</pre>
					</div>
				{/each}
			</div>
		{/if}
	{/if}

	<ThreadMessageInput {thread} />
{/if}
