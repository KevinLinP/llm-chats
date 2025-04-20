import { modelNamesById } from '$lib/open-router';
import _ from 'lodash';

export const apiMessages = (messages) => {
  return messages.map(message => {
    if (message.chunks) {
      const [firstChunk, ...remainingChunks] = message.chunks;
      const apiMessage = _.cloneDeep(firstChunk.choices[0].delta);

      remainingChunks.forEach(chunk => {
        const delta = chunk.choices[0].delta;
        console.log({delta});

        if (delta.content) apiMessage.content += delta.content;

        if (!delta.tool_calls) return;

        apiMessage.tool_calls.forEach((toolCall, i) => {
          toolCall.function.arguments += delta.tool_calls[i].function.arguments;
        });
      });

      console.log({apiMessage});

      return apiMessage;
    } else if (message.choices) {
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
        const content = chunk.choices[0].delta.content;

        if (content) {
          return acc + content;
        } else {
          return acc;
        }
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