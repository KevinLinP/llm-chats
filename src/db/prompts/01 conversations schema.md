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