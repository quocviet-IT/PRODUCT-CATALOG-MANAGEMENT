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
