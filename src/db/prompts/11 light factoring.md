user: I see something like following repeated in message-store and conversation-store. Dedup into a separate file?

```
		tokenUsageIv: message.tokenUsageIv
			? (message.tokenUsageIv instanceof Uint8Array
				? message.tokenUsageIv
				: new Uint8Array(message.tokenUsageIv as ArrayBuffer))
			: null,
```

agent: Extracted the repeated buffer conversion logic into `buffer-utils.ts` with two utility functions:
- `toUint8Array()` - for non-nullable buffer fields
- `toUint8ArrayOrNull()` - for nullable buffer fields

Updated both `message-store.ts` and `conversation-store.ts` to use these utilities, removing the repeated ternary expressions.