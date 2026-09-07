CREATE TABLE "catalogues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"ten" text NOT NULL,
	"noi_dung" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "catalogues_slug_idx" ON "catalogues" USING btree ("slug");