user: Add an index to conversations.createdAt and another to .updatedAt

agent: I've added indexes to both `createdAt` and `updatedAt` columns in the conversations table. The schema now includes:

- `conversations_createdAt_idx` index on the `createdAt` column
- `conversations_updatedAt_idx` index on the `updatedAt` column

The indexes are defined in the schema using Drizzle's `index` function. To generate the migration file, you'll need to run `bun run db:generate` with your `DATABASE_URL` environment variable set. The migration will create these indexes in your PostgreSQL database.