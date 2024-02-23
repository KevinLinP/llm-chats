<script>
	import { getContext } from 'svelte';
	import { encrypt } from '../crypto';
	import { serverTimestamp, updateDoc } from 'firebase/firestore';

	export let threadRef;
	export let plainStore;

	const encryptionKey = getContext('encryptionKey');

	$: plain = $plainStore;

	let title = '';
	plainStore.subscribe((value) => {
		title = value.title;
	});

	let titleInput = null;

	$: {
		if (title) {
			document.title = `${title} - LLM-Chats`;
		}
	}

	const saveTitle = async () => {
		const newPlain = {
			...plain,
			title
		};

		const { encrypted, iv } = await encrypt({
			encryptionKey,
			plain: newPlain
		});

		updateDoc(threadRef, {
			encrypted,
			iv,
			updated: serverTimestamp()
		});
	};
</script>

<input
	type="text"
	bind:this={titleInput}
	bind:value={title}
	on:blur={saveTitle}
	on:keydown={(e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			saveTitle();
			titleInput.blur();
		}
	}}
	class="form-control title-input"
	class:blank={!title?.length}
	placeholder="title"
/>

<style lang="scss">
	.title-input {
		border-radius: 0;
		font-size: 1.5rem;
		&:not(:focus) {
			&:not(.blank) {
				border-top: none;
				border-left: none;
				border-right: none;
				padding-left: 0;
			}
		}

		&:focus,
		&.blank {
			border-top: none;
			border-left: none;
			border-right: none;
		}
	}
</style>
