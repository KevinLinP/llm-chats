import _ from 'lodash';

import { getOpenRouter, modelsById } from '$lib/open-router';
import { getYoutubeTranscript } from '$lib/youtube-transcript';
import { updateThread } from '$lib/thread';
import { apiMessages } from '$lib/messages';

const tools = [
  {
    type: 'function',
    function: {
      name: 'get_youtube_transcript',
      description: 'Get the transcript of a YouTube video',
      parameters: {
        type: 'object',
        properties: {
          video_url: {
            type: 'string',
            description: 'YouTube video URL'
          }
        },
        required: ['video_url']
      }
    }
  }
];

export async function sendMessage({
  thread,
  userMessage,
  systemMessage,
  selectedModelId,
  setTempMessages,
  setStreamingAssistantMessage,
}) {
  const openRouter = await getOpenRouter();
  if (!openRouter) return;

  const previousMessages = thread.messages || [];

  const newMessages = [];
  if (!previousMessages.length) {
    newMessages.push({ role: 'system', content: systemMessage });
  };
  newMessages.push({ role: 'user', content: userMessage });
  setTempMessages(newMessages);

  while (true) {
    const completionParams = {
      model: selectedModelId,
      messages: apiMessages([...previousMessages, ...newMessages]),
      stream: true,
    };
    if (modelsById[selectedModelId].functionCalling !== false) {
      completionParams.tools = tools;
    }
    const completion = await openRouter.chat.completions.create(completionParams);

    const chunks = [];
    let streamingMessage = '';

    for await (const chunk of completion) {
      chunks.push(chunk);
      const choice = chunk.choices[0];
      const chunkContent = choice.delta.content;
      if (!chunkContent) continue;

      streamingMessage = streamingMessage + chunkContent;
      setStreamingAssistantMessage(streamingMessage);
    }

    newMessages.push({chunks});
    setTempMessages(newMessages);

    const toolCalls = extractToolCalls({chunks});
    if (toolCalls.length === 0) break;

    const toolCall = toolCalls[0];
    if (toolCall.function.name !== 'get_youtube_transcript') {
      throw new Error(`Unknown tool call: ${toolCall.function.name}`);
    }

    const toolMessage = {
      role: 'tool',
      tool_call_id: toolCall.id,
      content: 'Getting transcript...'
    }
    newMessages.push(toolMessage);
    setTempMessages(newMessages);
    setStreamingAssistantMessage('');

    const args = JSON.parse(toolCall.function.arguments);
    toolMessage.content = await getYoutubeTranscript(args.video_url);

    setTempMessages(newMessages);
  }

  setStreamingAssistantMessage(null);
  setTempMessages([]);

  await updateThread({
    ...thread,
    messages: [...previousMessages, ...newMessages],
    selectedModelId
  });
};

export const extractToolCalls = ({chunks}) => {
  const [firstChunk, ...remainingChunks] = chunks;
  const toolCalls = _.cloneDeep(firstChunk.choices[0].delta.tool_calls);
  if (!toolCalls) return [];

  remainingChunks.forEach(chunk => {
    const chunkToolCalls = chunk.choices[0].delta.tool_calls;
    if (!chunkToolCalls) return;

    chunkToolCalls.forEach((toolCall, i) => {
      toolCalls[i].function.arguments = toolCalls[i].function.arguments + toolCall.function.arguments
    });
  });

  return toolCalls;
}