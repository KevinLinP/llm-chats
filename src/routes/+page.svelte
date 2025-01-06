<script>
	import Thread from '$lib/components/thread/Thread.svelte';
	import ThreadList from '$lib/components/ThreadList.svelte';
</script>

<div class="flex gap-4">
	<div>
		<ThreadList />
	</div>

	<div>
		<Thread />
	</div>
</div>
