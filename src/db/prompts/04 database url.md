user: Please update the public methods in conversation.ts to always take a databaseUrl parameter.

agent: I've updated both public methods in `conversation.ts` to accept a `databaseUrl` parameter:

1. **`getConversation`** now takes `databaseUrl` as the first parameter: `getConversation(databaseUrl: string, id: string)`
2. **`createConversation`** now takes `databaseUrl` as the first parameter: `createConversation(databaseUrl: string, {...})`

Both methods now create their own database connections internally using the provided `databaseUrl` and properly close the connections using a try/finally block to prevent connection leaks. The methods no longer depend on the global `db` instance from `index.ts`.