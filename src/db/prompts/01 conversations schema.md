user: Please write a Drizzle migration with a `conversations` table, and the following columns:

* `iv`
  * data type: binary
  * iv stands for initialization vector, for decryption
* createdAt
  * data type: time with time zone
* updatedAt
  * data type: time with time zone
* titleEncrypted
  * data type: binary
* textEncrypted
  * data type: binary

Also, I'd like the primary key to be a db-server-generated UUID.

agent: I've updated the schema file (`src/db/schema.ts`) to include the `conversations` table with all the requested columns:

- `id`: UUID primary key with `defaultRandom()` for database-generated UUIDs
- `iv`: `bytea` type for binary data (initialization vector)
- `createdAt`: `timestamp` with timezone, not null
- `updatedAt`: `timestamp` with timezone, not null
- `titleEncrypted`: `bytea` type for binary encrypted data
- `textEncrypted`: `bytea` type for binary encrypted data

To generate the migration, you'll need to set the `DATABASE_URL` environment variable and then run:
```bash
npm run db:generate
```

This will create the migration SQL file in the migrations directory (typically `drizzle/` folder).

user: Please make all the fields I listed non-null too.

agent: I've updated the schema to make all the listed fields non-null. Now `iv`, `titleEncrypted`, and `textEncrypted` all have `.notNull()` constraints, along with `createdAt` and `updatedAt` which were already non-null.

user: I'd like to run this migration. I have a DATABASE_URL in .env.

agent: I've set up the migration using `bun`:

1. Installed `dotenv` package to load environment variables from `.env`
2. Updated `drizzle.config.ts` to load the `.env` file using dotenv
3. Fixed the schema to use `customType` for `bytea` columns (since `bytea` is not a direct export from drizzle-orm/pg-core)
4. Generated the migration successfully - it created `drizzle/0000_wandering_liz_osborn.sql`

The migration file includes:
- `conversations` table with UUID primary key (using `gen_random_uuid()`)
- All columns as `bytea` type for binary data (`iv`, `titleEncrypted`, `textEncrypted`)
- Timestamp columns with timezone (`createdAt`, `updatedAt`)
- All columns are NOT NULL as requested

The migration was generated successfully. You can run it with:
```bash
bun run db:migrate
```

The migration command was started but appears to have been interrupted. The SQL file is ready and can be run when you're ready. 