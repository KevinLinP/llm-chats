<script lang="ts">
	import { modelGroups, defaultModelId, modelNamesById } from '../../../data/open-router';

	let {
		conversationId,
		onSend,
		streaming,
		defaultModelId: propDefaultModelId
	}: {
		conversationId: string;
		onSend: (userMessage: string, modelId: string) => Promise<void>;
		streaming: boolean;
		defaultModelId?: string;
	} = $props();

	let userMessage = $state('');
	let selectedModelId = $state(propDefaultModelId || defaultModelId);

	// Update selectedModelId when propDefaultModelId changes
	$effect(() => {
		if (propDefaultModelId) {
			selectedModelId = propDefaultModelId;
		}
	});

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault();
		if (userMessage.trim().length > 0 && !streaming) {
			const messageToSend = userMessage.trim();
			userMessage = '';
			await onSend(messageToSend, selectedModelId);
		}
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			const form = (event.target as HTMLElement).closest('form');
			if (form) {
				form.requestSubmit();
			}
		}
	};
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<div>
		<label for="user-message" class="block text-sm font-medium text-gray-300 mb-2">
			User Message
		</label>
		<textarea
			id="user-message"
			bind:value={userMessage}
			placeholder="Enter your message"
			rows="3"
			disabled={streaming}
			onkeydown={handleKeyDown}
			class="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
		></textarea>
	</div>

	<div class="flex items-end gap-4">
		<div class="flex-1">
			<label for="model-select" class="block text-sm font-medium text-gray-300 mb-2">
				Model
			</label>
			<select
				id="model-select"
				bind:value={selectedModelId}
				disabled={streaming}
				class="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#each modelGroups as { name: groupName, models }}
					<optgroup label={groupName}>
						{#each models as { id, name }}
							<option value={id}>{groupName} {name}</option>
						{/each}
					</optgroup>
				{/each}
			</select>
		</div>

		<button
			type="submit"
			disabled={streaming || userMessage.trim().length === 0}
			class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Send
		</button>
	</div>
</form>

