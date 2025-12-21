import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Cache for single drizzle instance
let cachedDb: any = null;
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

	// Create new drizzle instance (using neon-http for production)
	cachedDb = drizzle(databaseUrl, { schema });
	cachedDatabaseUrl = databaseUrl;

	return cachedDb;
};

export const getDb = () => {
	if (cachedDb === null) {
		throw new Error('Database not set up. Call setupDb() first.');
	}
	return cachedDb;
};

export const setDb = (db: any) => {
	cachedDb = db;
	cachedDatabaseUrl = 'test'; // Mark as test database
};

