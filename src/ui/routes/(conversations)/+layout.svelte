<script lang="ts">
	import ConversationList from '$lib/components/ConversationList.svelte';

	let { children } = $props();
</script>

<div class="flex h-screen bg-gray-950">
	<ConversationList />
	{@render children()}
</div>
