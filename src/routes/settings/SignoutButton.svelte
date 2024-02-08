<script>
	import { getContext } from 'svelte';

	const auth = getContext('auth');

	const handleSignOut = () => {
		auth.signOut();
	};
</script>

<button class="btn btn-link" on:click={handleSignOut}>Sign Out</button>
