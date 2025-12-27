<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import 'bootstrap/dist/css/bootstrap.min.css';
	import 'bootstrap/dist/js/bootstrap.bundle.min.js';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<!-- Bootstrap 5 required-->
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
</svelte:head>

{@render children()}
