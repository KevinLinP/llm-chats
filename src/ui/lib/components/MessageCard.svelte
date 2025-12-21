<script lang="ts">
	import type { MessageWithMetadata } from '../../../data/message';

	let { message }: { message: MessageWithMetadata } = $props();
</script>

<div class="bg-gray-800 rounded-lg p-4">
	<div class="text-sm font-medium text-gray-400 mb-2 uppercase">
		{message.sender}
	</div>
	<div class="text-gray-100 whitespace-pre-wrap">{message.text}</div>
</div>

