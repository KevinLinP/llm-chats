import { decrypt, encrypt } from "./helpers/cryptography";
import { getAllEncryptedConversations, getEncryptedConversation, insertEncryptedConversation, type EncryptedConversation } from "./repositories/conversation-repository";
import type { UUID } from "./repositories/helpers/types";

type Conversation = {
  id: UUID;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

const decryptConversation = async (conversation: EncryptedConversation): Promise<Conversation> => {
  return {
    id: conversation.id,
    title: await decrypt(conversation.title),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
};

export const createConversation = async ({title}: {title: string}): Promise<Conversation> => {
  const conversation = await insertEncryptedConversation({
    title: await encrypt(title),
    createdAt: 'now()',
    updatedAt: 'now()',
  });

  return decryptConversation(conversation);
};

export const getConversation = async ({id}: {id: UUID}): Promise<Conversation | null> => {
  const conversation = await getEncryptedConversation(id);
  if (!conversation) return null;

  return decryptConversation(conversation);
};

export const listConversations = async (): Promise<Conversation[]> => {
  const conversations = await getAllEncryptedConversations({
    limit: 50,
    orderByColumn: 'createdAt',
    orderByDirection: 'desc',
  });

  return Promise.all(conversations.map(decryptConversation));
};