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
          video_url_or_id: {
            type: 'string',
            description: 'YouTube video URL or ID'
          }
        },
        required: ['video_url_or_id']
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

  const tempMessages = [];
  if (!previousMessages.length) {
    tempMessages.push({ role: 'system', content: systemMessage });
  };
  tempMessages.push({ role: 'user', content: userMessage });

  const completionParams = {
    model: selectedModelId,
    messages: [...apiMessages(previousMessages), ...tempMessages],
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

  await updateThread({
    ...thread,
    messages: [...previousMessages, ...tempMessages, {chunks}],
    selectedModelId
  });
  setStreamingAssistantMessage(null);
  setTempMessages([]);
};

async function sendMessageDeprecated({
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
  const unwrappedPreviousMessages = previousMessages.map(message => {
    if (message.choices) {
      // unwrap raw completion
      return message.choices[0].text;
    } else {
      return message;
    }
  });

  const newMessages = previousMessages.length
  ? [{ role: 'user', content: userMessage }]
  : [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ];
  setTempMessages(newMessages);

  const completionParams = {
    model: selectedModelId,
		messages: [...unwrappedPreviousMessages, ...newMessages],
		stream: true,
	};

  if (modelsById[selectedModelId].functionCalling !== false) {
    completionParams.tools = [
      {
        type: 'function',
        function: {
          name: 'get_youtube_transcript',
          description: 'Get the transcript of a YouTube video',
          parameters: {
            type: 'object',
            properties: {
              video_url_or_id: {
                type: 'string',
                description: 'YouTube video URL or ID'
              }
            },
            required: ['video_url_or_id']
          }
        }
      }
    ];
  }

  const completion = await openRouter.chat.completions.create(completionParams);

  let assistantMessage = '';
  let chunks = []
  let lastChunk = null;
  let accumulatedToolCalls = [];

  for await (const chunk of completion) {
    chunks.push(chunk);
    lastChunk = chunk;
    const choice = chunk.choices[0];
    const chunkContent = choice.delta.content;

    if (chunkContent) {
      assistantMessage = assistantMessage + chunkContent;
      setStreamingAssistantMessage(assistantMessage);
    }

    if (choice.finish_reason && choice.finish_reason != 'stop') {
      assistantMessage = assistantMessage + choice.finish_reason;
      setStreamingAssistantMessage(assistantMessage);
    }

    const deltaToolCalls = choice.delta.tool_calls;
    if (!deltaToolCalls) continue;

    for (const toolCall of deltaToolCalls) {
      // Initialize new tool calls in the array
      if (toolCall.index !== undefined) {
        if (!accumulatedToolCalls[toolCall.index]) {
          accumulatedToolCalls[toolCall.index] = {
            id: toolCall.id || '',
            type: 'function',
            function: {
              name: '',
              arguments: ''
            }
          };
        }
        
        // Update the tool call with new data
        if (toolCall.id) {
          accumulatedToolCalls[toolCall.index].id = toolCall.id;
        }
        
        if (toolCall.function) {
          if (toolCall.function.name) {
            accumulatedToolCalls[toolCall.index].function.name = toolCall.function.name;
          }
          
          if (toolCall.function.arguments) {
            accumulatedToolCalls[toolCall.index].function.arguments += toolCall.function.arguments;
          }
        }
      }
      
      // If we have tool calls, update the streaming message to show them
      if (accumulatedToolCalls.length > 0) {
        const toolCallsText = accumulatedToolCalls
          .filter(t => t && t.function.name)
          .map(t => `[Tool Call: ${t.function.name}(${t.function.arguments || ''})]`)
          .join('\n');
        
        setStreamingAssistantMessage(assistantMessage + '\n\n' + toolCallsText);
      }
    }
  }

  console.log({assistantMessage, accumulatedToolCalls});

  // Process any tool calls if needed
  if (accumulatedToolCalls.length > 0) {
    for (const toolCall of accumulatedToolCalls) {
      if (toolCall.function.name === 'get_youtube_transcript') {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const transcript = await getYoutubeTranscript(args.video_url_or_id);
          
          // Add the function response to messages
          newMessages.push({
            role: 'assistant',
            content: null,
            tool_calls: [toolCall],
          });
          
          newMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(transcript)
          });
          
          // Continue the conversation with the tool response
          const followUpCompletion = await openRouter.chat.completions.create({
            model: selectedModelId,
            messages: [...unwrappedPreviousMessages, ...newMessages],
            stream: true
          });
          
          // Reset and continue streaming
          assistantMessage = '';
          for await (const chunk of followUpCompletion) {
            const choice = chunk.choices[0];
            const chunkContent = choice.delta.content;
            
            if (chunkContent) {
              assistantMessage = assistantMessage + chunkContent;
              setStreamingAssistantMessage(assistantMessage);
            }
            
            lastChunk = chunk;
          }
        } catch (error) {
          console.error("Error processing tool call:", error);
          assistantMessage += `\n\nError: Failed to process tool call: ${error.message}`;
          setStreamingAssistantMessage(assistantMessage);
        }
      }
    }
  }

  console.debug({assistantMessage, lastChunk});
  const chatCompletion = buildChatCompletion({chunks, assistantMessage, modelId: selectedModelId});
  
  // Include tool calls in the final completion if any
  if (accumulatedToolCalls.length > 0) {
    chatCompletion.choices[0].text.tool_calls = accumulatedToolCalls;
  }

  await updateThread({
    ...thread,
    messages: [...previousMessages, ...newMessages, chatCompletion],
    selectedModelId
  });

  setStreamingAssistantMessage(null);
  setTempMessages([]);
}