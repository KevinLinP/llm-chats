import { getConversation as getEncryptedConversation, type EncryptedConversation } from '../db/conversation-store';
import { getEncryptionKey } from './encryptionKey';

type Conversation = {
	id: string;
	title: string;
  parts: string[];
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

export const getConversation = async ({id}: {id: string}): Promise<Conversation | null> => {
  const encryptedConversation = await getEncryptedConversation(id);

  if (!encryptedConversation) {
    return null;
  }

  // get the cached encryption key
  const encryptionKey = getEncryptionKey();

  // use the `iv` field and the encryption key to decrypt the title and parts
  const [title, parts] = await Promise.all([
    decryptField({ encryptedData: encryptedConversation.titleEncrypted, iv: encryptedConversation.iv as BufferSource, encryptionKey }),
    Promise.all(encryptedConversation.partsEncrypted.map(encryptedData => 
      decryptField({ encryptedData, iv: encryptedConversation.iv as BufferSource, encryptionKey })
    ))
  ]);

  // return the conversation
  return {
    id: encryptedConversation.id,
    title,
    parts,
    createdAt: encryptedConversation.createdAt,
    updatedAt: encryptedConversation.updatedAt
  };
}