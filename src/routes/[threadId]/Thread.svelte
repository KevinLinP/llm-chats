<script>
	import { onDestroy } from 'svelte';

	import {
		streamingMessageStore,
		errorStore,
	} from '$lib/stores/thread-stores.js';
	import { subscribeThread } from '$lib/thread.js';

	import ThreadTitle from './ThreadTitle.svelte';
	import ThreadMessageInput from './ThreadMessageInput.svelte';
	import ThreadDelete from './ThreadDelete.svelte';

	let { threadId } = $props();
	let thread = $state({});

	let unsubscribe = $state(() => {});
	$effect(() => {
		unsubscribe = subscribeThread({
			threadId,
			threadUpdated: (newThread) => thread = newThread
		});
	});
	onDestroy(() => unsubscribe());
</script>

{#if thread}
	<div class="flex mb-3">
		<div class="flex-grow">
			<ThreadTitle {thread} />
		</div>

		<ThreadDelete />
	</div>

	{#if thread.messages?.length}
		<div class="pe-5">
			{#each thread.messages as message, i (i)}
				<p class="mb-3">
					{message.role}
					<br />
					{message.content}
				</p>
			{/each}
		</div>
	{/if}

	<ThreadMessageInput {thread} />

	{#if $streamingMessageStore}
		<div class="pe-5">
			<p class="mb-3">
				assistant
				<br />
				{$streamingMessageStore}
			</p>
			<p class="text-danger">{$errorStore}</p>
		</div>
	{:else}
	{/if}
{/if}
