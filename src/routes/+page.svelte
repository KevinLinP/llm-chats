<script>
	import Thread from './Thread.svelte';
	import ThreadList from './ThreadList.svelte';
	import { writable } from 'svelte/store';

	let currentThreadRefStore = writable(null);
</script>

<div class="row">
	<div class="col-2">
		<ThreadList {currentThreadRefStore} />
	</div>

	<div class="col-10">
		<Thread {currentThreadRefStore} />
	</div>
</div>
