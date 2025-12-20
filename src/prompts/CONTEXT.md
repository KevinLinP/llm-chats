# Context

* This is a browser-only conversation app between a user and the LLM for a software engineer's personal use.
  * The user will supply a PostgreSQL connection string to be stored in the browser only. Yes, I am aware that a browser app connecting directly to a database is unorthodox, but it is fine for our use case.
* This is a single page app.
* Please keep the code simple and minimal.
* It needs to maintain a history of conversations in the database.
* Conversations need to be E2E encrypted. The user will supply a decryption key to be persisted only in the browser.
* Tech Stack
  * TypeScript
  * Bun.js
  * Svelte 5
  * Web Crypto API
* The app's UI is always in 'dark mode'