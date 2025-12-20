// Cache for encryption key
let cachedEncryptionKey: CryptoKey | null = null;
let cachedJwk: JsonWebKey | null = null;

export const setupEncryptionKey = async (jwk: JsonWebKey): Promise<CryptoKey> => {
	// If already set up with a different JWK, throw an exception
	if (cachedJwk !== null && JSON.stringify(cachedJwk) !== JSON.stringify(jwk)) {
		throw new Error('Encryption key already set up with a different key. Cannot set up with different key.');
	}

	// Return cached key if it exists
	if (cachedEncryptionKey !== null) {
		return cachedEncryptionKey;
	}

	// Import the JWK key as a CryptoKey
	cachedEncryptionKey = await crypto.subtle.importKey(
		'jwk',
		jwk,
		{ name: 'AES-GCM' },
		false,
		['decrypt', 'encrypt']
	);
	cachedJwk = jwk;

	return cachedEncryptionKey;
};

export const getEncryptionKey = (): CryptoKey => {
	if (cachedEncryptionKey === null) {
		throw new Error('Encryption key not set up. Call setupEncryptionKey() first.');
	}
	return cachedEncryptionKey;
};

