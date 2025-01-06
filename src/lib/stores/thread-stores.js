import { derived, writable } from 'svelte/store';
import { onSnapshot } from 'firebase/firestore';

import { encryptionKeyStore } from './crypto-stores.js';
import { decrypt } from '../utils/crypto.js';
import { getKey } from '$lib/encryption-key.js';

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
			const encryptionKey = getKey();
			const plain = await decrypt({ encryptionKey, thread });
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
