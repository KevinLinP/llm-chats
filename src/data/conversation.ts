import { getConversation as getEncryptedConversation, type EncryptedConversation } from '../db/conversation-store';
import { getEncryptionKey } from './encryption-key';

export type Message = {
	sender: string;
	text: string;
	// Optional metadata following schema.org/Message patterns
	modelId?: string; // LLM model identifier (e.g., "gpt-4", "claude-3-opus")
	tokenUsage?: {
		input?: number; // Input tokens
		reasoning?: number; // Reasoning tokens (if applicable, e.g., o1 models)
		output?: number; // Output/generated tokens
	};
};

export type Conversation = {
	id: string;
	title: string;
  parts: Message[];
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

  // use the `titleIv` field and the encryption key to decrypt the title
  // use the `messagesIv` array and the encryption key to decrypt each message
  const [title, partsStrings] = await Promise.all([
    decryptField({ encryptedData: encryptedConversation.titleEncrypted, iv: encryptedConversation.titleIv as BufferSource, encryptionKey }),
    Promise.all(encryptedConversation.messagesEncrypted.map((encryptedData, index) => 
      decryptField({ encryptedData, iv: encryptedConversation.messagesIv[index] as BufferSource, encryptionKey })
    ))
  ]);

  // Parse each decrypted string as JSON to get Message objects
  const parts: Message[] = partsStrings.map(partString => JSON.parse(partString));

  // return the conversation
  return {
    id: encryptedConversation.id,
    title,
    parts,
    createdAt: encryptedConversation.createdAt,
    updatedAt: encryptedConversation.updatedAt
  };
}