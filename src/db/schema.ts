import {
  pgTable, uuid, text, integer, bigint, boolean, timestamp,
  jsonb, numeric, pgEnum, uniqueIndex, index,
} from "drizzle-orm/pg-core";

export const vaiTro = pgEnum("vai_tro", ["admin", "sale"]);
export const trangThaiSanPham = pgEnum("trang_thai_san_pham", ["active", "discontinued", "draft"]);
export const nguonDuLieu = pgEnum("nguon_du_lieu", ["upload", "gdrive"]);

/** Khoa chinh trung voi auth.users.id cua Supabase. */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: vaiTro("role").notNull().default("sale"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("users_email_idx").on(t.email)]);

export const brandSettings = pgTable("brand_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyName: text("company_name").notNull().default(""),
  logoKey: text("logo_key"),
  address: text("address").notNull().default(""),
  phone: text("phone").notNull().default(""),
  website: text("website").notNull().default(""),
  primaryColor: text("primary_color").notNull().default("#0B6E63"),
  accentColor: text("accent_color").notNull().default("#8A5A0B"),
  fontFamily: text("font_family").notNull().default("Be Vietnam Pro"),
  currency: text("currency").notNull().default("VND"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  parentId: uuid("parent_id"),
  /** Duong dan to tien dang "/id-goc/id-con/id-nay/" — xem category-path.ts */
  path: text("path").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("categories_path_idx").on(t.path)]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  /** Ten + ma + mo ta da bo dau, chu thuong — phuc vu tim kiem khong dau. */
  searchText: text("search_text").notNull().default(""),
  listPrice: numeric("list_price", { precision: 14, scale: 2 }),
  currency: text("currency").notNull().default("VND"),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  attributes: jsonb("attributes").notNull().default({}),
  status: trangThaiSanPham("status").notNull().default("active"),
  source: nguonDuLieu("source").notNull().default("upload"),
  gdriveFileId: text("gdrive_file_id"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("products_sku_idx").on(t.sku),
  index("products_category_idx").on(t.categoryId),
  index("products_status_idx").on(t.status),
]);

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  /** { thumb: string; medium: string; large: string } — khoa cua tung bien the trong Storage. */
  variants: jsonb("variants").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  bytes: bigint("bytes", { mode: "number" }).notNull(),
  contentHash: text("content_hash").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("product_images_product_idx").on(t.productId),
  index("product_images_hash_idx").on(t.contentHash),
]);

/**
 * Mot catalogue sale gui khach.
 *
 * noiDung la anh chup DONG CUNG luc tao, khong phai con tro toi bang tinh:
 * bang tinh sua moi ngay, con link da gui thi nam trong may khach hang tuan.
 * Khach phai luon thay dung cai sale gui — khong bao gio co chuyen mo ra thay
 * so lieu khac luc tu van, hay mau bien mat vi ai do xoa dong.
 *
 * Chua co owner: he thong dang khong bat dang nhap (quyet dinh 07/09/2026),
 * sale giu danh sach catalogue cua minh trong trinh duyet. Khi nao bat dang
 * nhap thi them mot cot owner_id, khong phai dung lai bang.
 */
export const catalogues = pgTable("catalogues", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Phan xuat hien trong link /c/<slug>. Ngau nhien, khong doan duoc. */
  slug: text("slug").notNull(),
  /**
   * So thu tu de nguoi doc goi ten: "Catalogue #7". Do Postgres cap nen khong
   * bao gio trung, ke ca khi hai sale bam Tao cung mot luc.
   *
   * Vi sao khong dung ngay thang lam ten mac dinh: hai catalogue tao cung mot
   * ngay se mang y het mot cai ten, sale mo danh sach ra khong biet cai nao la
   * cai nao.
   */
  so: bigint("so", { mode: "number" }).notNull().generatedAlwaysAsIdentity(),
  /** Ten sale dat. RONG la hop le — luc do hien thi lay theo `so`. */
  ten: text("ten").notNull().default(""),
  /** Xem KieuNoiDung trong catalogue-share/chia-se.model.ts */
  noiDung: jsonb("noi_dung").notNull(),
  /**
   * Cach TRINH BAY noi dung tren — bo cuc, tong mau, trang bia, thong so nao
   * duoc hien. Xem GiaoDienCatalogue trong chia-se.model.ts.
   *
   * Tach khoi noi_dung co chu y: noi_dung la DU LIEU dong bang (mau nao, anh
   * nao), con cot nay la CACH BAY no ra. Tron hai thu vao mot cot thi moi lan
   * them mot lua chon trinh bay lai phai nang phien ban cua ban chup du lieu,
   * va moi catalogue cu deu phai doc lai qua duong tuong thich.
   *
   * Mac dinh {} — catalogue tao truoc khi co tinh nang nay doc ra gia tri mac
   * dinh, hien y het luc no duoc gui di.
   */
  giaoDien: jsonb("giao_dien").notNull().default({}),
  /**
   * Ai tao. NULL cho ca catalogue tao thoi chua bat dang nhap lan catalogue cua
   * mot tai khoan da bi xoa — link da gui khach thi khong duoc chet theo nguoi
   * tao no.
   */
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("catalogues_slug_idx").on(t.slug),
  index("catalogues_owner_idx").on(t.ownerId, t.createdAt),
]);
