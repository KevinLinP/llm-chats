import { derived, writable } from 'svelte/store';
import { onSnapshot } from 'firebase/firestore';

import { decrypt } from '../utils/crypto.js';

export const currentThreadRefStore = writable(null);

export const threadStore = derived(currentThreadRefStore, ($threadRef, set) => {
	let unsubscribe = null;

	if ($threadRef) {
		unsubscribe = onSnapshot($threadRef, (doc) => {
			set(doc);
		});
	} else {
		unsubscribe = null;
		set(null);
	}

	return () => {
		unsubscribe && unsubscribe();
	};
});

export const plainStore = derived(
	[threadStore],
	async ([thread], set) => {
		if (thread) {
			const plain = await decrypt({ thread });
			set(plain);
			messagesStore.set(plain.messages || []);
		} else {
			set(null);
			messagesStore.set([]);
		}
	}
);

export const messagesStore = writable([]);
export const streamingMessageStore = writable(null);

export const errorStore = writable('');
