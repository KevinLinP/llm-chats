<script>
	import { page } from '$app/state';

	import Thread from '$lib/components/thread/Thread.svelte';
	import ThreadList from '$lib/components/ThreadList.svelte';

	let threadId = $derived(page.params.threadId);
</script>

<div class="flex gap-4">
	<div>
		<ThreadList />
	</div>

	<div>
		<Thread threadId={threadId} />
	</div>
</div>
