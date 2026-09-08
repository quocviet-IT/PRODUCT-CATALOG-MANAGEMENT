ALTER TABLE "catalogues" ADD COLUMN "giao_dien" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "catalogues" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "catalogues" ADD CONSTRAINT "catalogues_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "catalogues_owner_idx" ON "catalogues" USING btree ("owner_id","created_at");