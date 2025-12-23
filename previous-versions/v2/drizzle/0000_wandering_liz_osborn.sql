CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"iv" "bytea" NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"titleEncrypted" "bytea" NOT NULL,
	"textEncrypted" "bytea" NOT NULL
);
