-- Gop y cua nhan vien, gui tu bat ky man hinh nao.
--
-- Ban gon nhat co the: hai loai, hai trang thai. Khong anh chup man hinh,
-- khong diem uu tien. Them duoc sau; con mot o gop y khong ai dung duoc thi
-- khong sua duoc gi.

CREATE TYPE "public"."loai_gop_y" AS ENUM('hong', 'y-kien');--> statement-breakpoint
CREATE TYPE "public"."trang_thai_gop_y" AS ENUM('moi', 'da-xu-ly');--> statement-breakpoint

CREATE TABLE "gop_y" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "loai" "public"."loai_gop_y" NOT NULL,
  "noi_dung" text NOT NULL,
  "trang_thai" "public"."trang_thai_gop_y" DEFAULT 'moi' NOT NULL,
  "duong_dan" text DEFAULT '' NOT NULL,
  "nguoi_gui_id" uuid,
  "nguoi_gui_email" text DEFAULT '' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

-- SET NULL chu khong CASCADE: mot gop y dung van con dung ke ca khi nguoi viet
-- da nghi viec. Email da duoc chep sang cot rieng nen van doc duoc la cua ai.
ALTER TABLE "gop_y" ADD CONSTRAINT "gop_y_nguoi_gui_id_users_id_fk"
  FOREIGN KEY ("nguoi_gui_id") REFERENCES "public"."users"("id")
  ON DELETE set null ON UPDATE no action;--> statement-breakpoint

CREATE INDEX "gop_y_trang_thai_idx" ON "gop_y" USING btree ("trang_thai","created_at");
