import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Cache for single postgres client and drizzle instance
let cachedClient: postgres.Sql | null = null;
let cachedDb: ReturnType<typeof drizzle> | null = null;
let cachedDatabaseUrl: string | null = null;

export const setupDb = (databaseUrl: string) => {
	// If already set up with a different URL, throw an exception
	if (cachedDatabaseUrl !== null && cachedDatabaseUrl !== databaseUrl) {
		throw new Error(
			`Database already set up with URL: ${cachedDatabaseUrl}. Cannot set up with different URL: ${databaseUrl}`
		);
	}

	// Return cached db instance if it exists
	if (cachedDb !== null) {
		return cachedDb;
	}

	// Create new postgres client and drizzle instance
	cachedClient = postgres(databaseUrl);
	cachedDb = drizzle(cachedClient, { schema });
	cachedDatabaseUrl = databaseUrl;

	return cachedDb;
};

export const getDb = () => {
	if (cachedDb === null) {
		throw new Error('Database not set up. Call setupDb() first.');
	}
	return cachedDb;
};

