-- Vai tro tu ENUM CUNG thanh BANG DU LIEU.
--
-- Ly do: cong ty co nhung nguoi khong phai quan tri ma cung khong phai sale —
-- GSNB, R&D, thuc tap sinh — va them mot vai tro khong duoc bat ai deploy lai.
--
-- Cai KHONG doi la bac quyen: he thong chi cuong che hai bac, vi moi cua gac
-- trong ma nguon hoi mot cau nhi phan "co phai admin khong". Nen moi vai tro
-- buoc phai khai bao no mang bac nao (cot muc_quyen). Neu de vai tro moi khong
-- co bac, ai mang no cung am tham roi vao bac thap nhat.
--
-- Thu tu o day co chu y: kieu `vai_tro` va bang `vai_tro` KHONG song chung
-- duoc — trong Postgres, mot bang cung chiem mot ten trong khong gian ten kieu.
-- Nen phai go cot khoi kieu cu, xoa kieu, roi moi tao bang cung ten.

--> statement-breakpoint
-- 1. Bac quyen. Cung hai gia tri cua kieu cu, nhung la mot kieu khac han: cai
--    nay noi "lam duoc gi", con `vai_tro` noi "goi la gi".
CREATE TYPE "public"."muc_quyen" AS ENUM('admin', 'sale');--> statement-breakpoint

-- 2. Go users.role ra khoi kieu enum. Bo default TRUOC khi doi kieu: mot
--    default con mang kieu cu se khien ALTER TYPE that bai.
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text USING "role"::text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'sale';--> statement-breakpoint

-- 3. Kieu cu khong con ai dung.
DROP TYPE "public"."vai_tro";--> statement-breakpoint

-- 4. Danh muc vai tro.
CREATE TABLE "vai_tro" (
  "ma" text PRIMARY KEY NOT NULL,
  "ten" text NOT NULL,
  "ten_en" text NOT NULL,
  "muc_quyen" "public"."muc_quyen" DEFAULT 'sale' NOT NULL,
  "he_thong" boolean DEFAULT false NOT NULL,
  "thu_tu" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX "vai_tro_thu_tu_idx" ON "vai_tro" USING btree ("thu_tu","ma");--> statement-breakpoint

-- 5. Hai vai tro goc. `he_thong` = true: khong xoa duoc, khong doi bac quyen
--    duoc. Ha bac quyen cua `admin` la khong con ai vao duoc man hinh quan tri.
INSERT INTO "vai_tro" ("ma", "ten", "ten_en", "muc_quyen", "he_thong", "thu_tu") VALUES
  ('admin', 'Quản trị', 'Administrator', 'admin', true, 0),
  ('sale',  'Sale',     'Sales',         'sale',  true, 1);--> statement-breakpoint

-- 6. Bat ky gia tri role la nao (khong the co, nhung bang nay la nguon that ve
--    quyen — mot hang mo coi la mot nguoi khong ai biet duoc phep lam gi) ve
--    sale TRUOC khi dung khoa ngoai, de buoc 7 khong that bai giua chung.
UPDATE "users" SET "role" = 'sale'
  WHERE "role" NOT IN (SELECT "ma" FROM "vai_tro");--> statement-breakpoint

-- 7. RESTRICT chu khong phai SET NULL hay CASCADE: xoa mot vai tro dang co
--    nguoi giu phai BAO LOI de admin chuyen ho di truoc.
ALTER TABLE "users" ADD CONSTRAINT "users_role_vai_tro_ma_fk"
  FOREIGN KEY ("role") REFERENCES "public"."vai_tro"("ma")
  ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint

COMMENT ON COLUMN "users"."role" IS
  'Ma vai tro (vai_tro.ma) — de HIEN THI. Phan quyen phai doc vai_tro.muc_quyen, khong duoc so sanh cot nay voi chuoi ''admin''.';
