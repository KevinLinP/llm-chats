<script lang="ts">
	import { page } from '$app/stores';
	import Conversation from '$lib/components/Conversation.svelte';
	
	const id = $derived($page.params.id);
</script>

<Conversation id={id} />

