# Development Guide for LLM-Chats

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint and Prettier checks
- `npm run format` - Fix formatting with Prettier
- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests with Vitest
- `npm test:integration` - Run integration tests with Playwright
- `npx vitest src/path/to/file.test.js` - Run a single test file

## Code Style
- Use tabs for indentation
- Use single quotes for strings
- No trailing commas
- 100 character line width
- ES modules (`import/export`)
- Group imports: external libraries first, then internal (`$lib/`)
- Async/await for asynchronous operations
- Prefer destructuring for clean parameter passing
- Use semantic naming and camelCase
- Proper error handling with try/catch blocks where appropriate

## Technologies
- SvelteKit with Tailwind CSS
- Firebase/Firestore for database
- ESLint/Prettier for linting and formatting
- Vitest for unit testing
- Playwright for integration testing