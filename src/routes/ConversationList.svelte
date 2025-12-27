<script lang="ts">
	import { getConversations } from "$lib/stores/conversation-store.svelte";

  const conversations = getConversations();
</script>

<div>
  {#each conversations as conversation}
    <div>{conversation.title}</div>
  {/each}
</div>