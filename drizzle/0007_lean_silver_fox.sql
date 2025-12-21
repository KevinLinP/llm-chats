ALTER TABLE "messages" ALTER COLUMN "textEncrypted" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "textIv" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "chunksEncrypted" "bytea";--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "chunksIv" "bytea";