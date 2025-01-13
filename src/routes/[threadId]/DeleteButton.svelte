<script>
	import { goto } from '$app/navigation';
	import { deleteThread } from '$lib/thread';

	let { thread } = $props();

	const handleDelete = () => {
		goto('/');
		deleteThread(thread);
	};
</script>

<button class="px-3 py-3" onclick={handleDelete}>delete</button> 