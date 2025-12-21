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