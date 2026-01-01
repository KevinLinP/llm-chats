import type { EncryptedColumn } from "../repositories/helpers/types";

let encryptionKey: CryptoKey | null = null;

export async function setCryptoKey(jwk: JsonWebKey): Promise<void> {
  encryptionKey = await crypto.subtle.importKey('jwk', jwk, { name: 'AES-GCM' }, false, ['decrypt', 'encrypt']);

  return;
}

export const encrypt = async (plainText: string): Promise<EncryptedColumn> => {
  if (encryptionKey === null) {
    throw new Error('Encryption key not set');
  }

	const plaintextBytes = new TextEncoder().encode(plainText);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encrypted = await crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv
		},
		encryptionKey,
		plaintextBytes
	);

	return [iv, new Uint8Array(encrypted)];
};

export const decrypt = async (encrypted: EncryptedColumn): Promise<string> => {
  if (encryptionKey === null) {
    throw new Error('Encryption key not set');
  }

	const decrypted = await crypto.subtle.decrypt(
		{
			name: 'AES-GCM',
			iv: encrypted[0] as BufferSource
		},
		encryptionKey,
		encrypted[1] as BufferSource
	);
	return new TextDecoder().decode(decrypted);
};