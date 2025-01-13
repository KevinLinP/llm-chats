import { Bytes } from 'firebase/firestore';
import { getKey } from '$lib/encryption-key.js';

export const printNewJwkKey = async () => {
	const key = await window.crypto.subtle.generateKey(
		{
			name: 'AES-GCM',
			length: 256
		},
		true,
		['encrypt', 'decrypt']
	);

	const jwkKey = await window.crypto.subtle.exportKey('jwk', key);

	console.log(JSON.stringify(jwkKey));
};

export const decrypt = async ({ thread }) => {
	const encryptionKey = getKey();

	const arrayBuffer = await window.crypto.subtle.decrypt(
		{
			name: 'AES-GCM',
			iv: new Uint8Array(thread.data().iv.toUint8Array())
		},
		encryptionKey,
		new Uint8Array(thread.data().encrypted.toUint8Array())
	);

	const decrypted = JSON.parse(new TextDecoder().decode(arrayBuffer));

	return {id: thread.id, ...decrypted};
};

export const encrypt = async ({ plain }) => {
	const encryptionKey = getKey();

	const enc = new TextEncoder();
	const encoded = enc.encode(JSON.stringify(plain));
	const iv = window.crypto.getRandomValues(new Uint8Array(12));
	const encrypted = await window.crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv
		},
		encryptionKey,
		encoded
	);

	return {
		iv: Bytes.fromUint8Array(iv),
		encrypted: Bytes.fromUint8Array(new Uint8Array(encrypted))
	};
};
