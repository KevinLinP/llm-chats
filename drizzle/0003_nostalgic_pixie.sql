ALTER TABLE "conversations" RENAME COLUMN "iv" TO "titleIv";--> statement-breakpoint
ALTER TABLE "conversations" RENAME COLUMN "partsEncrypted" TO "messagesEncrypted";--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "messagesIv" "bytea"[] NOT NULL;