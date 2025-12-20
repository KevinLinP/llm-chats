<script lang="ts">
	import ConversationList from '$lib/components/ConversationList.svelte';
	import Conversation from '$lib/components/Conversation.svelte';
</script>

<div class="flex h-screen bg-gray-950">
	<ConversationList />
	<Conversation />
</div>
