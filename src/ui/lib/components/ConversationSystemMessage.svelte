<script lang="ts">
	let { systemMessage, onUpdate }: {
		systemMessage: string;
		onUpdate: (newSystemMessage: string) => void;
	} = $props();

	let isEditing = $state(false);
	let editedSystemMessage = $state('');

	// Autofocus action for textarea
	function autofocus(node: HTMLTextAreaElement) {
		node.focus();
		node.select();
	}

	const handleEdit = () => {
		isEditing = true;
		editedSystemMessage = systemMessage;
	};

	const handleSave = () => {
		const trimmed = editedSystemMessage.trim();
		if (trimmed !== systemMessage) {
			onUpdate(trimmed);
		}
		isEditing = false;
	};

	const handleCancel = () => {
		isEditing = false;
		editedSystemMessage = '';
	};
</script>

{#if isEditing}
	<textarea
		bind:value={editedSystemMessage}
		onkeydown={(e) => {
			if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				handleSave();
			} else if (e.key === 'Escape') {
				e.preventDefault();
				handleCancel();
			}
		}}
		onblur={handleSave}
		rows="3"
		class="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
		class="w-full text-left text-sm text-gray-600 cursor-pointer hover:text-gray-300 transition-colors px-2 py-1 rounded"
		title="Click to edit system message"
	>
		system: {systemMessage || 'You are a helpful assistant.'}
	</button>
{/if}

