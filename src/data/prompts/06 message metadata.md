user: For the Message type, I'm trying to follow https://schema.org/Message. I'd like to store metadata of the name of the LLM model, and counts of the different token types used (read/thinking/output). What do you suggest?

agent: I've added optional metadata fields to the `Message` type that align with schema.org/Message patterns while being practical for your LLM use case:

1. **`modelId?: string`** - Optional property to store the LLM model identifier (e.g., "gpt-4", "claude-3-opus", "o1-preview")

2. **`tokenUsage?: { input?: number; reasoning?: number; output?: number }`** - Optional object to store token counts:
   - `input` - Input tokens (what the model consumed from the conversation)
   - `reasoning` - Reasoning tokens (for models that support this, like o1)
   - `output` - Output/generated tokens (what the model produced)

Both fields are optional, so existing messages without this metadata will continue to work. The structure follows schema.org's pattern of allowing additional properties while keeping the core `sender` and `text` fields required.

The metadata will be automatically included when messages are serialized to JSON (which happens before encryption) and deserialized when decrypted, so no changes are needed to the encryption/decryption logic.

user: Change tokenUsage.read into .input.

agent: Updated `tokenUsage.read` to `tokenUsage.input` in both the type definition and documentation.

user: Shoudl I call them reasoning tokens or thinking tokens?

agent: I recommend using "reasoning tokens" as it's more standard in official API documentation (e.g., OpenAI's o1 models use "reasoning_tokens"). It's also more formal and aligns better with API field names.

user: Yes.

agent: Updated `tokenUsage.thinking` to `tokenUsage.reasoning` in both the type definition and documentation.

user: Rename Message.model to modelId.

agent: Updated `Message.model` to `Message.modelId` in both the type definition and documentation.