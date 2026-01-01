import { insertEncryptedConversation } from "./repositories/conversation-repository";
import type { UUID } from "./repositories/helpers/types";

type Conversation = {
  id: UUID;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

const createConversation = ({title}: {title: string}): Conversation => {
  const conversation = insertEncryptedConversation({
    title,
    createdAt: 'now()',
    updatedAt: 'now()',
  });
};