import { sql } from "drizzle-orm";
import {
  pgTable, uuid, text, integer, bigint, boolean, timestamp,
  jsonb, numeric, pgEnum, uniqueIndex, index,
} from "drizzle-orm/pg-core";

/**
 * MUC QUYEN — cai he thong thuc su cuong che. Chi hai bac, va co ly do:
 * moi cua gac trong ma nguon deu hoi mot cau nhi phan "co phai admin khong".
 * Them mot bac thu ba o day ma khong sua cac cua gac la tao ra mot bac quyen
 * khong ai kiem tra.
 */
export const mucQuyen = pgEnum("muc_quyen", ["admin", "sale"]);
export const trangThaiSanPham = pgEnum("trang_thai_san_pham", ["active", "discontinued", "draft"]);
export const nguonDuLieu = pgEnum("nguon_du_lieu", ["upload", "gdrive"]);

/**
 * VAI TRO — cai con nguoi doc. Du lieu, khong phai enum, vi cong ty con them
 * vai tro moi (GSNB, R&D, thuc tap sinh) ma khong ai muon doi phai deploy.
 *
 * Vi sao tach lam hai cot `ma` va `muc_quyen`: mot vai tro moi la mot CAI TEN,
 * con quyen thi van chi co hai bac ma he thong biet cuong che. Bat nguoi tao
 * vai tro chon bac quyen khien viec "them GSNB" tro thanh mot lua chon co y
 * thuc, thay vi am tham roi vao bac thap nhat.
 *
 * `he_thong` danh dau hai vai tro goc: admin va sale khong xoa duoc va khong
 * doi duoc muc quyen. Xoa `admin` la khong con ai vao duoc man hinh quan tri;
 * ha muc quyen cua no cung vay.
 */
export const vaiTro = pgTable("vai_tro", {
  /** Ma khong dau, chu thuong — thu nam trong cot users.role. */
  ma: text("ma").primaryKey(),
  ten: text("ten").notNull(),
  /**
   * Ten tieng Anh. Ten vai tro gio la DU LIEU nen khong nam trong tep messages
   * duoc nua; muon man hinh tieng Anh khong ro ri tieng Viet thi ban dich phai
   * di theo hang.
   */
  tenEn: text("ten_en").notNull(),
  mucQuyen: mucQuyen("muc_quyen").notNull().default("sale"),
  heThong: boolean("he_thong").notNull().default(false),
  thuTu: integer("thu_tu").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("vai_tro_thu_tu_idx").on(t.thuTu, t.ma)]);

/** Khoa chinh trung voi auth.users.id cua Supabase. */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  /**
   * Tro toi vai_tro.ma. RESTRICT chu khong phai SET NULL hay CASCADE: xoa mot
   * vai tro dang co nguoi giu phai BAO LOI cho admin chuyen ho sang vai tro
   * khac truoc, chu khong duoc lang le bo trong quyen cua ho — mot hang co
   * role NULL la mot nguoi khong ai biet duoc phep lam gi.
   */
  role: text("role")
    .notNull()
    .default("sale")
    .references(() => vaiTro.ma, { onDelete: "restrict", onUpdate: "cascade" }),
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
  /**
   * Sau moc nay link khong mo duoc nua (mac dinh 90 ngay ke tu luc tao).
   *
   * Luu moc TUYET DOI chu khong tinh tu created_at moi lan doc: sau nay doi
   * chinh sach thanh 60 hay 120 ngay thi nhung link DA GUI cho khach khong
   * duoc phep xe dich theo — khach dang cam trong tay mot cai hen.
   */
  hetHanLuc: timestamp("het_han_luc", { withTimezone: true })
    .notNull()
    .default(sql`now() + interval '90 days'`),
  /**
   * Luc bi khoa tay. NULL = chua khoa.
   *
   * Dung moc thoi gian chu khong dung true/false: khi can biet "link nay bi
   * khoa hoi nao" thi da co san, khong phai di doi mot bang nhat ky rieng.
   */
  khoaLuc: timestamp("khoa_luc", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("catalogues_slug_idx").on(t.slug),
  index("catalogues_owner_idx").on(t.ownerId, t.createdAt),
]);

export const loaiGopY = pgEnum("loai_gop_y", ["hong", "y-kien"]);
export const trangThaiGopY = pgEnum("trang_thai_gop_y", ["moi", "da-xu-ly"]);

/**
 * Gop y cua nhan vien, gui tu bat ky man hinh nao.
 *
 * Ban gon nhat co the: hai loai, hai trang thai. Khong co anh chup man hinh,
 * khong co diem uu tien — them duoc sau, con mot o gop y khong ai dung duoc thi
 * khong sua duoc gi.
 */
export const gopY = pgTable("gop_y", {
  id: uuid("id").primaryKey().defaultRandom(),
  loai: loaiGopY("loai").notNull(),
  noiDung: text("noi_dung").notNull(),
  trangThai: trangThaiGopY("trang_thai").notNull().default("moi"),
  /**
   * Duong dan trang luc gui, vi du "/admin/catalogue-sheet".
   *
   * Luu duong dan chu khong luu ca URL: chuoi truy van co the chua tu khoa tim
   * kiem cua sale, va mot bang gop y khong phai cho de luu lai thoi quen lam
   * viec cua tung nguoi.
   */
  duongDan: text("duong_dan").notNull().default(""),
  /**
   * Ai gui. NULL khi tai khoan do bi xoa sau nay — mot gop y dung van con dung
   * ke ca khi nguoi viet da nghi viec.
   */
  nguoiGuiId: uuid("nguoi_gui_id").references(() => users.id, { onDelete: "set null" }),
  /** Chep lai luc gui, de con doc duoc khi tai khoan da bi xoa. */
  nguoiGuiEmail: text("nguoi_gui_email").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("gop_y_trang_thai_idx").on(t.trangThai, t.createdAt)]);
