import { modelNamesById } from '$lib/open-router';

export const apiMessages = (messages) => {
  return messages.map(message => {
    if (message.chunks) {
      return {
        role: message.chunks[0].choices[0].delta.role,
        content: message.chunks.reduce((acc, chunk) => {
          return acc + chunk.choices[0].delta.content;
        }, '')
      }
    } else if (message.choices) {
      // unwrap raw completion
      return message.choices[0].text;
    } else {
      return message;
    }
  });
};

export const displayMessages = (messages) => {
  return messages.map(message => {
    if (message.chunks) {
      const lastChunk = message.chunks.at(-1);

      return {
        author: modelNamesById[lastChunk.model],
        content: message.chunks.reduce((acc, chunk) => {
          return acc + chunk.choices[0].delta.content;
        }, ''),
        usage: lastChunk.usage
      }
    } else if (message.choices) {
      return {
        author: modelNamesById[message.modelId],
        content: message.choices[0].text.content,
        usage: message.usage,
      }
    } else {
      return {
        author: message.role,
        content: message.content,
      }
    }
  });
};