import { fetchEncryptedConversation, insertEncryptedConversation, listEncryptedConversations, type EncryptedConversation } from '../db/conversation-store';
import { getEncryptionKey } from './encryption-key';
import { decryptField, encryptField } from './crypto';

export type Conversation = {
	id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
};

export type ConversationSummary = {
	id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
};

export const getConversation = async ({id}: {id: string}): Promise<Conversation | null> => {
  const encryptedConversation = await fetchEncryptedConversation(id);

  if (!encryptedConversation) {
    return null;
  }

  // get the cached encryption key
  const encryptionKey = getEncryptionKey();

  // decrypt the title
  const title = await decryptField({ 
    encryptedData: encryptedConversation.titleEncrypted, 
    iv: encryptedConversation.titleIv as BufferSource, 
    encryptionKey 
  });

  // return the conversation
  return {
    id: encryptedConversation.id,
    title,
    createdAt: encryptedConversation.createdAt,
    updatedAt: encryptedConversation.updatedAt
  };
}

export const createConversation = async ({
  title,
  timezone
}: {
  title: string;
  timezone: string;
}): Promise<{id: string}> => {
  // get the cached encryption key
  const encryptionKey = getEncryptionKey();

  // encrypt the title
  const titleEncrypted = await encryptField({ plaintext: title, encryptionKey });

  // create the encrypted conversation in the database
  const { id } = await insertEncryptedConversation({
    conversation: {
      titleIv: titleEncrypted.iv,
      titleEncrypted: titleEncrypted.encryptedData
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