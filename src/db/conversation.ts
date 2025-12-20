import { db } from './index';
import { conversations } from './schema';
import { eq } from 'drizzle-orm';

export type EncryptedConversation = {
	id: string;
	iv: Uint8Array;
	titleEncrypted: Uint8Array;
	textEncrypted: Uint8Array[];
	createdAt: Date;
	updatedAt: Date;
};

export const getConversation = async (id: string): Promise<EncryptedConversation | null> => {
  // fetch the conversation from the database
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);

  if (!conversation) {
    return null;
  }

  // Convert Buffer to Uint8Array (postgres-js returns bytea as Buffer)
  const ivBuffer = conversation.iv as unknown as ArrayBuffer;
  const titleBuffer = conversation.titleEncrypted as unknown as ArrayBuffer;
  const textEncryptedArray = conversation.textEncrypted as unknown as ArrayBuffer[];
  
  return {
    id: conversation.id,
    iv: new Uint8Array(ivBuffer),
    titleEncrypted: new Uint8Array(titleBuffer),
    textEncrypted: textEncryptedArray.map(buffer => new Uint8Array(buffer)),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  };
}

