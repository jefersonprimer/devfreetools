CREATE TABLE "short_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code" text NOT NULL,
	"original_url" text NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "short_links_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "cnpj_cache" ALTER COLUMN "expires_at" SET DEFAULT '2026-04-08T09:47:11.477Z';--> statement-breakpoint
ALTER TABLE "short_links" ADD CONSTRAINT "short_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_short_links_code" ON "short_links" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_short_links_user_id" ON "short_links" USING btree ("user_id");