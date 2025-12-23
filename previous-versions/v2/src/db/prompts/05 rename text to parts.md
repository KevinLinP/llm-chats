user: Rename conversations.text to .parts. Give me the commands needed to generate and run the migration.

agent: I've updated the schema to rename `textEncrypted` to `partsEncrypted`. Here are the commands to generate and run the migration:

**Generate the migration:**
```bash
npm run db:generate
```
or
```bash
drizzle-kit generate
```

**Run the migration:**
```bash
npm run db:migrate
```
or
```bash
drizzle-kit migrate
```

The migration will rename the `textEncrypted` column to `partsEncrypted` in the `conversations` table.

**Note:** After running the migration, you'll also need to update the code that references `textEncrypted`:
- `src/db/conversation.ts` - update `textEncrypted` references to `partsEncrypted`
- `src/data/conversation.ts` - update the field name from `text` to `parts` in the `Conversation` type and related code

agent: Updated both conversation.ts files:
- `src/db/conversation.ts`: Changed all `textEncrypted` references to `partsEncrypted` in the type definition, variable names, and database operations
- `src/data/conversation.ts`: Changed the `text` field to `parts` in the `Conversation` type and updated all related variable names and references