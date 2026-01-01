import type { ConversationTable } from './conversation-repository'
import { Kysely, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler, CamelCasePlugin } from 'kysely'
import { FetchDriver } from './fetch-driver-modified';
import superjson from 'superjson';

interface Database {
  conversations: ConversationTable
}

let db: Kysely<Database> | null = null;

superjson.registerCustom<Uint8Array, string>(
  {
    isApplicable: (v): v is Uint8Array => v instanceof Uint8Array,
    deserialize: (string: string): Uint8Array => Uint8Array.from(atob(string), c => c.charCodeAt(0)),
    serialize: (array: Uint8Array): string => {
      // Build binary string in chunks to avoid call stack issues with large arrays
      let binaryString = '';
      for (let i = 0; i < array.length; i++) {
        binaryString += String.fromCharCode(array[i]!);
      }
      return btoa(binaryString);
    },
  },
  'binary'
);

const transformer = {
  serialize: (value: any): string => {
    return superjson.stringify(value);
  },
  deserialize: (str: string): any => {
    return superjson.parse(str);
  },
};

export const setupDatabase = ({url, authorizationBearerToken}: {url: string, authorizationBearerToken: string}) => {
  db = new Kysely<Database>({
    dialect: {
      createAdapter: () => new PostgresAdapter(),
      createIntrospector: (db) => new PostgresIntrospector(db),
      createQueryCompiler: () => new PostgresQueryCompiler(),
      createDriver: () => {
        return new FetchDriver({
          transformer,
          url,
          init: {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authorizationBearerToken}`,
              'Content-Type': 'text/plain',
            },
          },
        });
      },
    },
    plugins: [new CamelCasePlugin()],
  });
};

export const getDb = (): Kysely<Database> => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};