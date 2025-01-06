import { derived, writable } from 'svelte/store';
import { onSnapshot, doc } from 'firebase/firestore';

import { db } from '../firestore.js';
import { decrypt } from '../utils/crypto.js';

export const threadIdStore = writable(null);

export const currentThreadRefStore = derived(threadIdStore, (threadId, set) => {
	if (threadId) {
		const threadRef = doc(db, 'threads', threadId);
		set(threadRef);
	} else {
		set(null);
	}
});

export const threadStore = derived(threadIdStore, (threadId, set) => {
	let unsubscribe = null;

	if (threadId) {
		const threadRef = doc(db, 'threads', threadId);
		unsubscribe = onSnapshot(threadRef, (doc) => {
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
