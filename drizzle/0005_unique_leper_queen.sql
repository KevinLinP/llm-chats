CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversationId" uuid NOT NULL,
	"index" integer NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"senderEncrypted" "bytea" NOT NULL,
	"senderIv" "bytea" NOT NULL,
	"textEncrypted" "bytea" NOT NULL,
	"textIv" "bytea" NOT NULL,
	"modelIdEncrypted" "bytea",
	"modelIdIv" "bytea",
	"tokenUsageEncrypted" "bytea",
	"tokenUsageIv" "bytea"
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "messages_conversationId_index_idx" ON "messages" USING btree ("conversationId","index");--> statement-breakpoint
ALTER TABLE "conversations" DROP COLUMN "messagesEncrypted";--> statement-breakpoint
ALTER TABLE "conversations" DROP COLUMN "messagesIv";