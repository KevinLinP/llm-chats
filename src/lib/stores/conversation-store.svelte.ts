interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
}

let conversations = $state<Conversation[]>([]);

export const getConversations = () => {
  return conversations;
}

export const setConversations = (newConversations: Conversation[]) => {
  conversations = newConversations;
}