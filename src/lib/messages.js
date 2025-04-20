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
      const firstChunk = message.chunks[0];
      const lastChunk = message.chunks.at(-1);
      let content = message.chunks.reduce((acc, chunk) => {
        return acc + chunk.choices[0].delta.content;
      }, '')

      const citations = firstChunk.citations ? 
        firstChunk.citations.reduce((acc, url, index) => {
          acc[(index + 1).toString()] = url;
          return acc;
        }, {}) : null;

      if (citations) {
        content = content.replace(/(\[\d+\])/g, (match) => {
          const number = match.slice(1, -1);
          return `<a href="${citations[number]}" target="_blank" class="text-sm px-0.5 mx-0.5 rounded-md bg-gray-600" style="color: #F0F0F0; text-decoration: none;">${number}</a>`;
        });
      }

      return {
        author: modelNamesById[lastChunk.model],
        citations,
        content,
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