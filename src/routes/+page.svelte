<script>
	import Thread from './Thread.svelte';
	import ThreadList from './ThreadList.svelte';
	import { writable } from 'svelte/store';

	let currentThreadRefStore = writable(null);
</script>

<div class="d-flex flex-direction-row" style="gap: 3rem;">
	<div>
		<ThreadList {currentThreadRefStore} />
	</div>

	<div class="flex-grow-1">
		<Thread {currentThreadRefStore} />
	</div>
</div>
