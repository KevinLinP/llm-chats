<script lang="ts">
	import { modelGroups, defaultModelId } from '../../../data/open-router';
	import ConversationSystemMessage from './ConversationSystemMessage.svelte';

	let { onSubmit }: { onSubmit: (title: string, systemMessage: string, userMessage: string, modelId: string) => Promise<void> } = $props();

	let title = $state('');
	let systemMessageText = $state('You are a helpful assistant.');
	let userMessageText = $state('');
	let selectedModelId = $state(defaultModelId);

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault();

		if (title.trim().length > 0 && systemMessageText.trim().length > 0 && userMessageText.trim().length > 0) {
			await onSubmit(title.trim(), systemMessageText.trim(), userMessageText.trim(), selectedModelId);
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

<form onsubmit={handleSubmit} class="flex-1 flex flex-col w-full">
	<div class="space-y-4 mb-6">
		<div>
			<ConversationSystemMessage
				systemMessage={systemMessageText}
				onUpdate={(newSystemMessage) => {
					systemMessageText = newSystemMessage;
				}}
			/>
		</div>
	</div>

	<div class="mt-auto pt-6 space-y-4">
		<div>
			<label for="title" class="block text-sm font-medium text-gray-300 mb-2">
				Title
			</label>
			<input
				id="title"
				type="text"
				bind:value={title}
				placeholder="Enter conversation title"
				class="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>

		<div>
			<label for="userMessage" class="block text-sm font-medium text-gray-300 mb-2">
				User Message
			</label>
			<textarea
				id="userMessage"
				bind:value={userMessageText}
				placeholder="Enter your message"
				rows="3"
				onkeydown={handleKeyDown}
				class="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
					class="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
				class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
			>
				Send
			</button>
		</div>
	</div>
</form>

