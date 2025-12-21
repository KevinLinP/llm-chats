user: In previous-version/, responses from the Perplexity Sonar models would display reference links, and clickable reference indicators also. Read how that works and bring back that functionality. Update the db/ and data/ layers if needed.

agent: Implemented Perplexity citations support based on the previous version. Changes include:

1. **Database Schema** (`src/db/schema.ts`): Added `citationsEncrypted` and `citationsIv` optional fields to the messages table.

2. **Database Layer** (`src/db/message-store.ts`): Updated `EncryptedMessage` type and both `listMessages` and `insertMessage` functions to handle citations fields.

3. **Data Layer** (`src/data/message.ts`): 
   - Added `citations?: Record<string, string>` to the `Message` type
   - Updated `listMessages` to decrypt citations if present
   - Updated `insertMessage` to encrypt citations if provided

4. **Citations Extraction** (`src/data/send-message.ts`): Extract citations from the first chunk's `citations` property (array of URLs) and convert to a map `{ "1": url1, "2": url2, ... }` for storage.

5. **UI - MarkdownRenderer** (`src/ui/lib/components/MarkdownRenderer.svelte`): Process citations to replace citation markers `[1]`, `[2]`, etc. with clickable HTML links using the same styling as the previous version (`text-sm px-0.5 mx-0.5 rounded-md bg-gray-600` with color `#F0F0F0`).

6. **UI - MessageCard** (`src/ui/lib/components/MessageCard.svelte`): Display citations list at the bottom of assistant messages as a numbered list with clickable URLs, matching the previous version's display style.

Note: A database migration needs to be generated and run for the schema changes:
```bash
npm run db:generate
npm run db:migrate
```