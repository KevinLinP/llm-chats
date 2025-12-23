// Helper function to decrypt a field
export const decryptField = async ({ encryptedData, iv, encryptionKey }: { encryptedData: Uint8Array; iv: BufferSource; encryptionKey: CryptoKey }): Promise<string> => {
	const decrypted = await crypto.subtle.decrypt(
		{
			name: 'AES-GCM',
			iv
		},
		encryptionKey,
		encryptedData as BufferSource
	);
	return new TextDecoder().decode(decrypted);
};

// Helper function to encrypt a field
export const encryptField = async ({ plaintext, encryptionKey }: { plaintext: string; encryptionKey: CryptoKey }): Promise<{ encryptedData: Uint8Array; iv: Uint8Array }> => {
	// Generate a random IV (12 bytes for AES-GCM)
	const iv = crypto.getRandomValues(new Uint8Array(12));

	const plaintextBytes = new TextEncoder().encode(plaintext);
	const encrypted = await crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv
		},
		encryptionKey,
		plaintextBytes
	);

	return {
		encryptedData: new Uint8Array(encrypted),
		iv
	};
};

