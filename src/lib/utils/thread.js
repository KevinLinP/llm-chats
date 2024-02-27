import { updateDoc, serverTimestamp } from 'firebase/firestore';
import { get } from 'svelte/store';

import {
	plainStore,
	messagesStore,
	streamingMessageStore,
	errorStore,
	currentThreadRefStore
} from '$lib/stores/thread-stores.js';
import { openAiStore } from '$lib/stores/api-stores.js';
import { encryptionKeyStore } from '$lib/stores/crypto-stores.js';
import { encrypt } from '$lib/utils/crypto.js';
import { selectedModelIdStore, selectedModelStore } from '$lib/stores/model-stores.js';

export const getCompletion = async ({ userMessage, systemMessage }) => {
	errorStore.set('');

	const previousMessages = get(messagesStore);
	let messages = previousMessages.length
		? [...previousMessages, { role: 'user', content: userMessage }]
		: [
				{ role: 'system', content: systemMessage },
				{ role: 'user', content: userMessage }
			];

	messagesStore.set(messages);

	const openAi = get(openAiStore);
	// try {
	const completion = await openAi.chat.completions.create({
		messages,
		stream: true,
		...get(selectedModelStore).completionCreateOptions
	});

	let streamingMessage = '';

	for await (const chunk of completion) {
		const choice = chunk.choices[0];
		const chunkContent = choice.delta.content;
		if (chunkContent) {
			streamingMessage = streamingMessage + chunkContent;
			// streamingMessageStore.update((message) => message + chunkContent);
		}
		if (choice.finish_reason && choice.finish_reason != 'stop') {
			streamingMessage = streamingMessage + choice.finish_reason;
		}

		streamingMessageStore.set(streamingMessage);
	}

	messages = [...messages, { role: 'assistant', content: streamingMessage.trim() }];
	streamingMessageStore.set(null);
	messagesStore.set(messages);

	// } catch (e) {
	// 	$errorStore = e;
	// 	return;
	// }

	// do this async
	updateThread({ messages });
};

const updateThread = async ({ messages }) => {
	const encryptionKey = get(encryptionKeyStore);

	const { encrypted, iv } = await encrypt({
		encryptionKey,
		plain: {
			...get(plainStore),
			messages,
			selectedModelId: get(selectedModelIdStore)
		}
	});

	await updateDoc(get(currentThreadRefStore), {
		encrypted,
		iv,
		updated: serverTimestamp()
	});
};
