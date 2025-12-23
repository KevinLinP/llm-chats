<script lang="ts">
	let { onDelete, deleting = false, title }: {
		onDelete: () => Promise<void>;
		deleting?: boolean;
		title: string;
	} = $props();

	const handleDelete = async () => {
		if (!confirm(`Are you sure you want to delete "${title}"?`)) {
			return;
		}

		await onDelete();
	};
</script>

<button
	type="button"
	onclick={handleDelete}
	disabled={deleting}
	class="px-4 py-2 text-gray-400 rounded-lg hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
	title="Delete conversation"
>
	Delete
</button>

