import { modelNamesById } from '$lib/open-router';
import _ from 'lodash';
import { extractToolCalls } from '$lib/send-message';

export const apiMessages = (messages) => {
  return messages.map(message => {
    if (message.chunks) {
      const [firstChunk, ...remainingChunks] = message.chunks;
      const apiMessage = _.cloneDeep(firstChunk.choices[0].delta);

      // TODO: dedup
      remainingChunks.forEach(chunk => {
        const delta = chunk.choices[0].delta;

        if (delta.content) apiMessage.content += delta.content;
        if (delta.thinking) apiMessage.thinking += delta.thinking;

        if (!delta.tool_calls) return;

        apiMessage.tool_calls.forEach((toolCall, i) => {
          toolCall.function.arguments += delta.tool_calls[i].function.arguments;
        });
      });

      return apiMessage;
    } else if (message.choices) {
      return message.choices[0].text;
    } else {
      return message;
    }
  });
};

export const displayMessages = (messages) => {
  const toolCallsById = {};

  return messages.map(message => {
    if (message.chunks) {
      const [firstChunk, ...remainingChunks] = message.chunks;
      const lastChunk = remainingChunks.at(-1);

      const mergedMessage = _.cloneDeep(firstChunk.choices[0].delta);
      mergedMessage.content = mergedMessage.content || "";
      mergedMessage.reasoning = mergedMessage.reasoning || "";

      // TODO: dedup
      remainingChunks.forEach(chunk => {
        const delta = chunk.choices[0].delta;
        if (delta.content) mergedMessage.content += delta.content;
        if (delta.reasoning) mergedMessage.reasoning += delta.reasoning;
      });

      const citations = firstChunk.citations ? 
        firstChunk.citations.reduce((acc, url, index) => {
          acc[(index + 1).toString()] = url;
          return acc;
        }, {}) : null;

      if (citations) {
        mergedMessage.content = mergedMessage.content.replace(/(\[\d+\])/g, (match) => {
          const number = match.slice(1, -1);
          return `<a href="${citations[number]}" target="_blank" class="text-sm px-0.5 mx-0.5 rounded-md bg-gray-600" style="color: #F0F0F0; text-decoration: none;">${number}</a>`;
        });
      }

      const toolCalls = extractToolCalls({ chunks: message.chunks });
      let displayToolCalls = null;
      if (toolCalls.length > 0) {
        toolCallsById[toolCalls[0].id] = toolCalls[0];
        displayToolCalls = _.cloneDeep(toolCalls[0].function);
        displayToolCalls.arguments = JSON.parse(displayToolCalls.arguments);
      }

      return {
        author: modelNamesById[firstChunk.model] || firstChunk.model,
        // TODO: use message annotations
        citations,
        content: mergedMessage.content,
        reasoning: mergedMessage.reasoning,
        toolCalls: displayToolCalls,
        usage: lastChunk.usage
      }
    } else if (message.role === 'tool') {
      return {
        author: toolCallsById[message.tool_call_id] ? toolCallsById[message.tool_call_id].function.name : "tool",
        content: message.content,
        type: "tool"
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