import { getConversation as getEncryptedConversation, type EncryptedConversation } from '../db/conversation';

type Conversation = {
	id: string;
	title: string;
  text: string[];
	createdAt: Date;
	updatedAt: Date;
};

// helper function to decrypt a field
const decryptField = async ({ encryptedData, iv, encryptionKey }: { encryptedData: Uint8Array; iv: BufferSource; encryptionKey: CryptoKey }): Promise<string> => {
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

export const getConversation = async ({id, jwkEncryptionKey}: {id: string, jwkEncryptionKey: JsonWebKey}): Promise<Conversation | null> => {
  const encryptedConversation = await getEncryptedConversation(id);

  if (!encryptedConversation) {
    return null;
  }

  // import the JWK key
  const encryptionKey = await crypto.subtle.importKey(
    'jwk',
    jwkEncryptionKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  // use the `iv` field and the jwkEncryptionKey to decrypt the title and text
  const [title, text] = await Promise.all([
    decryptField({ encryptedData: encryptedConversation.titleEncrypted, iv: encryptedConversation.iv as BufferSource, encryptionKey }),
    Promise.all(encryptedConversation.textEncrypted.map(encryptedData => 
      decryptField({ encryptedData, iv: encryptedConversation.iv as BufferSource, encryptionKey })
    ))
  ]);

  // return the conversation
  return {
    id: encryptedConversation.id,
    title,
    text,
    createdAt: encryptedConversation.createdAt,
    updatedAt: encryptedConversation.updatedAt
  };
}