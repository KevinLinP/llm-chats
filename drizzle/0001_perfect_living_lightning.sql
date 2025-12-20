ALTER TABLE "conversations" DROP COLUMN "textEncrypted";
ALTER TABLE "conversations" ADD COLUMN "textEncrypted" bytea[] NOT NULL;

