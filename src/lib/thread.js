import { addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

import { getOpenRouter } from '$lib/open-router';
import { db } from '$lib/firestore';
import { decrypt, encrypt } from '$lib/crypto';
import { getYoutubeTranscript } from '$lib/youtube-transcript';

export async function createThread() {
  const plain = { title: null };
  const { encrypted, iv } = await encrypt({ plain });

  const collectionRef = collection(db, 'threads');
  await assertUniqueIV({collectionRef, iv});

  const ref = await addDoc(
    collectionRef,
    {
      iv,
      encrypted,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  );

  return {
    threadId: ref.id,
  }
}

export function subscribeThread({threadId, threadUpdated}) {
  const threadRef = doc(db, 'threads', threadId);

  const unsubscribe = onSnapshot(threadRef, async (doc) => {
    if (!doc.exists) {
      threadUpdated(null);
      return;
    }

    const decryptedThread = await decrypt({thread: doc});
    console.debug({decryptedThread});
		threadUpdated(decryptedThread);
  });

  return {unsubscribe};
}

export async function updateThread(thread) {
  const threadRef = doc(db, 'threads', thread.id);

  const { encrypted, iv } = await encrypt({
    plain: thread
  });

  updateDoc(threadRef, {
    encrypted,
    iv,
    updated: serverTimestamp()
  });
}

export async function deleteThread(thread) {
  const threadRef = doc(db, 'threads', thread.id);
  await deleteDoc(threadRef);
}

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

  const tools = [
    {
      type: 'function',
      function: {
        name: 'getYoutubeTranscript',
        description: 'Get the transcript of a YouTube video',
        parameters: {
          type: 'object',
          properties: {
            videoUrlOrId: {
              type: 'string',
              description: 'YouTube video URL or ID'
            }
          },
          required: ['videoUrlOrId']
        }
      }
    }
  ];

  const completion = await openRouter.chat.completions.create({
    model: selectedModelId,
		messages: [...unwrappedPreviousMessages, ...newMessages],
		stream: true,
		tools,
	});


  let assistantMessage = '';
  let lastChunk = null;
  let accumulatedToolCalls = [];

  while (true) {
    for await (const chunk of completion) {
      console.log({chunk});
      const choice = chunk.choices[0];
      const chunkContent = choice.delta.content;
      const deltaToolCalls = choice.delta.tool_calls;

      if (chunkContent) {
        assistantMessage = assistantMessage + chunkContent;
        setStreamingAssistantMessage(assistantMessage);
      }

      if (choice.finish_reason && choice.finish_reason != 'stop') {
        assistantMessage = assistantMessage + choice.finish_reason;
        setStreamingAssistantMessage(assistantMessage);
      }

      if (deltaToolCalls) {
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

      lastChunk = chunk;
      
      // Break if we're done
      if (choice.finish_reason) {
        break;
      }
    }
    
    // If we got a finish_reason, break out of the outer loop too
    if (lastChunk.choices[0].finish_reason) {
      break;
    }
  }

  console.log({assistantMessage, accumulatedToolCalls});

  // Process any tool calls if needed
  if (accumulatedToolCalls.length > 0) {
    for (const toolCall of accumulatedToolCalls) {
      if (toolCall.function.name === 'getYoutubeTranscript') {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const transcript = await getYoutubeTranscript(args.videoUrlOrId);
          
          // Add the function response to messages
          newMessages.push({
            role: 'assistant',
            content: null,
            tool_calls: [toolCall]
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

  const chatCompletion = buildChatCompletion({lastChunk, assistantMessage, modelId: selectedModelId});
  
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

const buildChatCompletion = ({lastChunk, assistantMessage, modelId}) => {
  const chatCompletion = structuredClone(lastChunk);
  chatCompletion.modelId = modelId;

  const choice = chatCompletion.choices[0];
  choice.text = choice.delta;
  delete choice.delta;
  choice.text.content = assistantMessage;

  return chatCompletion;
}

const assertUniqueIV = async ({collectionRef, iv}) => {
  const q = query(collectionRef, where('iv', '==', iv));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error('IV collision detected. Please try again.');
  }
}