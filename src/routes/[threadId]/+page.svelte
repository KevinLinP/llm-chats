<script>
	import { page } from '$app/state';

	import ThreadList from '../ThreadList.svelte';
	import Thread from './Thread.svelte';

	let threadId = $derived(page.params.threadId);
</script>

<div class="flex gap-4">
	<div>
		<ThreadList />
	</div>

	<div class="flex-grow">
		<Thread threadId={threadId} />
	</div>
</div>
