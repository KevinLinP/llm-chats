import type { MessageWithMetadata } from './message';

export const toOpenAIMessages = ({
	messages
}: {
	messages: MessageWithMetadata[];
}): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> => {
	return messages.map((message) => {
		let role: 'system' | 'user' | 'assistant';
		if (message.sender === 'system') {
			role = 'system';
		} else if (message.sender === 'user') {
			role = 'user';
		} else {
			role = 'assistant';
		}
		return {
			role,
			content: message.text
		};
	});
};

