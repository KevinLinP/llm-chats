import { derived, writable } from 'svelte/store';
import { onSnapshot } from 'firebase/firestore';

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
