CREATE TYPE "file_type" AS ENUM('pdf', 'image', 'video', 'audio', 'other');--> statement-breakpoint
CREATE TYPE "message_status" AS ENUM('pending', 'success', 'error');--> statement-breakpoint
CREATE TYPE "roles" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"message_id" uuid NOT NULL,
	"file_name" varchar NOT NULL,
	"fileSize" integer NOT NULL,
	"file_url" varchar NOT NULL,
	"file_type" "file_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"title" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"chat_id" uuid NOT NULL,
	"role" "roles" NOT NULL,
	"content" text NOT NULL,
	"message_status" "message_status" DEFAULT 'pending'::"message_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clerk_id" varchar(255) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now(),
	"avatar" varchar
);
--> statement-breakpoint
CREATE INDEX "attachments_to_messages" ON "attachments" ("message_id");--> statement-breakpoint
CREATE INDEX "chats_to_user" ON "chats" ("user_id");--> statement-breakpoint
CREATE INDEX "messages_to_chats" ON "messages" ("chat_id");--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE;