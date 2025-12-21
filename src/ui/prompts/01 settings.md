user: Start a page at the `/settings` route. It needs text boxes that save the strings to the browser's local storage:

* databaseUrl
* jwkEncryptionKey 

agent: I've created a settings page at `/settings` with two input fields that save to localStorage:

1. **Database URL** - A text input for the PostgreSQL connection string
2. **JWK Encryption Key** - A textarea for the encryption key (using monospace font for better readability)

The page:
- Loads existing values from localStorage on mount
- Automatically saves changes to localStorage when the user types
- Uses dark mode styling consistent with the rest of the app
- Includes proper labels and focus states for accessibility

The implementation uses Svelte 5's `$state` for reactive values and `$effect` to persist changes to localStorage. An `initialized` flag ensures we don't clear localStorage during the initial load.

user: Have the SPA call setupDb and setupEncryptionKey when the page loads using the local storage data

agent: I've updated the root layout (`+layout.svelte`) to automatically initialize the database and encryption key when the SPA loads. The initialization:

1. **Reads from localStorage** - Retrieves `databaseUrl` and `jwkEncryptionKey` on mount
2. **Sets up the database** - Calls `setupDb()` with the database URL if it exists
3. **Sets up encryption key** - Parses the JWK JSON string and calls `setupEncryptionKey()` if it exists
4. **Error handling** - Wraps both operations in try-catch blocks to log errors without breaking the app

The initialization happens in an async `onMount` callback, ensuring the encryption key setup (which is async) completes properly. This means the database and encryption key will be ready to use throughout the app as soon as the page loads, assuming the values are stored in localStorage.

user: Please fix +layout.svelte import errors

agent: Fixed the import errors by changing from alias imports (`$db/db` and `$data/encryption-key`) to relative imports (`../../db/db` and `../../data/encryption-key`). The path aliases weren't configured in the project, so relative imports are used instead, consistent with how other files in the codebase import from these directories.