<script lang="ts">
	import { createConversation } from '../../../data/conversation';

	let title = $state('');
	let systemMessageText = $state('');
	let userMessageText = $state('');

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault();

		console.log('handleSubmit', title, systemMessageText, userMessageText);
		
		if (title.trim().length > 0 && systemMessageText.trim().length > 0 && userMessageText.trim().length > 0) {
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			
			await createConversation({
				title: title.trim(),
				systemMessage: {
					sender: 'system',
					text: systemMessageText.trim()
				},
				userMessage: {
					sender: 'user',
					text: userMessageText.trim()
				},
				timezone
			});
		}
	};
</script>

<main class="flex-1 overflow-y-auto h-full bg-gray-950 flex flex-col">
	<div class="max-w-4xl mx-auto p-6 flex-1 flex flex-col">
		<form onsubmit={handleSubmit} class="flex-1 flex flex-col">
			<div class="space-y-4 mb-6">
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
					<label for="systemMessage" class="block text-sm font-medium text-gray-300 mb-2">
						System Message
					</label>
					<textarea
						id="systemMessage"
						bind:value={systemMessageText}
						placeholder="Enter system message"
						rows="3"
						class="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
					></textarea>
				</div>
			</div>

			<div class="mt-auto pt-6">
				<label for="userMessage" class="block text-sm font-medium text-gray-300 mb-2">
					User Message
				</label>
				<textarea
					id="userMessage"
					bind:value={userMessageText}
					placeholder="Enter your message"
					rows="3"
					class="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
				></textarea>
				<button
					type="submit"
					class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
				>
					Submit
				</button>
			</div>
		</form>
	</div>
</main>

