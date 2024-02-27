<script>
	import Thread from '$lib/components/thread/Thread.svelte';
	import ThreadList from '$lib/components/ThreadList.svelte';
</script>

<div class="row">
	<div class="col-2">
		<ThreadList />
	</div>

	<div class="col-10">
		<Thread />
	</div>
</div>
