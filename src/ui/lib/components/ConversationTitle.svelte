<script lang="ts">
	let { title, onUpdate, updating = $bindable(false) }: {
		title: string;
		onUpdate: (newTitle: string) => Promise<void>;
		updating?: boolean;
	} = $props();

	let isEditing = $state(false);
	let editedTitle = $state('');

	// Autofocus action for title input
	function autofocus(node: HTMLInputElement) {
		node.focus();
		node.select();
	}

	const handleEdit = () => {
		isEditing = true;
		editedTitle = title;
	};

	const handleSave = async () => {
		const trimmedTitle = editedTitle.trim();
		if (!trimmedTitle || trimmedTitle === title) {
			isEditing = false;
			return;
		}

		updating = true;
		try {
			await onUpdate(trimmedTitle);
		} finally {
			updating = false;
			isEditing = false;
		}
	};

	const handleCancel = () => {
		isEditing = false;
		editedTitle = '';
	};
</script>

{#if isEditing}
	<input
		type="text"
		bind:value={editedTitle}
		disabled={updating}
		onkeydown={(e) => {
			if (e.key === 'Enter') {
				handleSave();
			} else if (e.key === 'Escape') {
				handleCancel();
			}
		}}
		onblur={handleSave}
		class="flex-1 text-2xl font-bold text-gray-100 bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
		use:autofocus
	/>
{:else}
	<button
		type="button"
		onclick={handleEdit}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				handleEdit();
			}
		}}
		class="flex-1 text-2xl font-bold text-gray-100 cursor-pointer hover:text-gray-200 transition-colors text-left"
		title="Click to edit title"
	>
		{title}
	</button>
{/if}

