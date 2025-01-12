<script>
	import { updateThread } from '$lib/thread.js';

	let { thread } = $props();

	let titleInput = $state('');
	$effect(() => {
		titleInput = thread.title;
		if (thread.title) {
			document.title = `${thread.title} - LLM-Chats`;
		}
	})

	const saveTitle = () => {
		updateThread({
			...thread,
			title: titleInput
		});
	}
</script>

<input
	type="text"
	bind:value={titleInput}
	onblur={saveTitle}
	onkeydown={(e) => {
		if (e.key === 'Enter') {
			saveTitle();
		}
	}}
	class="dark:bg-gray-800 border-t-0 border-l-0 border-r-0 w-full"
	class:blank={thread.title?.length}
	placeholder="title"
/>