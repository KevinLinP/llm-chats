<script>
	import ThreadTitle from './ThreadTitle.svelte';
	import {
		threadStore,
		messagesStore,
		streamingMessageStore,
		errorStore
	} from '$lib/stores/thread-stores.js';
	import ThreadMessageInput from './ThreadMessageInput.svelte';
	import ThreadModelSelector from './ThreadModelSelector.svelte';
	import ThreadDelete from './ThreadDelete.svelte';

	$: thread = $threadStore;
</script>

{#if thread}
	<div class="mb-3 d-flex flex-direction-row align-items-end">
		<div class="flex-grow-1">
			<ThreadTitle />
		</div>

		<ThreadDelete />
	</div>

	{#if $messagesStore.length}
		<div class="pe-5">
			{#each $messagesStore as message, i (i)}
				<p class="mb-3">
					{message.role}
					<br />
					{message.content}
				</p>
			{/each}
		</div>
	{/if}

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
		<div class="d-flex flex-direction-row align-items-end">
			<div class="flex-grow-1">
				<ThreadMessageInput />
			</div>
		</div>

		<div class="mt-2 d-flex flex-direction-row justify-content-end">
			<div>
				<ThreadModelSelector />
			</div>
		</div>
	{/if}
{/if}
