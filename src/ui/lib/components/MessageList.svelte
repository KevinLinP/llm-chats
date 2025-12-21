<script lang="ts">
	import MessageCard from './MessageCard.svelte';
	import type { MessageWithMetadata } from '../../../data/message';

	let { messages, loading }: { messages: MessageWithMetadata[]; loading: boolean } = $props();
</script>

{#if loading}
	<div class="flex-1 flex items-center justify-center">
		<div class="text-gray-400">Loading messages...</div>
	</div>
{:else}
	<div class="space-y-4 flex-1 overflow-y-auto">
		{#each messages as message (message.id)}
			<MessageCard {message} />
		{/each}
	</div>
{/if}

