<script>
	import { getContext } from 'svelte';

	import { auth } from '$lib/firestore';

	const handleSignOut = () => {
		auth.signOut();
	};
</script>

<button class="btn btn-link" on:click={handleSignOut}>Sign Out</button>
