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

	{#if thread?.messages?.length}
		<div class="pe-5">
			{#each thread.messages as message}
				{#if message.choices}
					<div class="mb-3">
						<div class="flex">
							<p class="flex-grow">{message.model}</p>
							<p class="text-sm text-gray-500">
								{message.usage.prompt_tokens}
								:
								{message.usage.completion_tokens}
							</p>
						</div>

						<pre class="whitespace-pre-wrap font-sans">{message.choices[0].text.content}</pre>
					</div>
				{:else}
					<div class="mb-3 {message.role === 'user' ? 'text-gray-400' : ''}">
						<p>{message.role}</p>
						<pre class="whitespace-pre-wrap font-sans">{message.content}</pre>
					</div>
				{/if}
			{/each}
		</div>
	{/if}

	<ThreadMessageInput {thread} />
{/if}
