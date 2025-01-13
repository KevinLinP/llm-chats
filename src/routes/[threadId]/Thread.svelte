<script>
	import { onDestroy } from 'svelte';

	import { subscribeThread } from '$lib/thread.js';

	// TODO: remove Thread prefix
	import ThreadTitle from './ThreadTitle.svelte';
	import ThreadMessageInput from './ThreadMessageInput.svelte';
	import DeleteButton from './DeleteButton.svelte';

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

		<DeleteButton {thread} />
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
{/if}
