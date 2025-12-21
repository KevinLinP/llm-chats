import { fetchEncryptedConversation, insertEncryptedConversation, listEncryptedConversations, type EncryptedConversation } from '../db/conversation-store';
import { getEncryptionKey } from './encryption-key';

export type Message = {
	sender: 'system' | 'user' | 'agent';
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

export type ConversationSummary = {
	id: string;
	title: string;
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

// helper function to encrypt a field
const encryptField = async ({ plaintext, encryptionKey }: { plaintext: string; encryptionKey: CryptoKey }): Promise<{ encryptedData: Uint8Array; iv: Uint8Array }> => {
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

export const getConversation = async ({id}: {id: string}): Promise<Conversation | null> => {
  const encryptedConversation = await fetchEncryptedConversation(id);

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

export const createConversation = async ({
  title,
  systemMessage,
  userMessage,
  timezone
}: {
  title: string;
  systemMessage: Message;
  userMessage: Message;
  timezone: string;
}): Promise<{id: string}> => {
  // get the cached encryption key
  const encryptionKey = getEncryptionKey();

  // encrypt the title and messages
  const [titleEncrypted, systemMessageEncrypted, userMessageEncrypted] = await Promise.all([
    encryptField({ plaintext: title, encryptionKey }),
    encryptField({ plaintext: JSON.stringify(systemMessage), encryptionKey }),
    encryptField({ plaintext: JSON.stringify(userMessage), encryptionKey })
  ]);

  // create the encrypted conversation in the database
  const { id } = await insertEncryptedConversation({
    conversation: {
      titleIv: titleEncrypted.iv,
      titleEncrypted: titleEncrypted.encryptedData,
      messagesEncrypted: [systemMessageEncrypted.encryptedData, userMessageEncrypted.encryptedData],
      messagesIv: [systemMessageEncrypted.iv, userMessageEncrypted.iv]
    },
    timezone
  });

  return { id };
}

export const listConversations = async (): Promise<ConversationSummary[]> => {
  const encryptedConversations = await listEncryptedConversations();

  // get the cached encryption key
  const encryptionKey = getEncryptionKey();

  // decrypt all titles in parallel
  const titles = await Promise.all(
    encryptedConversations.map(encryptedConversation =>
      decryptField({
        encryptedData: encryptedConversation.titleEncrypted,
        iv: encryptedConversation.titleIv as BufferSource,
        encryptionKey
      })
    )
  );

  // combine decrypted titles with conversation metadata
  return encryptedConversations.map((encryptedConversation, index) => ({
    id: encryptedConversation.id,
    title: titles[index],
    createdAt: encryptedConversation.createdAt,
    updatedAt: encryptedConversation.updatedAt
  }));
}