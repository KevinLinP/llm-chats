import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Union type for supported drizzle database drivers
type NeonDatabase = ReturnType<typeof drizzleNeon>;
type PostgresDatabase = ReturnType<typeof drizzlePostgres>;
type Database = NeonDatabase | PostgresDatabase;

// Cache for single drizzle instance
let cachedDb: Database | null = null;
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
	cachedDb = drizzleNeon(databaseUrl, { schema });
	cachedDatabaseUrl = databaseUrl;

	return cachedDb;
};

export const getDb = () => {
	if (cachedDb === null) {
		throw new Error('Database not set up. Call setupDb() first.');
	}
	return cachedDb;
};

export const setDb = (db: Database) => {
	cachedDb = db;
	cachedDatabaseUrl = 'test'; // Mark as test database
};

