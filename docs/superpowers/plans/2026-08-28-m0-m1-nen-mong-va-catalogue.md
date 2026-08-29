# M0 + M1 — Nền móng và Catalogue · Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng ứng dụng web cho phép nhân viên đăng nhập, upload ảnh sản phẩm hàng loạt, và quản lý toàn bộ kho catalogue (danh mục, sản phẩm, ảnh, tìm kiếm tiếng Việt không dấu).

**Architecture:** Next.js 15 App Router chạy toàn bộ logic nghiệp vụ ở phía máy chủ. Dữ liệu nằm trên Supabase (PostgreSQL + Auth + Storage). Truy vấn qua Drizzle ORM với migration lưu trong git. Logic nghiệp vụ tách thành các module thuần (`src/modules/*`) không phụ thuộc Next.js, nên kiểm thử được bằng Vitest mà không cần dựng máy chủ; tầng `repo` là nơi duy nhất chạm cơ sở dữ liệu.

**Tech Stack:** Next.js 15 · TypeScript 5 · Tailwind CSS 4 · Drizzle ORM + postgres.js · Supabase (Postgres/Auth/Storage) · sharp · Zod · Vitest · Playwright

**Spec nguồn:** [PRD-CQS-001](../specs/2026-08-28-catalogue-quote-system-design.md) — kế hoạch này phủ mốc **M0** (nền móng) và **M1** (catalogue), tức các yêu cầu **A1, A4, A5, B1, B2, B3, B4, G1, G2**.

---

## Global Constraints

Mọi task đều ngầm chịu các ràng buộc sau. Giá trị lấy nguyên văn từ PRD.

- **Node.js >= 20.** Máy phát triển hiện tại là v24.15.0, npm 11.12.1.
- **TypeScript `strict: true`.** Không dùng `any` trong mã sản phẩm; nếu buộc phải, dùng `unknown` rồi thu hẹp kiểu.
- **Toàn bộ chuỗi hiển thị bằng tiếng Việt**, đặt trong `src/messages/vi.ts`, không viết thẳng vào JSX (PRD §7.5).
- **Kiểm tra vai trò luôn ở phía máy chủ.** Không bao giờ dựa vào việc ẩn nút trên giao diện (PRD §8.2).
- **Hai vai trò duy nhất:** `admin`, `sale` (PRD §2).
- **Ảnh sinh đúng 3 biến thể:** `thumb` 400px · `medium` 1200px · `large` 2000px, đo theo cạnh dài nhất, giữ nguyên tỉ lệ, xuất WebP, giữ bản gốc (PRD A5).
- **Xoá sạch EXIF** trước khi phục vụ ảnh ra ngoài (PRD A5).
- **Giới hạn upload:** tối đa 20 MB mỗi ảnh, tối đa 200 ảnh mỗi lần; định dạng nhận: JPG, PNG, WebP, HEIC (PRD A1).
- **Tìm kiếm phải khớp cả có dấu lẫn không dấu** — gõ `ghe go soi` phải ra `Ghế gỗ sồi` (PRD B4).
- **Ngưỡng hiệu năng:** tìm kiếm catalogue trên 10.000 sản phẩm phải dưới 500 ms (PRD §7.1).
- **Tiền tệ:** mặc định VND, định dạng `2.500.000 ₫`; hỗ trợ USD (PRD §7.5).
- **Ngày tháng:** `dd/mm/yyyy` (PRD §7.5).
- **`sku` là duy nhất toàn hệ thống** (PRD §5).
- **Mọi commit dùng tiền tố quy ước:** `feat:`, `fix:`, `test:`, `chore:`, `refactor:`.

---

## Cấu trúc file

Bảng dưới khoá lại quyết định phân rã. Mỗi file có đúng một trách nhiệm.

| File | Trách nhiệm |
|---|---|
| `src/lib/env.ts` | Đọc và kiểm tra biến môi trường. Nơi duy nhất chạm `process.env` |
| `src/lib/result.ts` | Kiểu `Result<T, E>` dùng chung cho các thao tác có thể thất bại |
| `src/lib/vietnamese.ts` | Bỏ dấu tiếng Việt, chuẩn hoá chuỗi để tìm kiếm |
| `src/lib/money.ts` | Định dạng tiền tệ VND/USD |
| `src/lib/date.ts` | Định dạng ngày `dd/mm/yyyy` |
| `src/messages/vi.ts` | Toàn bộ chuỗi hiển thị tiếng Việt |
| `src/db/schema.ts` | Định nghĩa bảng Drizzle cho M0+M1 |
| `src/db/client.ts` | Khởi tạo kết nối Drizzle, gom về một chỗ |
| `src/db/migrations/` | Migration sinh bởi drizzle-kit, commit vào git |
| `src/auth/supabase-server.ts` | Tạo Supabase client đọc/ghi cookie phiên |
| `src/auth/guard.ts` | `requireUser`, `requireAdmin` — chốt chặn vai trò phía máy chủ |
| `src/auth/actions.ts` | Server action đăng nhập, đăng xuất |
| `src/modules/catalog/category-path.ts` | Hàm thuần dựng và cập nhật đường dẫn cây danh mục |
| `src/modules/catalog/categories.repo.ts` | Truy vấn danh mục |
| `src/modules/catalog/categories.service.ts` | Nghiệp vụ danh mục: tạo, đổi tên, di chuyển, xoá |
| `src/modules/catalog/products.repo.ts` | Truy vấn sản phẩm |
| `src/modules/catalog/products.service.ts` | Nghiệp vụ sản phẩm |
| `src/modules/catalog/search-query.ts` | Hàm thuần dựng điều kiện lọc từ tham số tìm kiếm |
| `src/modules/media/image-processor.ts` | sharp: sinh 3 biến thể, xoá EXIF, tính mã băm |
| `src/modules/media/storage.ts` | Đọc/ghi Supabase Storage |
| `src/modules/media/images.repo.ts` | Truy vấn bảng ảnh sản phẩm |
| `src/modules/media/upload.service.ts` | Điều phối: nhận file → xử lý → lưu trữ → ghi CSDL |
| `src/modules/brand/brand.repo.ts` | Đọc/ghi cấu hình thương hiệu |
| `src/app/**` | Route, trang, server action — chỉ gọi xuống module, không chứa nghiệp vụ |
| `tests/**` | Vitest, phản chiếu cấu trúc `src/` |

**Nguyên tắc phụ thuộc:** `app` → `modules` → `db`/`lib`. Không có mũi tên ngược. `lib/*` không được import bất cứ thứ gì từ `modules/*` hay `db/*`.

---

## Chuẩn bị trước Task 1

Việc này **bạn (người dùng) làm thủ công**, kết quả là file `.env.local`. Không có bước nào sau đây tự động hoá được.

- [ ] **B1. Tạo dự án Supabase**

Vào https://supabase.com → **New project**. Đặt tên `catalogue-quote-system`, chọn vùng **Southeast Asia (Singapore)** cho độ trễ thấp nhất từ Việt Nam. Lưu lại mật khẩu cơ sở dữ liệu — trang này chỉ hiện một lần.

- [ ] **B2. Lấy khoá**

Trong dự án vừa tạo, vào **Project Settings → API**, chép ba giá trị: `Project URL`, `Publishable key` (`sb_publishable_...`), `Secret key` (`sb_secret_...`).
Vào **Project Settings → Database → Connection string → URI**, chép chuỗi kết nối và thay `[YOUR-PASSWORD]` bằng mật khẩu ở bước B1.

- [ ] **B3. Tạo bucket lưu ảnh**

Vào **Storage → New bucket**. Tên `catalogue`. Đặt **Private** (không tick Public) — ảnh sẽ được phục vụ qua URL có ký và hạn dùng, theo PRD §8.3.

- [ ] **B4. Ghi file `.env.local`**

Tạo `catalogue-quote-system/.env.local` với nội dung sau, thay các giá trị trong `<>`:

```
DATABASE_URL=<chuoi ket noi URI o buoc B2>
NEXT_PUBLIC_SUPABASE_URL=<Project URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon public key>
SUPABASE_SECRET_KEY=<service_role key>
SUPABASE_STORAGE_BUCKET=catalogue
```

- [ ] **B5. Xác nhận kết nối được**

```bash
cd catalogue-quote-system
node -e "const u=new URL(process.env.DATABASE_URL||require('fs').readFileSync('.env.local','utf8').match(/DATABASE_URL=(.*)/)[1]);console.log('host:',u.hostname)"
```

Kỳ vọng: in ra hostname dạng `db.xxxxx.supabase.co` hoặc `aws-0-ap-southeast-1.pooler.supabase.com`.

---

## Task 1: Khởi tạo dự án và tầng cấu hình

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.mts`, `.gitignore`, `.env.example`
- Create: `src/lib/env.ts`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Test: `tests/lib/env.test.ts`

**Interfaces:**
- Consumes: — (task đầu tiên)
- Produces:
  - `getEnv(): Env` — đọc và kiểm biến môi trường, ném lỗi nếu thiếu. Có nhớ kết quả.
  - `parseEnv(raw: Record<string, string | undefined>): Env` — hàm thuần, dùng cho test.
  - `type Env = { DATABASE_URL: string; NEXT_PUBLIC_SUPABASE_URL: string; NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string; SUPABASE_SECRET_KEY: string; SUPABASE_STORAGE_BUCKET: string }`

- [ ] **Step 1: Khởi tạo dự án Next.js**

```bash
cd /c/Users/pit010/catalogue-quote-system
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --yes
```

Nếu thư mục đã có file (`docs/`, `build_prd_page.py`), lệnh sẽ hỏi xác nhận — trả lời có, nó chỉ thêm file mới chứ không xoá.

- [ ] **Step 2: Cài phụ thuộc**

```bash
npm install drizzle-orm postgres zod @supabase/supabase-js @supabase/ssr sharp
npm install -D drizzle-kit vitest @vitest/coverage-v8 dotenv tsx @types/node
```

- [ ] **Step 3: Khởi tạo git và chặn file bí mật**

```bash
git init
printf '\n# bi mat\n.env.local\n.env*.local\n\n# build\n.next/\nnode_modules/\ncoverage/\ntest-results/\n' >> .gitignore
```

- [ ] **Step 4: Viết test cho tầng cấu hình (chưa có mã nguồn)**

Tạo `tests/lib/env.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseEnv } from "@/lib/env";

const day = {
  DATABASE_URL: "postgresql://u:p@db.abc.supabase.co:5432/postgres",
  NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "anon-key",
  SUPABASE_SECRET_KEY: "service-key",
  SUPABASE_STORAGE_BUCKET: "catalogue",
};

describe("parseEnv", () => {
  it("tra ve cau hinh khi day du bien", () => {
    expect(parseEnv(day)).toEqual(day);
  });

  it("dung bucket mac dinh khi khong khai bao", () => {
    const { SUPABASE_STORAGE_BUCKET, ...thieu } = day;
    expect(parseEnv(thieu).SUPABASE_STORAGE_BUCKET).toBe("catalogue");
  });

  it("nem loi va neu ten bien bi thieu", () => {
    const { SUPABASE_SECRET_KEY, ...thieu } = day;
    expect(() => parseEnv(thieu)).toThrow(/SUPABASE_SECRET_KEY/);
  });

  it("nem loi khi DATABASE_URL khong phai URL", () => {
    expect(() => parseEnv({ ...day, DATABASE_URL: "khong-phai-url" })).toThrow(/DATABASE_URL/);
  });
});
```

- [ ] **Step 5: Cấu hình Vitest**

Tạo `vitest.config.mts` (duoi `.mts` danh dau ESM tuong minh; dung `.ts` se sinh canh bao "native config loader" cua Vite 4):

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

Tạo `tests/setup.ts`:

```ts
import { config } from "dotenv";
config({ path: ".env.local" });
```

Thêm vào `package.json` trong `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest",
"typecheck": "tsc --noEmit"
```

- [ ] **Step 6: Chạy test để xác nhận nó hỏng**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "@/lib/env"`

- [ ] **Step 7: Viết `src/lib/env.ts`**

```ts
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url({ message: "DATABASE_URL phai la mot URL hop le" }),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default("catalogue"),
});

export type Env = z.infer<typeof schema>;

/** Ham thuan — dung cho test va cho getEnv. */
export function parseEnv(raw: Record<string, string | undefined>): Env {
  const ket_qua = schema.safeParse(raw);
  if (!ket_qua.success) {
    const chi_tiet = ket_qua.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Cau hinh moi truong khong hop le — ${chi_tiet}`);
  }
  return ket_qua.data;
}

let da_doc: Env | null = null;

/** Doc bien moi truong mot lan roi nho ket qua. */
export function getEnv(): Env {
  if (da_doc === null) da_doc = parseEnv(process.env);
  return da_doc;
}
```

- [ ] **Step 8: Chạy test để xác nhận nó xanh**

Run: `npm test`
Expected: PASS — 4 test trong `tests/lib/env.test.ts`

- [ ] **Step 9: Kiểm tra kiểu và build**

Run: `npm run typecheck && npm run build`
Expected: cả hai lệnh kết thúc mã 0.

- [ ] **Step 10: Ghi `.env.example` và commit**

Tạo `.env.example`:

```
DATABASE_URL=postgresql://postgres:MAT_KHAU@db.xxxxx.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_STORAGE_BUCKET=catalogue
```

```bash
git add -A
git commit -m "feat: khoi tao du an Next.js va tang cau hinh moi truong"
```

---

## Task 2: Lược đồ cơ sở dữ liệu và migration

**Files:**
- Create: `src/db/schema.ts`, `src/db/client.ts`, `drizzle.config.ts`
- Create: `src/db/migrations/0000_*.sql` (sinh tự động)
- Test: `tests/db/schema.test.ts`

**Interfaces:**
- Consumes: `getEnv()` từ Task 1
- Produces:
  - `db` — thực thể Drizzle đã kết nối, import bằng `import { db } from "@/db/client"`
  - `sql` — handle postgres.js thô, dùng cho migration và test rollback
  - Bảng: `users`, `brandSettings`, `categories`, `products`, `productImages`
  - `withRollback<T>(fn: (tx: Tx) => Promise<T>): Promise<T>` — chạy test trong giao dịch rồi huỷ, không để lại dữ liệu rác
  - `type Tx` — handle giao dịch Drizzle truyền cho hàm repo

- [ ] **Step 1: Viết lược đồ `src/db/schema.ts`**

```ts
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
```

- [ ] **Step 2: Viết `src/db/client.ts`**

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

const client = postgres(getEnv().DATABASE_URL, { max: 10, prepare: false });

export const sql = client;
export const db = drizzle(client, { schema });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
```

Ghi chú: `prepare: false` là bắt buộc khi đi qua connection pooler của Supabase.

- [ ] **Step 3: Cấu hình drizzle-kit**

Tạo `drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

Thêm vào `package.json` scripts:

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate"
```

- [ ] **Step 4: Sinh migration và bật extension tìm kiếm**

```bash
npm run db:generate
```

Mở file SQL vừa sinh trong `src/db/migrations/`, thêm vào **đầu file**:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

và vào **cuối file**:

```sql
CREATE INDEX products_search_trgm_idx ON products USING gin (search_text gin_trgm_ops);
```

Chỉ mục trigram này là thứ đáp ứng ngưỡng dưới 500 ms ở PRD §7.1.

- [ ] **Step 5: Áp migration lên Supabase**

Run: `npm run db:migrate`
Expected: in ra danh sách migration đã áp, kết thúc mã 0. Vào Supabase → **Table Editor** thấy 5 bảng mới.

- [ ] **Step 6: Viết test kiểm tra lược đồ và tiện ích rollback**

Tạo `tests/helpers/db.ts`:

```ts
import { db } from "@/db/client";
import type { Tx } from "@/db/client";

/** Chay ham trong mot giao dich roi huy — test khong de lai du lieu rac. */
export async function withRollback<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const HUY = Symbol("huy-giao-dich");
  try {
    return await db.transaction(async (tx) => {
      const kq = await fn(tx);
      throw Object.assign(new Error("rollback"), { [HUY]: true, kq });
    });
  } catch (e) {
    if (e && typeof e === "object" && (e as Record<symbol, unknown>)[HUY]) {
      return (e as { kq: T }).kq;
    }
    throw e;
  }
}
```

Tạo `tests/db/schema.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { sql } from "@/db/client";
import { withRollback } from "../helpers/db";
import { categories, products, productImages } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("luoc do co so du lieu", () => {
  it("co du 5 bang", async () => {
    const rows = await sql<{ table_name: string }[]>`
      select table_name from information_schema.tables where table_schema = 'public'
    `;
    const ten = rows.map((r) => r.table_name);
    for (const b of ["users", "brand_settings", "categories", "products", "product_images"]) {
      expect(ten).toContain(b);
    }
  });

  it("co chi muc trigram cho tim kiem", async () => {
    const rows = await sql<{ indexname: string }[]>`
      select indexname from pg_indexes where tablename = 'products'
    `;
    expect(rows.map((r) => r.indexname)).toContain("products_search_trgm_idx");
  });

  it("chan sku trung", async () => {
    await withRollback(async (tx) => {
      await tx.insert(categories).values({ id: "11111111-1111-1111-1111-111111111111", name: "Ghe", path: "/11111111-1111-1111-1111-111111111111/" });
      await tx.insert(products).values({ sku: "SP001", name: "Ghe go soi", searchText: "sp001 ghe go soi" });
      await expect(
        tx.insert(products).values({ sku: "SP001", name: "Ghe khac", searchText: "sp001 ghe khac" })
      ).rejects.toThrow();
    });
  });

  it("xoa san pham keo theo xoa anh", async () => {
    await withRollback(async (tx) => {
      const [sp] = await tx.insert(products)
        .values({ sku: "SP900", name: "Tam", searchText: "sp900 tam" }).returning();
      await tx.insert(productImages).values({
        productId: sp.id, storageKey: "k", variants: { thumb: "t", medium: "m", large: "l" },
        width: 100, height: 100, bytes: 1000, contentHash: "abc",
      });
      await tx.delete(products).where(eq(products.id, sp.id));
      const con_lai = await tx.select().from(productImages).where(eq(productImages.productId, sp.id));
      expect(con_lai).toHaveLength(0);
    });
  });
});
```

- [ ] **Step 7: Chạy test**

Run: `npm test -- tests/db/schema.test.ts`
Expected: PASS — 4 test.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: luoc do co so du lieu cho catalogue va migration dau tien"
```

---

## Task 3: Đăng nhập, phiên và chốt chặn vai trò

Phủ yêu cầu **G1** của PRD.

**Files:**
- Create: `src/auth/supabase-server.ts`, `src/auth/guard.ts`, `src/auth/actions.ts`
- Create: `src/app/login/page.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`
- Create: `src/messages/vi.ts`
- Modify: `src/app/page.tsx`
- Test: `tests/auth/guard.test.ts`

**Interfaces:**
- Consumes: `getEnv()` (Task 1), bảng `users` (Task 2)
- Produces:
  - `type NguoiDung = { id: string; email: string; fullName: string; role: "admin" | "sale"; isActive: boolean }`
  - `getSessionUser(): Promise<NguoiDung | null>` — đọc phiên từ cookie, tra bảng `users`
  - `requireUser(): Promise<NguoiDung>` — chuyển hướng `/login` nếu chưa đăng nhập hoặc tài khoản bị vô hiệu hoá
  - `requireAdmin(): Promise<NguoiDung>` — như trên, thêm điều kiện `role === "admin"`, ngược lại chuyển hướng `/admin`
  - `kiemTraQuyen(user: NguoiDung | null, canAdmin: boolean): KetQuaQuyen` — hàm thuần chứa toàn bộ quy tắc, để test không cần Next.js
  - `type KetQuaQuyen = { cho_phep: true; user: NguoiDung } | { cho_phep: false; ly_do: "chua_dang_nhap" | "bi_vo_hieu_hoa" | "khong_du_quyen" }`

- [ ] **Step 1: Viết test cho quy tắc phân quyền**

Tạo `tests/auth/guard.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { kiemTraQuyen, type NguoiDung } from "@/auth/guard";

const sale: NguoiDung = { id: "1", email: "a@b.c", fullName: "Sale", role: "sale", isActive: true };
const admin: NguoiDung = { ...sale, id: "2", role: "admin" };

describe("kiemTraQuyen", () => {
  it("tu choi khi chua dang nhap", () => {
    expect(kiemTraQuyen(null, false)).toEqual({ cho_phep: false, ly_do: "chua_dang_nhap" });
  });

  it("tu choi tai khoan bi vo hieu hoa", () => {
    expect(kiemTraQuyen({ ...sale, isActive: false }, false))
      .toEqual({ cho_phep: false, ly_do: "bi_vo_hieu_hoa" });
  });

  it("cho sale vao route khong doi quyen admin", () => {
    expect(kiemTraQuyen(sale, false)).toEqual({ cho_phep: true, user: sale });
  });

  it("chan sale khoi route doi quyen admin", () => {
    expect(kiemTraQuyen(sale, true)).toEqual({ cho_phep: false, ly_do: "khong_du_quyen" });
  });

  it("cho admin vao route doi quyen admin", () => {
    expect(kiemTraQuyen(admin, true)).toEqual({ cho_phep: true, user: admin });
  });

  it("uu tien ly do vo hieu hoa hon ly do thieu quyen", () => {
    expect(kiemTraQuyen({ ...sale, isActive: false }, true))
      .toEqual({ cho_phep: false, ly_do: "bi_vo_hieu_hoa" });
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận nó hỏng**

Run: `npm test -- tests/auth/guard.test.ts`
Expected: FAIL — `Failed to resolve import "@/auth/guard"`

- [ ] **Step 3: Viết `src/auth/supabase-server.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";

export async function taoSupabaseServer() {
  const kho = await cookies();
  const env = getEnv();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => kho.getAll(),
      setAll: (ds) => {
        try {
          ds.forEach(({ name, value, options }) => kho.set(name, value, options));
        } catch {
          // Duoc goi tu Server Component — middleware da lam moi phien, bo qua.
        }
      },
    },
  });
}
```

- [ ] **Step 4: Viết `src/auth/guard.ts`**

```ts
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { taoSupabaseServer } from "./supabase-server";

export type NguoiDung = {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "sale";
  isActive: boolean;
};

export type KetQuaQuyen =
  | { cho_phep: true; user: NguoiDung }
  | { cho_phep: false; ly_do: "chua_dang_nhap" | "bi_vo_hieu_hoa" | "khong_du_quyen" };

/** Toan bo quy tac phan quyen nam o day — ham thuan, khong cham Next.js. */
export function kiemTraQuyen(user: NguoiDung | null, canAdmin: boolean): KetQuaQuyen {
  if (user === null) return { cho_phep: false, ly_do: "chua_dang_nhap" };
  if (!user.isActive) return { cho_phep: false, ly_do: "bi_vo_hieu_hoa" };
  if (canAdmin && user.role !== "admin") return { cho_phep: false, ly_do: "khong_du_quyen" };
  return { cho_phep: true, user };
}

export async function getSessionUser(): Promise<NguoiDung | null> {
  const supabase = await taoSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const [ho_so] = await db.select().from(users).where(eq(users.id, data.user.id)).limit(1);
  if (!ho_so) return null;
  return {
    id: ho_so.id,
    email: ho_so.email,
    fullName: ho_so.fullName,
    role: ho_so.role,
    isActive: ho_so.isActive,
  };
}

async function chot(canAdmin: boolean): Promise<NguoiDung> {
  const kq = kiemTraQuyen(await getSessionUser(), canAdmin);
  if (kq.cho_phep) return kq.user;
  if (kq.ly_do === "khong_du_quyen") redirect("/admin?loi=khong_du_quyen");
  redirect(`/login?loi=${kq.ly_do}`);
}

export const requireUser = () => chot(false);
export const requireAdmin = () => chot(true);
```

- [ ] **Step 5: Chạy test để xác nhận nó xanh**

Run: `npm test -- tests/auth/guard.test.ts`
Expected: PASS — 6 test.

- [ ] **Step 6: Viết kho chuỗi hiển thị `src/messages/vi.ts`**

```ts
export const vi = {
  chung: {
    luu: "Lưu",
    huy: "Huỷ",
    xoa: "Xoá",
    sua: "Sửa",
    them: "Thêm",
    tim_kiem: "Tìm kiếm",
    dang_tai: "Đang tải…",
    khong_co_du_lieu: "Chưa có dữ liệu",
  },
  dang_nhap: {
    tieu_de: "Đăng nhập",
    email: "Email",
    mat_khau: "Mật khẩu",
    nut: "Đăng nhập",
    dang_xuat: "Đăng xuất",
    sai_thong_tin: "Email hoặc mật khẩu không đúng.",
    chua_dang_nhap: "Vui lòng đăng nhập để tiếp tục.",
    bi_vo_hieu_hoa: "Tài khoản đã bị vô hiệu hoá. Liên hệ quản trị viên.",
    khong_du_quyen: "Bạn không có quyền truy cập trang này.",
  },
  danh_muc: {
    ten_moi_placeholder: "Tên danh mục mới",
    danh_muc_goc: "— Danh mục gốc —",
  },
  dieu_huong: {
    catalogue: "Catalogue",
    danh_muc: "Danh mục",
    san_pham: "Sản phẩm",
    tai_anh: "Tải ảnh lên",
    thuong_hieu: "Thương hiệu",
  },
} as const;
```

- [ ] **Step 7: Viết server action đăng nhập `src/auth/actions.ts`**

```ts
"use server";

import { redirect } from "next/navigation";
import { taoSupabaseServer } from "./supabase-server";

export async function dangNhap(_truoc: string | null, form: FormData): Promise<string | null> {
  const email = String(form.get("email") ?? "");
  const matKhau = String(form.get("mat_khau") ?? "");
  const supabase = await taoSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password: matKhau });
  if (error) return "sai_thong_tin";
  redirect("/admin");
}

export async function dangXuat(): Promise<void> {
  const supabase = await taoSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
```

- [ ] **Step 8: Viết trang đăng nhập `src/app/login/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { dangNhap } from "@/auth/actions";
import { vi } from "@/messages/vi";

const LY_DO: Record<string, string> = {
  chua_dang_nhap: vi.dang_nhap.chua_dang_nhap,
  bi_vo_hieu_hoa: vi.dang_nhap.bi_vo_hieu_hoa,
  sai_thong_tin: vi.dang_nhap.sai_thong_tin,
};

export default async function TrangDangNhap({
  searchParams,
}: {
  searchParams: Promise<{ loi?: string }>;
}) {
  const { loi } = await searchParams;
  const thong_bao = loi ? LY_DO[loi] : null;

  async function guiForm(form: FormData) {
    "use server";
    const ma_loi = await dangNhap(null, form);
    // Phai redirect chu KHONG duoc throw: dangNhap tra ve chuoi ma loi (khong phai
    // NEXT_REDIRECT), nen throw se thanh loi khong ai bat va hien man hinh loi cua
    // Next thay vi khung canh bao ngay tren form.
    if (ma_loi) redirect(`/login?loi=${ma_loi}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-bold">{vi.dang_nhap.tieu_de}</h1>
      {thong_bao && (
        <p role="alert" className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm">
          {thong_bao}
        </p>
      )}
      <form action={guiForm} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          {vi.dang_nhap.email}
          <input name="email" type="email" required autoComplete="email"
                 className="rounded border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {vi.dang_nhap.mat_khau}
          <input name="mat_khau" type="password" required autoComplete="current-password"
                 className="rounded border px-3 py-2" />
        </label>
        <button type="submit" className="rounded bg-teal-800 px-4 py-2 font-medium text-white">
          {vi.dang_nhap.nut}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 9: Viết khung quản trị `src/app/admin/layout.tsx`**

```tsx
import Link from "next/link";
import { requireUser } from "@/auth/guard";
import { dangXuat } from "@/auth/actions";
import { vi } from "@/messages/vi";

export default async function KhungQuanTri({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen">
      <nav className="flex w-56 flex-col gap-1 border-r p-4">
        <p className="mb-4 text-sm font-semibold">{user.fullName}</p>
        <Link href="/admin/categories" className="rounded px-2 py-1 text-sm hover:bg-neutral-100">
          {vi.dieu_huong.danh_muc}
        </Link>
        <Link href="/admin/products" className="rounded px-2 py-1 text-sm hover:bg-neutral-100">
          {vi.dieu_huong.san_pham}
        </Link>
        <Link href="/admin/upload" className="rounded px-2 py-1 text-sm hover:bg-neutral-100">
          {vi.dieu_huong.tai_anh}
        </Link>
        {user.role === "admin" && (
          <Link href="/admin/brand" className="rounded px-2 py-1 text-sm hover:bg-neutral-100">
            {vi.dieu_huong.thuong_hieu}
          </Link>
        )}
        <form action={dangXuat} className="mt-auto">
          <button type="submit" className="text-sm text-neutral-500 hover:underline">
            {vi.dang_nhap.dang_xuat}
          </button>
        </form>
      </nav>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

Tạo `src/app/admin/page.tsx`:

```tsx
import { requireUser } from "@/auth/guard";

export default async function TrangChuQuanTri() {
  const user = await requireUser();
  return <h1 className="text-xl font-bold">Xin chào, {user.fullName}</h1>;
}
```

Thay `src/app/page.tsx` bằng:

```tsx
import { redirect } from "next/navigation";
export default function Trang() {
  redirect("/admin");
}
```

- [ ] **Step 10: Tạo tài khoản admin đầu tiên**

Tạo `scripts/tao-admin.mts` (duoi `.mts` la bat buoc: file nay dung top-level await, ma package.json khong dat "type": "module" nen tsx se bien dich `.ts` thanh CommonJS va bao loi "Top-level await is currently not supported with the cjs output format"):

```ts
import { config } from "dotenv";

// PHAI nap bien moi truong TRUOC khi import bat cu module nao doc chung.
// Trong ESM moi lenh `import` tinh deu duoc NANG LEN va chay truoc cac cau lenh
// thuong, nen `import { db } from "../src/db/client"` se goi getEnv() truoc khi
// dong config() nay kip chay. Vi vay cac module do phai nap bang import() dong
// o duoi, khong duoc dat o dau file.
config({ path: ".env.local" });

const [email, matKhau, hoTen] = process.argv.slice(2);
if (!email || !matKhau || !hoTen) {
  console.error('Dung: npx tsx scripts/tao-admin.mts <email> <mat-khau> "<ho ten>"');
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const { getEnv } = await import("../src/lib/env");
const { db } = await import("../src/db/client");
const { users } = await import("../src/db/schema");

const env = getEnv();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY);

const { data, error } = await admin.auth.admin.createUser({
  email, password: matKhau, email_confirm: true,
});
if (error) { console.error("Loi tao tai khoan:", error.message); process.exit(1); }

await db.insert(users).values({
  id: data.user.id, email, fullName: hoTen, role: "admin", isActive: true,
});
console.log("Da tao admin:", email);
process.exit(0);
```

Chạy:

```bash
npx tsx scripts/tao-admin.mts admin@congty.vn MatKhauManh123 "Quản trị viên"
```

Expected: in ra `Da tao admin: admin@congty.vn`

- [ ] **Step 11: Kiểm tra bằng tay**

```bash
npm run dev
```

Mở `http://localhost:3000` → bị chuyển tới `/login`. Đăng nhập bằng tài khoản vừa tạo → vào được `/admin` và thấy tên hiển thị. Bấm **Đăng xuất** → quay lại `/login`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: dang nhap, phien va chot chan vai tro phia may chu"
```

---

## Task 4: Tiện ích tiếng Việt, tiền tệ và ngày tháng

Phủ ràng buộc tìm kiếm không dấu (**B4**) và định dạng ở PRD §7.5.

**Files:**
- Create: `src/lib/vietnamese.ts`, `src/lib/money.ts`, `src/lib/date.ts`
- Test: `tests/lib/vietnamese.test.ts`, `tests/lib/money.test.ts`, `tests/lib/date.test.ts`

**Interfaces:**
- Consumes: —
- Produces:
  - `boDau(s: string): string` — bỏ dấu, giữ nguyên hoa thường
  - `chuanHoaTimKiem(s: string): string` — bỏ dấu + chữ thường + gộp khoảng trắng
  - `dungSearchText(p: { sku: string; name: string; description?: string }): string`
  - `dinhDangTien(soTien: number, tienTe: "VND" | "USD"): string`
  - `dinhDangNgay(d: Date): string`

- [ ] **Step 1: Viết test tiếng Việt**

Tạo `tests/lib/vietnamese.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { boDau, chuanHoaTimKiem, dungSearchText } from "@/lib/vietnamese";

describe("boDau", () => {
  it("bo dau thanh va dau mu", () => {
    expect(boDau("Ghế gỗ sồi")).toBe("Ghe go soi");
  });
  it("chuyen d gach ngang thanh d", () => {
    expect(boDau("Đèn đứng")).toBe("Den dung");
  });
  it("giu nguyen chuoi khong dau", () => {
    expect(boDau("Sofa 3 cho")).toBe("Sofa 3 cho");
  });
  it("xu ly du 12 nguyen am co dau", () => {
    expect(boDau("àáảãạ ăằắẳẵặ âầấẩẫậ")).toBe("aaaaa aaaaaa aaaaaa");
    expect(boDau("èéẻẽẹ êềếểễệ")).toBe("eeeee eeeeee");
    expect(boDau("òóỏõọ ôồốổỗộ ơờớởỡợ")).toBe("ooooo oooooo oooooo");
    expect(boDau("ùúủũụ ưừứửữự")).toBe("uuuuu uuuuuu");
    expect(boDau("ìíỉĩị ỳýỷỹỵ")).toBe("iiiii yyyyy");
  });
});

describe("chuanHoaTimKiem", () => {
  it("bo dau, ha chu thuong va gop khoang trang", () => {
    expect(chuanHoaTimKiem("  Ghế   Gỗ  Sồi ")).toBe("ghe go soi");
  });
});

describe("dungSearchText", () => {
  it("gop ma, ten va mo ta", () => {
    expect(dungSearchText({ sku: "SP001", name: "Ghế gỗ sồi", description: "Chân Đen" }))
      .toBe("sp001 ghe go soi chan den");
  });
  it("chay duoc khi khong co mo ta", () => {
    expect(dungSearchText({ sku: "SP002", name: "Bàn trà" })).toBe("sp002 ban tra");
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận nó hỏng**

Run: `npm test -- tests/lib/vietnamese.test.ts`
Expected: FAIL — không tìm thấy module.

- [ ] **Step 3: Viết `src/lib/vietnamese.ts`**

```ts
/**
 * Bo dau tieng Viet. Dung NFD de tach dau ra khoi nguyen am roi xoa,
 * sau do xu ly rieng chu D gach ngang vi no khong phai dau to hop.
 *
 * Dai U+0300..U+036F PHAI viet bang escape \u, khong duoc dan ky tu to hop
 * thang vao source: chung vo hinh, de bi editor chuan hoa Unicode lam hong,
 * va toan bo tim kiem tieng Viet phu thuoc vao dong nay.
 */
export function boDau(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function chuanHoaTimKiem(s: string): string {
  return boDau(s).toLowerCase().replace(/\s+/g, " ").trim();
}

export function dungSearchText(p: { sku: string; name: string; description?: string }): string {
  return chuanHoaTimKiem([p.sku, p.name, p.description ?? ""].join(" "));
}
```

- [ ] **Step 4: Chạy test để xác nhận nó xanh**

Run: `npm test -- tests/lib/vietnamese.test.ts`
Expected: PASS — 8 test.

- [ ] **Step 5: Viết test tiền tệ và ngày tháng**

Tạo `tests/lib/money.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { dinhDangTien } from "@/lib/money";

describe("dinhDangTien", () => {
  it("dinh dang VND theo kieu Viet Nam", () => {
    expect(dinhDangTien(2500000, "VND")).toBe("2.500.000 ₫");
  });
  it("lam tron VND ve so nguyen", () => {
    expect(dinhDangTien(2500000.6, "VND")).toBe("2.500.001 ₫");
  });
  it("xu ly so khong", () => {
    expect(dinhDangTien(0, "VND")).toBe("0 ₫");
  });
  it("lam tron nua don vi ra xa so 0, ke ca so am", () => {
    expect(dinhDangTien(2500000.5, "VND")).toBe("2.500.001 ₫");
    expect(dinhDangTien(-2500000.5, "VND")).toBe("-2.500.001 ₫");
  });

  it("khong bao gio in ra so 0 am", () => {
    expect(dinhDangTien(-0.4, "VND")).toBe("0 ₫");
    expect(dinhDangTien(-0, "VND")).toBe("0 ₫");
  });

  it("dinh dang so am binh thuong", () => {
    expect(dinhDangTien(-500000, "VND")).toBe("-500.000 ₫");
  });

  it("dinh dang USD co hai chu so thap phan", () => {
    expect(dinhDangTien(1234.5, "USD")).toBe("$1,234.50");
  });
});
```

Tạo `tests/lib/date.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { dinhDangNgay } from "@/lib/date";

describe("dinhDangNgay", () => {
  it("dinh dang dd/mm/yyyy", () => {
    expect(dinhDangNgay(new Date(Date.UTC(2026, 7, 28, 12, 0)))).toBe("28/08/2026");
  });

  it("them so khong o dau cho ngay va thang mot chu so", () => {
    expect(dinhDangNgay(new Date(Date.UTC(2026, 0, 5, 12, 0)))).toBe("05/01/2026");
  });

  /**
   * Hai ca duoi day dat sat ranh gioi ngay theo UTC theo hai huong nguoc nhau,
   * nen neu ai do doi getUTC* thanh getter gio may thi it nhat MOT ca se hong
   * o bat ky mui gio lech 0 nao. Neu chi dung moc nua dem UTC, test van xanh
   * tren may UTC+7 (Viet Nam) du ham da hong.
   */
  it("dung gio UTC chu khong dung gio may — moc cuoi ngay", () => {
    expect(dinhDangNgay(new Date(Date.UTC(2026, 7, 28, 23, 30)))).toBe("28/08/2026");
  });

  it("dung gio UTC chu khong dung gio may — moc dau ngay", () => {
    expect(dinhDangNgay(new Date(Date.UTC(2026, 0, 5, 0, 30)))).toBe("05/01/2026");
  });
});
```

- [ ] **Step 6: Chạy test để xác nhận nó hỏng**

Run: `npm test -- tests/lib/money.test.ts tests/lib/date.test.ts`
Expected: FAIL — không tìm thấy module.

- [ ] **Step 7: Viết `src/lib/money.ts` và `src/lib/date.ts`**

`src/lib/money.ts`:

```ts
export type TienTe = "VND" | "USD";

const dinhDangVnd = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });
const dinhDangUsd = new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", minimumFractionDigits: 2,
});

/**
 * Lam tron nua don vi RA XA so 0 (quy uoc ke toan), khac voi Math.round von
 * luon lam tron ve phia +Infinity: Math.round(-0.5) cho -0, va Intl se in ra
 * chuoi "-0 ₫" tren ban bao gia gui khach.
 */
function lamTronTien(x: number): number {
  const n = Math.sign(x) * Math.round(Math.abs(x));
  return Object.is(n, -0) ? 0 : n;
}

export function dinhDangTien(soTien: number, tienTe: TienTe): string {
  if (tienTe === "VND") return `${dinhDangVnd.format(lamTronTien(soTien))} ₫`;
  return dinhDangUsd.format(soTien);
}
```

`src/lib/date.ts`:

```ts
/** Dinh dang dd/mm/yyyy theo gio UTC de ket qua on dinh giua cac may. */
export function dinhDangNgay(d: Date): string {
  const ngay = String(d.getUTCDate()).padStart(2, "0");
  const thang = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${ngay}/${thang}/${d.getUTCFullYear()}`;
}
```

- [ ] **Step 8: Chạy test để xác nhận nó xanh**

Run: `npm test`
Expected: PASS — toàn bộ test của Task 1–4.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: tien ich bo dau tieng Viet, dinh dang tien te va ngay thang"
```

---

## Task 5: Cây danh mục — logic đường dẫn

Phủ yêu cầu **B1**. Task này chỉ viết hàm thuần, chưa chạm cơ sở dữ liệu, nên test chạy tức thì.

**Files:**
- Create: `src/modules/catalog/category-path.ts`
- Test: `tests/modules/catalog/category-path.test.ts`

**Interfaces:**
- Consumes: —
- Produces:
  - `dungPath(pathCha: string | null, id: string): string` — sinh đường dẫn cho một nút
  - `laToTien(path: string): string[]` — trả danh sách id tổ tiên, không gồm chính nó
  - `laConCua(path: string, pathCha: string): boolean`
  - `doiPathKhiChuyenNhanh(pathCu: string, pathGocCu: string, pathGocMoi: string): string` — dùng khi kéo thả một nhánh sang chỗ khác
  - `taoVongLap(pathDich: string, idNutDangDi: string): boolean` — chặn kéo một nút vào chính nó hoặc vào con cháu của nó. **Tham số 1 là path của đích đến, tham số 2 là id của nút đang di chuyển** — gọi ngược thứ tự sẽ không chặn được gì

- [ ] **Step 1: Viết test**

Tạo `tests/modules/catalog/category-path.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  dungPath, laToTien, laConCua, doiPathKhiChuyenNhanh, taoVongLap,
} from "@/modules/catalog/category-path";

describe("dungPath", () => {
  it("nut goc co path chi gom chinh no", () => {
    expect(dungPath(null, "a")).toBe("/a/");
  });
  it("nut con noi tiep path cua cha", () => {
    expect(dungPath("/a/", "b")).toBe("/a/b/");
  });
  it("nut chau noi tiep tiep", () => {
    expect(dungPath("/a/b/", "c")).toBe("/a/b/c/");
  });
});

describe("laToTien", () => {
  it("tra ve rong cho nut goc", () => {
    expect(laToTien("/a/")).toEqual([]);
  });
  it("tra ve to tien theo thu tu tu goc xuong", () => {
    expect(laToTien("/a/b/c/")).toEqual(["a", "b"]);
  });
});

describe("laConCua", () => {
  it("nhan dien con truc tiep", () => {
    expect(laConCua("/a/b/", "/a/")).toBe(true);
  });
  it("nhan dien chau", () => {
    expect(laConCua("/a/b/c/", "/a/")).toBe(true);
  });
  it("chinh no khong phai con cua chinh no", () => {
    expect(laConCua("/a/", "/a/")).toBe(false);
  });
  it("nhanh khac khong phai con", () => {
    expect(laConCua("/x/y/", "/a/")).toBe(false);
  });
});

describe("doiPathKhiChuyenNhanh", () => {
  it("doi tien to cho chinh nut duoc chuyen", () => {
    expect(doiPathKhiChuyenNhanh("/a/b/", "/a/b/", "/x/b/")).toBe("/x/b/");
  });
  it("doi tien to cho toan bo con chau", () => {
    expect(doiPathKhiChuyenNhanh("/a/b/c/d/", "/a/b/", "/x/b/")).toBe("/x/b/c/d/");
  });
});

describe("taoVongLap", () => {
  it("chan keo mot nut vao chinh no", () => {
    expect(taoVongLap("/a/b/", "b")).toBe(true);
  });
  it("chan keo mot nut vao con cua no", () => {
    expect(taoVongLap("/a/b/", "a")).toBe(true);
  });
  it("cho phep keo sang nhanh khac", () => {
    expect(taoVongLap("/a/b/", "z")).toBe(false);
  });

  it("ghim chieu goi: tham so 1 la path DICH, tham so 2 la id nut DANG DI CHUYEN", () => {
    // Cay: goc "g" co con "c".
    // Keo "g" xuong duoi "c" -> vong lap, phai chan.
    expect(taoVongLap("/g/c/", "g")).toBe(true);
    // Keo "c" len duoi "g" -> hop le, khong duoc chan.
    // Neu ai do goi nguoc thu tu thi ca hai dong tren se cho ket qua nguoc lai.
    expect(taoVongLap("/g/", "c")).toBe(false);
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận nó hỏng**

Run: `npm test -- tests/modules/catalog/category-path.test.ts`
Expected: FAIL — không tìm thấy module.

- [ ] **Step 3: Viết `src/modules/catalog/category-path.ts`**

```ts
/**
 * Duong dan cay danh muc luu dang "/id-goc/id-con/id-nay/".
 * Dinh dang nay cho phep loc toan bo nhanh con bang mot dieu kien LIKE '/a/%',
 * khong can truy van de quy.
 */

export function dungPath(pathCha: string | null, id: string): string {
  return pathCha === null ? `/${id}/` : `${pathCha}${id}/`;
}

export function laToTien(path: string): string[] {
  const phan = path.split("/").filter(Boolean);
  return phan.slice(0, -1);
}

export function laConCua(path: string, pathCha: string): boolean {
  return path.startsWith(pathCha) && path.length > pathCha.length;
}

export function doiPathKhiChuyenNhanh(
  pathCu: string,
  pathGocCu: string,
  pathGocMoi: string,
): string {
  return pathGocMoi + pathCu.slice(pathGocCu.length);
}

/**
 * Kiem tra viec chuyen mot nut vao mot vi tri dich co tao vong lap khong.
 *
 * CHIEU GOI RAT QUAN TRONG — RAT DE BI GOI NGUOC. Dung dung thu tu nay:
 *   taoVongLap(<path cua DICH DEN>, <id cua nut DANG DI CHUYEN>)
 *
 * Vong lap xay ra khi dich den chinh la nut do, hoac la CON CHAU cua no —
 * tuc id cua nut dang di chuyen xuat hien trong path cua dich den.
 *
 * Vi du cay a -> b:
 *   taoVongLap("/a/b/", "a") === true   // keo a xuong duoi con b cua no: vong lap
 *   taoVongLap("/a/", "b")   === false  // keo b len duoi cha a: hop le
 *
 * Goi nguoc thu tu se tra ve false cho dung truong hop vong lap that,
 * tuc la mo cong cho cay tu tach nhanh ma khong bao loi.
 */
export function taoVongLap(pathDich: string, idNutDangDi: string): boolean {
  return pathDich.split("/").filter(Boolean).includes(idNutDangDi);
}
```

- [ ] **Step 4: Chạy test để xác nhận nó xanh**

Run: `npm test -- tests/modules/catalog/category-path.test.ts`
Expected: PASS — 14 test.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: logic duong dan cay danh muc"
```

---

## Task 6: Danh mục — kho dữ liệu, nghiệp vụ và giao diện

Hoàn tất yêu cầu **B1**.

**Files:**
- Create: `src/modules/catalog/categories.repo.ts`, `src/modules/catalog/categories.service.ts`
- Create: `src/app/admin/categories/page.tsx`, `src/app/admin/categories/actions.ts`
- Test: `tests/modules/catalog/categories.service.test.ts`

**Interfaces:**
- Consumes: `db`, `Tx` (Task 2); `dungPath`, `doiPathKhiChuyenNhanh`, `taoVongLap`, `laConCua` (Task 5)
- Produces:
  - `type DanhMuc = { id: string; name: string; parentId: string | null; path: string; sortOrder: number }`
  - `layTatCa(tx?: Tx): Promise<DanhMuc[]>`
  - `taoDanhMuc(input: { name: string; parentId: string | null }, tx?: Tx): Promise<DanhMuc>`
  - `doiTen(id: string, name: string, tx?: Tx): Promise<void>`
  - `chuyenNhanh(id: string, parentIdMoi: string | null, tx?: Tx): Promise<void>` — ném `LoiVongLap` nếu tạo vòng lặp
  - `xoaDanhMuc(id: string, chuyenSanIdSanPham: string | null, tx?: Tx): Promise<void>` — chuyển sản phẩm bên trong sang danh mục khác (hoặc `null` = bỏ danh mục) rồi mới xoá cả nhánh
  - `dungCay(ds: DanhMuc[]): NutCay[]` — hàm thuần dựng cây từ danh sách phẳng
  - `type NutCay = DanhMuc & { con: NutCay[] }`
  - `class LoiVongLap extends Error`

- [ ] **Step 1: Viết test cho phần thuần và phần chạm CSDL**

Tạo `tests/modules/catalog/categories.service.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { withRollback } from "../../helpers/db";
import {
  dungCay, taoDanhMuc, chuyenNhanh, xoaDanhMuc, layTatCa, LoiVongLap,
} from "@/modules/catalog/categories.service";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("dungCay", () => {
  it("gom nut con vao dung cha va giu thu tu sortOrder", () => {
    const cay = dungCay([
      { id: "b", name: "Ghe", parentId: "a", path: "/a/b/", sortOrder: 1 },
      { id: "a", name: "Noi that", parentId: null, path: "/a/", sortOrder: 0 },
      { id: "c", name: "Ban", parentId: "a", path: "/a/c/", sortOrder: 0 },
    ]);
    expect(cay).toHaveLength(1);
    expect(cay[0].id).toBe("a");
    expect(cay[0].con.map((n) => n.id)).toEqual(["c", "b"]);
  });

  it("tra ve mang rong khi khong co danh muc", () => {
    expect(dungCay([])).toEqual([]);
  });
});

describe("nghiep vu danh muc", () => {
  it("tao nut goc va nut con voi path dung", async () => {
    await withRollback(async (tx) => {
      const goc = await taoDanhMuc({ name: "Nội thất", parentId: null }, tx);
      expect(goc.path).toBe(`/${goc.id}/`);
      const con = await taoDanhMuc({ name: "Ghế", parentId: goc.id }, tx);
      expect(con.path).toBe(`/${goc.id}/${con.id}/`);
    });
  });

  it("chuyen nhanh cap nhat path cua toan bo con chau", async () => {
    await withRollback(async (tx) => {
      const a = await taoDanhMuc({ name: "A", parentId: null }, tx);
      const b = await taoDanhMuc({ name: "B", parentId: a.id }, tx);
      const c = await taoDanhMuc({ name: "C", parentId: b.id }, tx);
      const x = await taoDanhMuc({ name: "X", parentId: null }, tx);

      await chuyenNhanh(b.id, x.id, tx);

      const ds = await layTatCa(tx);
      const tim = (id: string) => ds.find((d) => d.id === id)!;
      expect(tim(b.id).path).toBe(`/${x.id}/${b.id}/`);
      expect(tim(c.id).path).toBe(`/${x.id}/${b.id}/${c.id}/`);
    });
  });

  it("chan chuyen mot nut vao chinh con cua no", async () => {
    await withRollback(async (tx) => {
      const a = await taoDanhMuc({ name: "A", parentId: null }, tx);
      const b = await taoDanhMuc({ name: "B", parentId: a.id }, tx);
      await expect(chuyenNhanh(a.id, b.id, tx)).rejects.toThrow(LoiVongLap);
    });
  });

  it("chan chuyen mot nut vao chinh no", async () => {
    await withRollback(async (tx) => {
      const a = await taoDanhMuc({ name: "A", parentId: null }, tx);
      await expect(chuyenNhanh(a.id, a.id, tx)).rejects.toThrow(LoiVongLap);
    });
  });

  it("chan chuyen vao chau (khong chi con truc tiep)", async () => {
    await withRollback(async (tx) => {
      const a = await taoDanhMuc({ name: "A", parentId: null }, tx);
      const b = await taoDanhMuc({ name: "B", parentId: a.id }, tx);
      const c = await taoDanhMuc({ name: "C", parentId: b.id }, tx);
      await expect(chuyenNhanh(a.id, c.id, tx)).rejects.toThrow(LoiVongLap);
    });
  });

  it("cho phep chuyen len lam nut goc", async () => {
    await withRollback(async (tx) => {
      const a = await taoDanhMuc({ name: "A", parentId: null }, tx);
      const b = await taoDanhMuc({ name: "B", parentId: a.id }, tx);
      await chuyenNhanh(b.id, null, tx);
      const ds = await layTatCa(tx);
      expect(ds.find((d) => d.id === b.id)!.path).toBe(`/${b.id}/`);
    });
  });

  it("xoa danh muc thi chuyen san pham sang danh muc chi dinh", async () => {
    await withRollback(async (tx) => {
      const cu = await taoDanhMuc({ name: "Cũ", parentId: null }, tx);
      const moi = await taoDanhMuc({ name: "Mới", parentId: null }, tx);
      const [sp] = await tx.insert(products)
        .values({ sku: "SP100", name: "Ghế", searchText: "sp100 ghe", categoryId: cu.id })
        .returning();

      await xoaDanhMuc(cu.id, moi.id, tx);

      const [sau] = await tx.select().from(products).where(eq(products.id, sp.id));
      expect(sau.categoryId).toBe(moi.id);
      expect((await layTatCa(tx)).map((d) => d.id)).not.toContain(cu.id);
    });
  });

  it("xoa ca nhanh con khi xoa danh muc cha", async () => {
    await withRollback(async (tx) => {
      const a = await taoDanhMuc({ name: "A", parentId: null }, tx);
      const b = await taoDanhMuc({ name: "B", parentId: a.id }, tx);
      await xoaDanhMuc(a.id, null, tx);
      const con_lai = (await layTatCa(tx)).map((d) => d.id);
      expect(con_lai).not.toContain(a.id);
      expect(con_lai).not.toContain(b.id);
    });
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận nó hỏng**

Run: `npm test -- tests/modules/catalog/categories.service.test.ts`
Expected: FAIL — không tìm thấy `@/modules/catalog/categories.service`

- [ ] **Step 3: Viết `src/modules/catalog/categories.repo.ts`**

```ts
import { eq, like, asc } from "drizzle-orm";
import { db, type Tx } from "@/db/client";
import { categories, products } from "@/db/schema";

export type DanhMuc = {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  sortOrder: number;
};

type Handle = Tx | typeof db;
const h = (tx?: Tx): Handle => tx ?? db;

export async function layTatCa(tx?: Tx): Promise<DanhMuc[]> {
  return h(tx).select({
    id: categories.id, name: categories.name, parentId: categories.parentId,
    path: categories.path, sortOrder: categories.sortOrder,
  }).from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function layTheoId(id: string, tx?: Tx): Promise<DanhMuc | null> {
  const [r] = await h(tx).select({
    id: categories.id, name: categories.name, parentId: categories.parentId,
    path: categories.path, sortOrder: categories.sortOrder,
  }).from(categories).where(eq(categories.id, id)).limit(1);
  return r ?? null;
}

export async function chen(
  gt: { id: string; name: string; parentId: string | null; path: string },
  tx?: Tx,
): Promise<DanhMuc> {
  const [r] = await h(tx).insert(categories).values(gt).returning({
    id: categories.id, name: categories.name, parentId: categories.parentId,
    path: categories.path, sortOrder: categories.sortOrder,
  });
  return r;
}

export async function capNhat(
  id: string,
  gt: Partial<{ name: string; parentId: string | null; path: string; sortOrder: number }>,
  tx?: Tx,
): Promise<void> {
  await h(tx).update(categories).set(gt).where(eq(categories.id, id));
}

/** Lay chinh nut va toan bo con chau — dua vao tien to path. */
export async function layCaNhanh(path: string, tx?: Tx): Promise<DanhMuc[]> {
  return h(tx).select({
    id: categories.id, name: categories.name, parentId: categories.parentId,
    path: categories.path, sortOrder: categories.sortOrder,
  }).from(categories).where(like(categories.path, `${path}%`));
}

export async function xoaNhieu(ids: string[], tx?: Tx): Promise<void> {
  if (ids.length === 0) return;
  for (const id of ids) {
    await h(tx).delete(categories).where(eq(categories.id, id));
  }
}

export async function chuyenSanPhamSangDanhMuc(
  idsDanhMucCu: string[],
  idMoi: string | null,
  tx?: Tx,
): Promise<void> {
  for (const cu of idsDanhMucCu) {
    await h(tx).update(products).set({ categoryId: idMoi }).where(eq(products.categoryId, cu));
  }
}
```

- [ ] **Step 4: Viết `src/modules/catalog/categories.service.ts`**

```ts
import { randomUUID } from "node:crypto";
import type { Tx } from "@/db/client";
import { dungPath, doiPathKhiChuyenNhanh, taoVongLap } from "./category-path";
import * as repo from "./categories.repo";
import type { DanhMuc } from "./categories.repo";

export type { DanhMuc };
export const layTatCa = repo.layTatCa;

export class LoiVongLap extends Error {
  constructor() {
    super("Không thể chuyển một danh mục vào chính nó hoặc vào nhánh con của nó.");
    this.name = "LoiVongLap";
  }
}

export type NutCay = DanhMuc & { con: NutCay[] };

/**
 * Ham thuan — dung cay tu danh sach phang.
 *
 * Tu sap xep theo sortOrder thay vi tin vao thu tu cua dau vao, de nguoi goi
 * khong the dung sai. Array.sort on dinh nen cac nut cung sortOrder van giu
 * thu tu phu (theo ten) ma layTatCa da sap tu truy van SQL.
 */
export function dungCay(ds: DanhMuc[]): NutCay[] {
  const daySapXep = [...ds].sort((a, b) => a.sortOrder - b.sortOrder);
  const bang = new Map<string, NutCay>();
  for (const d of daySapXep) bang.set(d.id, { ...d, con: [] });
  const goc: NutCay[] = [];
  for (const d of daySapXep) {
    const nut = bang.get(d.id)!;
    const cha = d.parentId ? bang.get(d.parentId) : undefined;
    if (cha) cha.con.push(nut);
    else goc.push(nut);
  }
  return goc;
}

export async function taoDanhMuc(
  input: { name: string; parentId: string | null },
  tx?: Tx,
): Promise<DanhMuc> {
  const id = randomUUID();
  let pathCha: string | null = null;
  if (input.parentId !== null) {
    const cha = await repo.layTheoId(input.parentId, tx);
    if (!cha) throw new Error(`Không tìm thấy danh mục cha ${input.parentId}`);
    pathCha = cha.path;
  }
  // Sinh id o day de tinh path trong cung mot lan ghi — khong chen roi sua lai.
  return repo.chen({
    id,
    name: input.name,
    parentId: input.parentId,
    path: dungPath(pathCha, id),
  }, tx);
}

export async function doiTen(id: string, name: string, tx?: Tx): Promise<void> {
  await repo.capNhat(id, { name }, tx);
}

export async function chuyenNhanh(
  id: string,
  parentIdMoi: string | null,
  tx?: Tx,
): Promise<void> {
  const nut = await repo.layTheoId(id, tx);
  if (!nut) throw new Error(`Không tìm thấy danh mục ${id}`);

  let pathChaMoi: string | null = null;
  if (parentIdMoi !== null) {
    const cha = await repo.layTheoId(parentIdMoi, tx);
    if (!cha) throw new Error(`Không tìm thấy danh mục cha ${parentIdMoi}`);
    // Chieu goi bat buoc: (path cua DICH DEN, id cua nut DANG DI CHUYEN).
    // Goi nguoc lai se tra ve false dung o truong hop vong lap that.
    // Truong hop keo nut vao chinh no cung da nam trong phep kiem tra nay,
    // vi khi do cha.path chinh la nut.path va da chua id.
    if (taoVongLap(cha.path, id)) throw new LoiVongLap();
    pathChaMoi = cha.path;
  }

  const pathGocMoi = dungPath(pathChaMoi, id);
  const nhanh = await repo.layCaNhanh(nut.path, tx);
  for (const n of nhanh) {
    await repo.capNhat(n.id, { path: doiPathKhiChuyenNhanh(n.path, nut.path, pathGocMoi) }, tx);
  }
  await repo.capNhat(id, { parentId: parentIdMoi }, tx);
}

export async function xoaDanhMuc(
  id: string,
  chuyenSanIdSanPham: string | null,
  tx?: Tx,
): Promise<void> {
  const nut = await repo.layTheoId(id, tx);
  if (!nut) return;
  const nhanh = await repo.layCaNhanh(nut.path, tx);
  const ids = nhanh.map((n) => n.id);
  await repo.chuyenSanPhamSangDanhMuc(ids, chuyenSanIdSanPham, tx);
  // Xoa tu la len goc de khong vi pham rang buoc parent_id.
  const theoDoSau = [...nhanh].sort((a, b) => b.path.length - a.path.length);
  await repo.xoaNhieu(theoDoSau.map((n) => n.id), tx);
}
```

- [ ] **Step 5: Chạy test để xác nhận nó xanh**

Run: `npm test -- tests/modules/catalog/categories.service.test.ts`
Expected: PASS — 7 test.

- [ ] **Step 6: Viết server action `src/app/admin/categories/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/auth/guard";
import { db } from "@/db/client";
import * as service from "@/modules/catalog/categories.service";

export async function themDanhMuc(form: FormData): Promise<void> {
  await requireAdmin();
  const name = String(form.get("name") ?? "").trim();
  if (!name) return;
  const parentId = String(form.get("parent_id") ?? "") || null;
  await service.taoDanhMuc({ name, parentId });
  revalidatePath("/admin/categories");
}

export async function doiTenDanhMuc(form: FormData): Promise<void> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (!id) return;
  const name = String(form.get("name") ?? "").trim();
  if (!name) return;
  await service.doiTen(id, name);
  revalidatePath("/admin/categories");
}

export async function xoaDanhMuc(form: FormData): Promise<void> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (!id) return;
  const chuyen = String(form.get("chuyen_san") ?? "") || null;
  // Xoa mot nhanh gom NHIEU lenh ghi: chuyen san pham di, roi xoa tung danh muc.
  // Phai boc trong mot giao dich — neu khong, mot lenh hong giua chung se de lai
  // trang thai nua voi: san pham da bi chuyen di trong khi danh muc van con.
  await db.transaction(async (tx) => {
    await service.xoaDanhMuc(id, chuyen, tx);
  });
  revalidatePath("/admin/categories");
}
```

- [ ] **Step 7: Viết trang `src/app/admin/categories/page.tsx`**

```tsx
import { requireUser } from "@/auth/guard";
import { layTatCa, dungCay, type NutCay } from "@/modules/catalog/categories.service";
import { themDanhMuc, doiTenDanhMuc, xoaDanhMuc } from "./actions";
import { vi } from "@/messages/vi";

function Nhanh({ nut, mucLui }: { nut: NutCay; mucLui: number }) {
  return (
    <>
      <li style={{ paddingLeft: `${mucLui * 20}px` }} className="flex items-center gap-2 py-1">
        <span className="flex-1 text-sm">{nut.name}</span>
        <form action={doiTenDanhMuc} className="flex gap-1">
          <input type="hidden" name="id" value={nut.id} />
          <input name="name" defaultValue={nut.name}
                 className="w-40 rounded border px-2 py-0.5 text-xs" />
          <button className="text-xs text-teal-800 hover:underline">{vi.chung.luu}</button>
        </form>
        <form action={xoaDanhMuc}>
          <input type="hidden" name="id" value={nut.id} />
          <button className="text-xs text-red-700 hover:underline">{vi.chung.xoa}</button>
        </form>
      </li>
      {nut.con.map((c) => <Nhanh key={c.id} nut={c} mucLui={mucLui + 1} />)}
    </>
  );
}

export default async function TrangDanhMuc() {
  const user = await requireUser();
  // Lay mot lan roi dung cho ca cay lan o chon danh muc cha.
  const phang = await layTatCa();
  const cay = dungCay(phang);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-bold">{vi.dieu_huong.danh_muc}</h1>

      {cay.length === 0
        ? <p className="text-sm text-neutral-500">{vi.chung.khong_co_du_lieu}</p>
        : <ul className="mb-8 divide-y">{cay.map((n) => <Nhanh key={n.id} nut={n} mucLui={0} />)}</ul>}

      {user.role === "admin" && (
        <form action={themDanhMuc} className="flex gap-2">
          <input name="name" placeholder={vi.danh_muc.ten_moi_placeholder} required
                 className="flex-1 rounded border px-3 py-2 text-sm" />
          <select name="parent_id" className="rounded border px-3 py-2 text-sm">
            <option value="">{vi.danh_muc.danh_muc_goc}</option>
            {phang.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button className="rounded bg-teal-800 px-4 py-2 text-sm text-white">
            {vi.chung.them}
          </button>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Kiểm tra bằng tay**

`npm run dev` → mở `/admin/categories`. Thêm `Nội thất`, rồi thêm `Ghế` với danh mục cha là `Nội thất`. Kỳ vọng: `Ghế` hiện thụt vào một cấp dưới `Nội thất`. Đổi tên và xoá đều có tác dụng ngay.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: quan ly cay danh muc nhieu cap"
```

---

## Task 7: Xử lý ảnh

Phủ yêu cầu **A5**.

**Files:**
- Create: `src/modules/media/image-processor.ts`
- Test: `tests/modules/media/image-processor.test.ts`

**Interfaces:**
- Consumes: —
- Produces:
  - `const BIEN_THE = [{ ten: "thumb", canhDai: 400 }, { ten: "medium", canhDai: 1200 }, { ten: "large", canhDai: 2000 }] as const`
  - `type TenBienThe = "thumb" | "medium" | "large"`
  - `type AnhDaXuLy = { width: number; height: number; bytes: number; contentHash: string; bienThe: Record<TenBienThe, Buffer> }`
  - `xuLyAnh(gocBuffer: Buffer): Promise<AnhDaXuLy>`
  - `tinhKichThuocMoi(w: number, h: number, canhDai: number): { width: number; height: number }` — hàm thuần
  - `class LoiAnhKhongHopLe extends Error`

- [ ] **Step 1: Viết test**

Tạo `tests/modules/media/image-processor.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import sharp from "sharp";
import {
  xuLyAnh, tinhKichThuocMoi, LoiAnhKhongHopLe, BIEN_THE,
} from "@/modules/media/image-processor";

async function anhMau(w: number, h: number): Promise<Buffer> {
  return sharp({
    create: { width: w, height: h, channels: 3, background: { r: 200, g: 30, b: 30 } },
  }).jpeg().toBuffer();
}

describe("tinhKichThuocMoi", () => {
  it("thu nho theo chieu rong khi anh nam ngang", () => {
    expect(tinhKichThuocMoi(2000, 1000, 400)).toEqual({ width: 400, height: 200 });
  });
  it("thu nho theo chieu cao khi anh nam doc", () => {
    expect(tinhKichThuocMoi(1000, 2000, 400)).toEqual({ width: 200, height: 400 });
  });
  it("khong phong to anh nho hon nguong", () => {
    expect(tinhKichThuocMoi(300, 200, 400)).toEqual({ width: 300, height: 200 });
  });
  it("lam tron ve so nguyen", () => {
    expect(tinhKichThuocMoi(1000, 333, 400)).toEqual({ width: 400, height: 133 });
  });
});

describe("xuLyAnh", () => {
  it("sinh du ba bien the", async () => {
    const kq = await xuLyAnh(await anhMau(3000, 2000));
    expect(Object.keys(kq.bienThe).sort()).toEqual(["large", "medium", "thumb"]);
  });

  it("moi bien the dung canh dai quy dinh va giu ti le", async () => {
    const kq = await xuLyAnh(await anhMau(3000, 2000));
    for (const { ten, canhDai } of BIEN_THE) {
      const meta = await sharp(kq.bienThe[ten]).metadata();
      expect(meta.width).toBe(canhDai);
      expect(meta.height).toBe(Math.round((canhDai * 2000) / 3000));
    }
  });

  it("xuat WebP", async () => {
    const kq = await xuLyAnh(await anhMau(800, 600));
    const meta = await sharp(kq.bienThe.thumb).metadata();
    expect(meta.format).toBe("webp");
  });

  it("ghi lai kich thuoc that cua anh goc", async () => {
    const kq = await xuLyAnh(await anhMau(1234, 567));
    expect(kq.width).toBe(1234);
    expect(kq.height).toBe(567);
  });

  it("ma bam on dinh voi cung mot anh", async () => {
    const goc = await anhMau(500, 500);
    const a = await xuLyAnh(goc);
    const b = await xuLyAnh(goc);
    expect(a.contentHash).toBe(b.contentHash);
    expect(a.contentHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("ma bam khac nhau voi hai anh khac nhau", async () => {
    const a = await xuLyAnh(await anhMau(500, 500));
    const b = await xuLyAnh(await anhMau(500, 501));
    expect(a.contentHash).not.toBe(b.contentHash);
  });

  it("xoa sach EXIF khoi bien the", async () => {
    const co_exif = await sharp({
      create: { width: 800, height: 600, channels: 3, background: { r: 0, g: 0, b: 0 } },
    }).withMetadata({ exif: { IFD0: { Copyright: "ABC" } } }).jpeg().toBuffer();
    const kq = await xuLyAnh(co_exif);
    const meta = await sharp(kq.bienThe.large).metadata();
    expect(meta.exif).toBeUndefined();
  });

  it("nem loi ro rang khi du lieu khong phai anh", async () => {
    await expect(xuLyAnh(Buffer.from("day khong phai anh"))).rejects.toThrow(LoiAnhKhongHopLe);
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận nó hỏng**

Run: `npm test -- tests/modules/media/image-processor.test.ts`
Expected: FAIL — không tìm thấy module.

- [ ] **Step 3: Viết `src/modules/media/image-processor.ts`**

```ts
import { createHash } from "node:crypto";
import sharp from "sharp";

export const BIEN_THE = [
  { ten: "thumb", canhDai: 400 },
  { ten: "medium", canhDai: 1200 },
  { ten: "large", canhDai: 2000 },
] as const;

export type TenBienThe = (typeof BIEN_THE)[number]["ten"];

export type AnhDaXuLy = {
  width: number;
  height: number;
  bytes: number;
  contentHash: string;
  bienThe: Record<TenBienThe, Buffer>;
};

export class LoiAnhKhongHopLe extends Error {
  constructor(chi_tiet: string) {
    super(`Tệp không phải là ảnh hợp lệ: ${chi_tiet}`);
    this.name = "LoiAnhKhongHopLe";
  }
}

/** Ham thuan — thu nho theo canh dai nhat, khong bao gio phong to. */
export function tinhKichThuocMoi(
  w: number, h: number, canhDai: number,
): { width: number; height: number } {
  const lon_nhat = Math.max(w, h);
  if (lon_nhat <= canhDai) return { width: w, height: h };
  const ti_le = canhDai / lon_nhat;
  return { width: Math.round(w * ti_le), height: Math.round(h * ti_le) };
}

export async function xuLyAnh(gocBuffer: Buffer): Promise<AnhDaXuLy> {
  let meta: sharp.Metadata;
  try {
    meta = await sharp(gocBuffer).metadata();
  } catch (e) {
    throw new LoiAnhKhongHopLe(e instanceof Error ? e.message : String(e));
  }
  if (!meta.width || !meta.height) {
    throw new LoiAnhKhongHopLe("không đọc được kích thước");
  }

  const bienThe = {} as Record<TenBienThe, Buffer>;
  for (const { ten, canhDai } of BIEN_THE) {
    const kt = tinhKichThuocMoi(meta.width, meta.height, canhDai);
    // Chi truyen MOT chieu rang buoc, de sharp tu suy ra chieu con lai.
    // Truyen ca hai chieu kem fit:"inside" lam sharp lam tron HAI LAN roi lech 1px:
    // hop 2000x1333 co ti le 1.50038 khac ti le that 1.5, nen anh 3000x2000
    // cho ra 1999x1333 thay vi 2000x1333.
    const rangBuoc = meta.width >= meta.height ? { width: kt.width } : { height: kt.height };
    // Khong goi withMetadata() — sharp mac dinh bo toan bo EXIF, dung yeu cau PRD A5.
    bienThe[ten] = await sharp(gocBuffer)
      .rotate()
      .resize({ ...rangBuoc, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  }

  return {
    width: meta.width,
    height: meta.height,
    bytes: gocBuffer.byteLength,
    contentHash: createHash("sha256").update(gocBuffer).digest("hex"),
    bienThe,
  };
}
```

- [ ] **Step 4: Chạy test để xác nhận nó xanh**

Run: `npm test -- tests/modules/media/image-processor.test.ts`
Expected: PASS — 12 test.

Ghi chú: `.rotate()` không tham số áp dụng hướng xoay ghi trong EXIF rồi bỏ thẻ đó đi — cần thiết vì ảnh chụp bằng điện thoại thường nằm ngang nếu không xử lý.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: xu ly anh — ba bien the WebP, xoa EXIF, ma bam noi dung"
```

---

## Task 8: Lưu trữ ảnh trên Supabase Storage

Phủ phần lưu trữ của **A1** và cơ chế URL có ký ở PRD §8.3.

**Files:**
- Create: `src/modules/media/storage.ts`
- Test: `tests/modules/media/storage.test.ts`

**Interfaces:**
- Consumes: `getEnv()` (Task 1); `TenBienThe` (Task 7)
- Produces:
  - `dungKhoa(productId: string, imageId: string, bienThe: TenBienThe | "goc", duoi: string): string` — hàm thuần sinh khoá lưu trữ
  - `ghiTep(khoa: string, noiDung: Buffer, contentType: string): Promise<void>`
  - `xoaTep(khoa: string[]): Promise<void>`
  - `layUrlCoKy(khoa: string, hanGiay?: number): Promise<string>` — mặc định 3600 giây

- [ ] **Step 1: Viết test**

Tạo `tests/modules/media/storage.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { dungKhoa, ghiTep, xoaTep, layUrlCoKy } from "@/modules/media/storage";

describe("dungKhoa", () => {
  it("gom theo san pham roi den anh va bien the", () => {
    expect(dungKhoa("p1", "i1", "thumb", "webp")).toBe("products/p1/i1/thumb.webp");
  });
  it("dat ban goc canh cac bien the", () => {
    expect(dungKhoa("p1", "i1", "goc", "jpg")).toBe("products/p1/i1/goc.jpg");
  });
});

describe("Supabase Storage", () => {
  it("ghi, ky URL roi xoa duoc mot tep", async () => {
    const khoa = `test/${randomUUID()}.txt`;
    await ghiTep(khoa, Buffer.from("xin chao"), "text/plain");

    const url = await layUrlCoKy(khoa, 60);
    expect(url).toContain(khoa);

    const res = await fetch(url);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("xin chao");

    await xoaTep([khoa]);
    const sau = await fetch(await layUrlCoKy(khoa, 60).catch(() => url));
    expect(sau.status).not.toBe(200);
  }, 30_000);
});
```

- [ ] **Step 2: Chạy test để xác nhận nó hỏng**

Run: `npm test -- tests/modules/media/storage.test.ts`
Expected: FAIL — không tìm thấy module.

- [ ] **Step 3: Viết `src/modules/media/storage.ts`**

```ts
import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";
import type { TenBienThe } from "./image-processor";

const env = getEnv();

/** Dung khoa secret vi moi thao tac deu chay o phia may chu. */
const kho = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
}).storage.from(env.SUPABASE_STORAGE_BUCKET);

export function dungKhoa(
  productId: string,
  imageId: string,
  bienThe: TenBienThe | "goc",
  duoi: string,
): string {
  return `products/${productId}/${imageId}/${bienThe}.${duoi}`;
}

export async function ghiTep(khoa: string, noiDung: Buffer, contentType: string): Promise<void> {
  const { error } = await kho.upload(khoa, noiDung, { contentType, upsert: true });
  if (error) throw new Error(`Không ghi được tệp ${khoa}: ${error.message}`);
}

export async function xoaTep(khoa: string[]): Promise<void> {
  if (khoa.length === 0) return;
  const { error } = await kho.remove(khoa);
  if (error) throw new Error(`Không xoá được tệp: ${error.message}`);
}

export async function layUrlCoKy(khoa: string, hanGiay = 3600): Promise<string> {
  const { data, error } = await kho.createSignedUrl(khoa, hanGiay);
  if (error || !data) throw new Error(`Không ký được URL cho ${khoa}: ${error?.message}`);
  return data.signedUrl;
}
```

- [ ] **Step 4: Chạy test để xác nhận nó xanh**

Run: `npm test -- tests/modules/media/storage.test.ts`
Expected: PASS — 3 test. Test này gọi ra Supabase thật nên mất vài giây.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: lop luu tru anh tren Supabase Storage voi URL co ky"
```

---

## Task 9: Sản phẩm — điều kiện tìm kiếm, kho dữ liệu và nghiệp vụ

Phủ yêu cầu **B2** và **B4**.

**Files:**
- Create: `src/modules/catalog/search-query.ts`, `src/modules/catalog/products.repo.ts`, `src/modules/catalog/products.service.ts`
- Test: `tests/modules/catalog/search-query.test.ts`, `tests/modules/catalog/products.service.test.ts`

**Interfaces:**
- Consumes: `db`, `Tx` (Task 2); `chuanHoaTimKiem`, `dungSearchText` (Task 4); `DanhMuc` (Task 6)
- Produces:
  - `type BoLoc = { tuKhoa?: string; categoryPath?: string; giaTu?: number; giaDen?: number; trangThai?: "active" | "discontinued" | "draft"; coAnh?: boolean }`
  - `type ThamSoTrang = { trang: number; moiTrang: number }`
  - `docBoLocTuUrl(sp: Record<string, string | undefined>): BoLoc` — hàm thuần, đọc `searchParams`
  - `type SanPham = { id: string; sku: string; name: string; description: string; listPrice: string | null; currency: string; categoryId: string | null; attributes: Record<string, unknown>; status: string; anhDaiDien: string | null }`
  - `timSanPham(loc: BoLoc, trang: ThamSoTrang, tx?: Tx): Promise<{ ds: SanPham[]; tong: number }>`
  - `taoSanPham(input: TaoSanPhamInput, tx?: Tx): Promise<SanPham>`
  - `capNhatSanPham(id: string, input: Partial<TaoSanPhamInput>, tx?: Tx): Promise<void>` — tự tính lại `searchText`
  - `capNhatHangLoat(ids: string[], input: Partial<TaoSanPhamInput>, tx?: Tx): Promise<number>`
  - `type TaoSanPhamInput = { sku: string; name: string; description?: string; listPrice?: number | null; currency?: string; categoryId?: string | null; attributes?: Record<string, unknown>; status?: "active" | "discontinued" | "draft"; createdBy?: string | null }`
  - `class LoiSkuTrung extends Error`

- [ ] **Step 1: Viết test cho phần đọc bộ lọc**

Tạo `tests/modules/catalog/search-query.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { docBoLocTuUrl } from "@/modules/catalog/search-query";

describe("docBoLocTuUrl", () => {
  it("tra ve bo loc rong khi khong co tham so", () => {
    expect(docBoLocTuUrl({})).toEqual({});
  });

  it("chuan hoa tu khoa ve dang khong dau chu thuong", () => {
    expect(docBoLocTuUrl({ q: "  Ghế Gỗ  " }).tuKhoa).toBe("ghe go");
  });

  it("bo qua tu khoa chi gom khoang trang", () => {
    expect(docBoLocTuUrl({ q: "   " }).tuKhoa).toBeUndefined();
  });

  it("doc khoang gia thanh so", () => {
    expect(docBoLocTuUrl({ gia_tu: "1000", gia_den: "5000" }))
      .toMatchObject({ giaTu: 1000, giaDen: 5000 });
  });

  it("bo qua khoang gia khong phai so", () => {
    expect(docBoLocTuUrl({ gia_tu: "abc" }).giaTu).toBeUndefined();
  });

  it("chi nhan trang thai hop le", () => {
    expect(docBoLocTuUrl({ trang_thai: "active" }).trangThai).toBe("active");
    expect(docBoLocTuUrl({ trang_thai: "linh tinh" }).trangThai).toBeUndefined();
  });

  it("doc co_anh dang chuoi ve boolean", () => {
    expect(docBoLocTuUrl({ co_anh: "1" }).coAnh).toBe(true);
    expect(docBoLocTuUrl({ co_anh: "0" }).coAnh).toBe(false);
    expect(docBoLocTuUrl({}).coAnh).toBeUndefined();
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận nó hỏng**

Run: `npm test -- tests/modules/catalog/search-query.test.ts`
Expected: FAIL — không tìm thấy module.

- [ ] **Step 3: Viết `src/modules/catalog/search-query.ts`**

```ts
import { chuanHoaTimKiem } from "@/lib/vietnamese";

export type TrangThaiSanPham = "active" | "discontinued" | "draft";

export type BoLoc = {
  tuKhoa?: string;
  categoryPath?: string;
  giaTu?: number;
  giaDen?: number;
  trangThai?: TrangThaiSanPham;
  coAnh?: boolean;
};

export type ThamSoTrang = { trang: number; moiTrang: number };

const TRANG_THAI_HOP_LE: TrangThaiSanPham[] = ["active", "discontinued", "draft"];

function docSo(v: string | undefined): number | undefined {
  if (v === undefined || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Ham thuan — bien searchParams cua Next.js thanh bo loc da kiem tra. */
export function docBoLocTuUrl(sp: Record<string, string | undefined>): BoLoc {
  const loc: BoLoc = {};

  const q = sp.q ? chuanHoaTimKiem(sp.q) : "";
  if (q) loc.tuKhoa = q;

  if (sp.danh_muc_path) loc.categoryPath = sp.danh_muc_path;

  const tu = docSo(sp.gia_tu);
  if (tu !== undefined) loc.giaTu = tu;
  const den = docSo(sp.gia_den);
  if (den !== undefined) loc.giaDen = den;

  if (sp.trang_thai && TRANG_THAI_HOP_LE.includes(sp.trang_thai as TrangThaiSanPham)) {
    loc.trangThai = sp.trang_thai as TrangThaiSanPham;
  }

  if (sp.co_anh === "1") loc.coAnh = true;
  else if (sp.co_anh === "0") loc.coAnh = false;

  return loc;
}

export function docThamSoTrang(sp: Record<string, string | undefined>): ThamSoTrang {
  const trang = Math.max(1, Math.trunc(docSo(sp.trang) ?? 1));
  return { trang, moiTrang: 48 };
}
```

- [ ] **Step 4: Chạy test để xác nhận nó xanh**

Run: `npm test -- tests/modules/catalog/search-query.test.ts`
Expected: PASS — 7 test.

- [ ] **Step 5: Viết test nghiệp vụ sản phẩm**

Tạo `tests/modules/catalog/products.service.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { withRollback } from "../../helpers/db";
import {
  taoSanPham, capNhatSanPham, capNhatHangLoat, timSanPham, LoiSkuTrung,
} from "@/modules/catalog/products.service";
import { taoDanhMuc } from "@/modules/catalog/categories.service";
import { products, productImages } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("nghiep vu san pham", () => {
  it("tao san pham va tu sinh searchText khong dau", async () => {
    await withRollback(async (tx) => {
      const sp = await taoSanPham({ sku: "SP001", name: "Ghế gỗ sồi", description: "Chân Đen" }, tx);
      const [r] = await tx.select().from(products).where(eq(products.id, sp.id));
      expect(r.searchText).toBe("sp001 ghe go soi chan den");
    });
  });

  it("chan sku trung bang loi ro rang", async () => {
    await withRollback(async (tx) => {
      await taoSanPham({ sku: "SP002", name: "Bàn" }, tx);
      await expect(taoSanPham({ sku: "SP002", name: "Bàn khác" }, tx)).rejects.toThrow(LoiSkuTrung);
    });
  });

  it("tinh lai searchText khi doi ten", async () => {
    await withRollback(async (tx) => {
      const sp = await taoSanPham({ sku: "SP003", name: "Bàn trà" }, tx);
      await capNhatSanPham(sp.id, { name: "Tủ quần áo" }, tx);
      const [r] = await tx.select().from(products).where(eq(products.id, sp.id));
      expect(r.searchText).toBe("sp003 tu quan ao");
    });
  });

  it("tim duoc bang tu khoa khong dau", async () => {
    await withRollback(async (tx) => {
      await taoSanPham({ sku: "SP010", name: "Ghế gỗ sồi" }, tx);
      await taoSanPham({ sku: "SP011", name: "Đèn đứng" }, tx);
      const kq = await timSanPham({ tuKhoa: "ghe go soi" }, { trang: 1, moiTrang: 20 }, tx);
      expect(kq.ds.map((s) => s.sku)).toEqual(["SP010"]);
      expect(kq.tong).toBe(1);
    });
  });

  it("tim duoc bang tu khoa co dau", async () => {
    await withRollback(async (tx) => {
      await taoSanPham({ sku: "SP012", name: "Đèn đứng" }, tx);
      const kq = await timSanPham({ tuKhoa: "den dung" }, { trang: 1, moiTrang: 20 }, tx);
      expect(kq.ds.map((s) => s.sku)).toEqual(["SP012"]);
    });
  });

  it("loc theo nhanh danh muc bao gom ca danh muc con", async () => {
    await withRollback(async (tx) => {
      const cha = await taoDanhMuc({ name: "Nội thất", parentId: null }, tx);
      const con = await taoDanhMuc({ name: "Ghế", parentId: cha.id }, tx);
      await taoSanPham({ sku: "SP020", name: "Ghế A", categoryId: con.id }, tx);
      await taoSanPham({ sku: "SP021", name: "Đèn B", categoryId: null }, tx);

      const kq = await timSanPham({ categoryPath: cha.path }, { trang: 1, moiTrang: 20 }, tx);
      expect(kq.ds.map((s) => s.sku)).toEqual(["SP020"]);
    });
  });

  it("loc theo khoang gia", async () => {
    await withRollback(async (tx) => {
      await taoSanPham({ sku: "SP030", name: "Re", listPrice: 100_000 }, tx);
      await taoSanPham({ sku: "SP031", name: "Dat", listPrice: 9_000_000 }, tx);
      const kq = await timSanPham({ giaTu: 1_000_000 }, { trang: 1, moiTrang: 20 }, tx);
      expect(kq.ds.map((s) => s.sku)).toEqual(["SP031"]);
    });
  });

  it("loc san pham chua co anh", async () => {
    await withRollback(async (tx) => {
      const co = await taoSanPham({ sku: "SP040", name: "Co anh" }, tx);
      await taoSanPham({ sku: "SP041", name: "Chua co anh" }, tx);
      await tx.insert(productImages).values({
        productId: co.id, storageKey: "k", variants: { thumb: "t", medium: "m", large: "l" },
        width: 10, height: 10, bytes: 1, contentHash: "h", isPrimary: true,
      });
      const kq = await timSanPham({ coAnh: false }, { trang: 1, moiTrang: 20 }, tx);
      expect(kq.ds.map((s) => s.sku)).toEqual(["SP041"]);
    });
  });

  it("cap nhat hang loat tra ve so dong da doi", async () => {
    await withRollback(async (tx) => {
      const a = await taoSanPham({ sku: "SP050", name: "A" }, tx);
      const b = await taoSanPham({ sku: "SP051", name: "B" }, tx);
      const so = await capNhatHangLoat([a.id, b.id], { status: "discontinued" }, tx);
      expect(so).toBe(2);
      const [sau] = await tx.select().from(products).where(eq(products.id, a.id));
      expect(sau.status).toBe("discontinued");
    });
  });

  it("phan trang cat dung so luong", async () => {
    await withRollback(async (tx) => {
      for (let i = 0; i < 5; i++) {
        await taoSanPham({ sku: `SP06${i}`, name: `Mau ${i}` }, tx);
      }
      const kq = await timSanPham({ tuKhoa: "mau" }, { trang: 2, moiTrang: 2 }, tx);
      expect(kq.ds).toHaveLength(2);
      expect(kq.tong).toBe(5);
    });
  });
});
```

- [ ] **Step 6: Chạy test để xác nhận nó hỏng**

Run: `npm test -- tests/modules/catalog/products.service.test.ts`
Expected: FAIL — không tìm thấy `@/modules/catalog/products.service`

- [ ] **Step 7: Viết `src/modules/catalog/products.repo.ts`**

```ts
import { and, eq, gte, lte, sql as raw, desc, inArray, type SQL } from "drizzle-orm";
import { db, type Tx } from "@/db/client";
import { products, productImages, categories } from "@/db/schema";
import type { BoLoc, ThamSoTrang } from "./search-query";

type Handle = Tx | typeof db;
const h = (tx?: Tx): Handle => tx ?? db;

export type SanPham = {
  id: string;
  sku: string;
  name: string;
  description: string;
  listPrice: string | null;
  currency: string;
  categoryId: string | null;
  attributes: Record<string, unknown>;
  status: string;
  anhDaiDien: string | null;
};

function dungDieuKien(loc: BoLoc): SQL[] {
  const dk: SQL[] = [];

  if (loc.tuKhoa) {
    dk.push(raw`${products.searchText} LIKE ${"%" + loc.tuKhoa + "%"}`);
  }
  if (loc.categoryPath) {
    dk.push(raw`${products.categoryId} IN (
      SELECT ${categories.id} FROM ${categories} WHERE ${categories.path} LIKE ${loc.categoryPath + "%"}
    )`);
  }
  if (loc.giaTu !== undefined) dk.push(gte(products.listPrice, String(loc.giaTu)));
  if (loc.giaDen !== undefined) dk.push(lte(products.listPrice, String(loc.giaDen)));
  if (loc.trangThai) dk.push(eq(products.status, loc.trangThai));
  if (loc.coAnh !== undefined) {
    const co = raw`EXISTS (SELECT 1 FROM ${productImages} WHERE ${productImages.productId} = ${products.id})`;
    dk.push(loc.coAnh ? co : raw`NOT ${co}`);
  }
  return dk;
}

export async function tim(
  loc: BoLoc, trang: ThamSoTrang, tx?: Tx,
): Promise<{ ds: SanPham[]; tong: number }> {
  const dk = dungDieuKien(loc);
  const where = dk.length ? and(...dk) : undefined;

  const [{ tong }] = await h(tx)
    .select({ tong: raw<number>`count(*)::int` })
    .from(products)
    .where(where);

  const ds = await h(tx)
    .select({
      id: products.id, sku: products.sku, name: products.name,
      description: products.description, listPrice: products.listPrice,
      currency: products.currency, categoryId: products.categoryId,
      attributes: products.attributes, status: products.status,
      anhDaiDien: raw<string | null>`(
        SELECT ${productImages.variants} ->> 'thumb' FROM ${productImages}
        WHERE ${productImages.productId} = ${products.id}
        ORDER BY ${productImages.isPrimary} DESC, ${productImages.sortOrder} ASC LIMIT 1
      )`,
    })
    .from(products)
    .where(where)
    .orderBy(desc(products.createdAt))
    .limit(trang.moiTrang)
    .offset((trang.trang - 1) * trang.moiTrang);

  return { ds: ds as SanPham[], tong };
}

export async function chen(gt: typeof products.$inferInsert, tx?: Tx) {
  const [r] = await h(tx).insert(products).values(gt).returning();
  return r;
}

export async function layTheoId(id: string, tx?: Tx) {
  const [r] = await h(tx).select().from(products).where(eq(products.id, id)).limit(1);
  return r ?? null;
}

export async function capNhat(
  id: string, gt: Partial<typeof products.$inferInsert>, tx?: Tx,
): Promise<void> {
  await h(tx).update(products).set({ ...gt, updatedAt: new Date() }).where(eq(products.id, id));
}

export async function capNhatNhieu(
  ids: string[], gt: Partial<typeof products.$inferInsert>, tx?: Tx,
): Promise<number> {
  if (ids.length === 0) return 0;
  const r = await h(tx).update(products)
    .set({ ...gt, updatedAt: new Date() })
    .where(inArray(products.id, ids))
    .returning({ id: products.id });
  return r.length;
}
```

- [ ] **Step 8: Viết `src/modules/catalog/products.service.ts`**

```ts
import type { Tx } from "@/db/client";
import { dungSearchText } from "@/lib/vietnamese";
import * as repo from "./products.repo";
import type { SanPham } from "./products.repo";
import type { BoLoc, ThamSoTrang, TrangThaiSanPham } from "./search-query";

export type { SanPham };
export const timSanPham = repo.tim;
export const layTheoId = repo.layTheoId;

export class LoiSkuTrung extends Error {
  constructor(sku: string) {
    super(`Mã sản phẩm "${sku}" đã tồn tại.`);
    this.name = "LoiSkuTrung";
  }
}

export type TaoSanPhamInput = {
  sku: string;
  name: string;
  description?: string;
  listPrice?: number | null;
  currency?: string;
  categoryId?: string | null;
  attributes?: Record<string, unknown>;
  status?: TrangThaiSanPham;
  createdBy?: string | null;
};

/**
 * Drizzle BOC loi Postgres vao .cause, nen message o tang ngoai cung KHONG chua
 * "duplicate key". Chi kiem tra e.message se khong bao gio nhan ra trung khoa,
 * va nguoi dung se thay loi CSDL tho thay vi thong bao "Ma san pham da ton tai".
 * Di theo chuoi .cause va uu tien ma SQLSTATE 23505 (unique_violation) — dang tin
 * hon so khop chuoi van ban. Gioi han 5 tang de khong lap vo han neu cause vong lai.
 */
function laLoiTrungKhoa(e: unknown): boolean {
  let hien: unknown = e;
  for (let i = 0; i < 5 && hien instanceof Error; i++) {
    if ((hien as { code?: unknown }).code === "23505") return true;
    if (/duplicate key|products_sku_idx|unique/i.test(hien.message)) return true;
    hien = (hien as { cause?: unknown }).cause;
  }
  return false;
}

export async function taoSanPham(input: TaoSanPhamInput, tx?: Tx): Promise<SanPham> {
  try {
    const r = await repo.chen({
      sku: input.sku,
      name: input.name,
      description: input.description ?? "",
      searchText: dungSearchText(input),
      listPrice: input.listPrice === null || input.listPrice === undefined
        ? null : String(input.listPrice),
      currency: input.currency ?? "VND",
      categoryId: input.categoryId ?? null,
      attributes: input.attributes ?? {},
      status: input.status ?? "active",
      createdBy: input.createdBy ?? null,
    }, tx);
    return { ...r, attributes: r.attributes as Record<string, unknown>, anhDaiDien: null };
  } catch (e) {
    if (laLoiTrungKhoa(e)) throw new LoiSkuTrung(input.sku);
    throw e;
  }
}

/** Cap nhat mot san pham. Tu tinh lai searchText khi sku/ten/mo ta doi. */
export async function capNhatSanPham(
  id: string, input: Partial<TaoSanPhamInput>, tx?: Tx,
): Promise<void> {
  const hien_tai = await repo.layTheoId(id, tx);
  if (!hien_tai) throw new Error(`Không tìm thấy sản phẩm ${id}`);

  const gt: Record<string, unknown> = {};
  if (input.sku !== undefined) gt.sku = input.sku;
  if (input.name !== undefined) gt.name = input.name;
  if (input.description !== undefined) gt.description = input.description;
  if (input.currency !== undefined) gt.currency = input.currency;
  if (input.categoryId !== undefined) gt.categoryId = input.categoryId;
  if (input.attributes !== undefined) gt.attributes = input.attributes;
  if (input.status !== undefined) gt.status = input.status;
  if (input.listPrice !== undefined) {
    gt.listPrice = input.listPrice === null ? null : String(input.listPrice);
  }

  const doi_van_ban = input.sku !== undefined || input.name !== undefined
    || input.description !== undefined;
  if (doi_van_ban) {
    gt.searchText = dungSearchText({
      sku: input.sku ?? hien_tai.sku,
      name: input.name ?? hien_tai.name,
      description: input.description ?? hien_tai.description,
    });
  }

  try {
    await repo.capNhat(id, gt, tx);
  } catch (e) {
    if (laLoiTrungKhoa(e) && input.sku) throw new LoiSkuTrung(input.sku);
    throw e;
  }
}

/**
 * Gan chung mot vai truong cho nhieu san pham.
 * Khong nhan sku/name/description vi nhung truong do phai duy nhat theo tung san pham.
 */
export async function capNhatHangLoat(
  ids: string[],
  input: Pick<TaoSanPhamInput, "categoryId" | "status" | "currency"> & { listPrice?: number | null },
  tx?: Tx,
): Promise<number> {
  const gt: Record<string, unknown> = {};
  if (input.categoryId !== undefined) gt.categoryId = input.categoryId;
  if (input.status !== undefined) gt.status = input.status;
  if (input.currency !== undefined) gt.currency = input.currency;
  if (input.listPrice !== undefined) {
    gt.listPrice = input.listPrice === null ? null : String(input.listPrice);
  }
  if (Object.keys(gt).length === 0) return 0;
  return repo.capNhatNhieu(ids, gt, tx);
}
```

- [ ] **Step 9: Chạy test để xác nhận nó xanh**

Run: `npm test -- tests/modules/catalog/products.service.test.ts`
Expected: PASS — 10 test.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: nghiep vu san pham, tim kiem tieng Viet khong dau va loc theo nhanh danh muc"
```

---

## Task 10: Upload ảnh hàng loạt

Phủ yêu cầu **A1** và phần điều phối của **A5**, cùng ràng buộc phát hiện ảnh trùng ở **B6**.

**Files:**
- Create: `src/modules/media/images.repo.ts`, `src/modules/media/upload.service.ts`
- Create: `src/app/api/upload/route.ts`
- Create: `src/app/admin/upload/page.tsx`, `src/app/admin/upload/upload-form.tsx`
- Test: `tests/modules/media/upload.service.test.ts`

**Interfaces:**
- Consumes: `xuLyAnh`, `BIEN_THE` (Task 7); `dungKhoa`, `ghiTep` (Task 8); `taoSanPham` (Task 9)
- Produces:
  - `type KetQuaMotTep = { tenTep: string } & ({ trangThai: "thanh_cong"; productId: string; imageId: string } | { trangThai: "trung"; productIdDaCo: string } | { trangThai: "loi"; thongBao: string })`
  - `kiemTraTep(tenTep: string, kichThuoc: number): { hopLe: true } | { hopLe: false; thongBao: string }` — hàm thuần
  - `napMotTep(tep: { ten: string; noiDung: Buffer }, boi: string | null): Promise<KetQuaMotTep>`
  - `napNhieuTep(ds: { ten: string; noiDung: Buffer }[], boi: string | null): Promise<KetQuaMotTep[]>`
  - `const TOI_DA_BYTE = 20 * 1024 * 1024`, `const TOI_DA_TEP = 200`

- [ ] **Step 1: Viết test**

Tạo `tests/modules/media/upload.service.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { kiemTraTep, napNhieuTep, TOI_DA_BYTE } from "@/modules/media/upload.service";
import { xoaTep } from "@/modules/media/storage";
import { db } from "@/db/client";
import { products, productImages } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

async function anh(w: number, h: number): Promise<Buffer> {
  return sharp({ create: { width: w, height: h, channels: 3, background: { r: 1, g: 2, b: 3 } } })
    .jpeg().toBuffer();
}

describe("kiemTraTep", () => {
  it("nhan duoi jpg, png, webp, heic", () => {
    for (const t of ["a.jpg", "a.JPEG", "a.png", "a.webp", "a.heic"]) {
      expect(kiemTraTep(t, 1000).hopLe).toBe(true);
    }
  });
  it("tu choi duoi khong phai anh", () => {
    const kq = kiemTraTep("tailieu.pdf", 1000);
    expect(kq.hopLe).toBe(false);
    if (!kq.hopLe) expect(kq.thongBao).toMatch(/định dạng/i);
  });
  it("tu choi tep vuot 20 MB", () => {
    const kq = kiemTraTep("a.jpg", TOI_DA_BYTE + 1);
    expect(kq.hopLe).toBe(false);
    if (!kq.hopLe) expect(kq.thongBao).toMatch(/20 MB/);
  });
});

describe("napNhieuTep", () => {
  it("nap thanh cong va tao san pham nhap kem anh dai dien", async () => {
    const ten = `${randomUUID()}.jpg`;
    const kq = await napNhieuTep([{ ten, noiDung: await anh(800, 600) }], null);
    expect(kq).toHaveLength(1);
    expect(kq[0].trangThai).toBe("thanh_cong");

    if (kq[0].trangThai !== "thanh_cong") throw new Error("khong den day");
    const [sp] = await db.select().from(products).where(eq(products.id, kq[0].productId));
    expect(sp.status).toBe("draft");

    const anhs = await db.select().from(productImages)
      .where(eq(productImages.productId, kq[0].productId));
    expect(anhs).toHaveLength(1);
    expect(anhs[0].isPrimary).toBe(true);
    const bt = anhs[0].variants as Record<string, string>;
    expect(Object.keys(bt).sort()).toEqual(["large", "medium", "thumb"]);

    await xoaTep([...Object.values(bt), anhs[0].storageKey]);
    await db.delete(products).where(eq(products.id, kq[0].productId));
  }, 60_000);

  it("mot tep hong khong lam hong ca lo", async () => {
    const tot = `${randomUUID()}.jpg`;
    const kq = await napNhieuTep([
      { ten: tot, noiDung: await anh(400, 400) },
      { ten: "hong.jpg", noiDung: Buffer.from("khong phai anh") },
    ], null);

    expect(kq.filter((r) => r.trangThai === "thanh_cong")).toHaveLength(1);
    expect(kq.filter((r) => r.trangThai === "loi")).toHaveLength(1);

    const ids = kq.flatMap((r) => (r.trangThai === "thanh_cong" ? [r.productId] : []));
    const anhs = await db.select().from(productImages).where(inArray(productImages.productId, ids));
    await xoaTep(anhs.flatMap((a) => [...Object.values(a.variants as Record<string, string>), a.storageKey]));
    await db.delete(products).where(inArray(products.id, ids));
  }, 60_000);

  it("bao trung khi nap lai dung anh da co", async () => {
    const noiDung = await anh(300, 300);
    const lan1 = await napNhieuTep([{ ten: `${randomUUID()}.jpg`, noiDung }], null);
    const lan2 = await napNhieuTep([{ ten: `${randomUUID()}.jpg`, noiDung }], null);

    expect(lan1[0].trangThai).toBe("thanh_cong");
    expect(lan2[0].trangThai).toBe("trung");

    if (lan1[0].trangThai !== "thanh_cong") throw new Error("khong den day");
    const anhs = await db.select().from(productImages)
      .where(eq(productImages.productId, lan1[0].productId));
    await xoaTep(anhs.flatMap((a) => [...Object.values(a.variants as Record<string, string>), a.storageKey]));
    await db.delete(products).where(eq(products.id, lan1[0].productId));
  }, 60_000);
});
```

- [ ] **Step 2: Chạy test để xác nhận nó hỏng**

Run: `npm test -- tests/modules/media/upload.service.test.ts`
Expected: FAIL — không tìm thấy module.

- [ ] **Step 3: Viết `src/modules/media/images.repo.ts`**

```ts
import { eq } from "drizzle-orm";
import { db, type Tx } from "@/db/client";
import { productImages } from "@/db/schema";

type Handle = Tx | typeof db;
const h = (tx?: Tx): Handle => tx ?? db;

export async function timTheoMaBam(contentHash: string, tx?: Tx) {
  const [r] = await h(tx).select().from(productImages)
    .where(eq(productImages.contentHash, contentHash)).limit(1);
  return r ?? null;
}

export async function chen(gt: typeof productImages.$inferInsert, tx?: Tx) {
  const [r] = await h(tx).insert(productImages).values(gt).returning();
  return r;
}

export async function layTheoSanPham(productId: string, tx?: Tx) {
  return h(tx).select().from(productImages).where(eq(productImages.productId, productId));
}
```

- [ ] **Step 4: Viết `src/modules/media/upload.service.ts`**

```ts
import { randomUUID } from "node:crypto";
import { xuLyAnh, BIEN_THE, LoiAnhKhongHopLe, type TenBienThe } from "./image-processor";
import { dungKhoa, ghiTep } from "./storage";
import * as anhRepo from "./images.repo";
import { taoSanPham } from "@/modules/catalog/products.service";

export const TOI_DA_BYTE = 20 * 1024 * 1024;
export const TOI_DA_TEP = 200;
const DUOI_CHO_PHEP = ["jpg", "jpeg", "png", "webp", "heic"];

export type KetQuaMotTep = { tenTep: string } & (
  | { trangThai: "thanh_cong"; productId: string; imageId: string }
  | { trangThai: "trung"; productIdDaCo: string }
  | { trangThai: "loi"; thongBao: string }
);

/** Ham thuan — kiem tra so bo truoc khi ton cong doc anh. */
export function kiemTraTep(
  tenTep: string, kichThuoc: number,
): { hopLe: true } | { hopLe: false; thongBao: string } {
  const duoi = tenTep.split(".").pop()?.toLowerCase() ?? "";
  if (!DUOI_CHO_PHEP.includes(duoi)) {
    return { hopLe: false, thongBao: `Không nhận định dạng ".${duoi}". Chỉ nhận JPG, PNG, WebP, HEIC.` };
  }
  if (kichThuoc > TOI_DA_BYTE) {
    return { hopLe: false, thongBao: "Tệp vượt quá 20 MB." };
  }
  return { hopLe: true };
}

/** Bo duoi va ky tu dac biet khoi ten tep de dung lam ten san pham nhap. */
function tenTuTenTep(tenTep: string): string {
  return tenTep.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "Chưa đặt tên";
}

export async function napMotTep(
  tep: { ten: string; noiDung: Buffer },
  boi: string | null,
): Promise<KetQuaMotTep> {
  const so_bo = kiemTraTep(tep.ten, tep.noiDung.byteLength);
  if (!so_bo.hopLe) {
    return { tenTep: tep.ten, trangThai: "loi", thongBao: so_bo.thongBao };
  }

  try {
    const daXuLy = await xuLyAnh(tep.noiDung);

    const trung = await anhRepo.timTheoMaBam(daXuLy.contentHash);
    if (trung) {
      return { tenTep: tep.ten, trangThai: "trung", productIdDaCo: trung.productId };
    }

    const sp = await taoSanPham({
      sku: `TMP-${randomUUID().slice(0, 8).toUpperCase()}`,
      name: tenTuTenTep(tep.ten),
      status: "draft",
      createdBy: boi,
    });

    const imageId = randomUUID();
    const duoiGoc = tep.ten.split(".").pop()!.toLowerCase();

    const khoaGoc = dungKhoa(sp.id, imageId, "goc", duoiGoc);
    await ghiTep(khoaGoc, tep.noiDung, `image/${duoiGoc === "jpg" ? "jpeg" : duoiGoc}`);

    const bienThe = {} as Record<TenBienThe, string>;
    for (const { ten } of BIEN_THE) {
      const khoa = dungKhoa(sp.id, imageId, ten, "webp");
      await ghiTep(khoa, daXuLy.bienThe[ten], "image/webp");
      bienThe[ten] = khoa;
    }

    await anhRepo.chen({
      id: imageId,
      productId: sp.id,
      storageKey: khoaGoc,
      variants: bienThe,
      width: daXuLy.width,
      height: daXuLy.height,
      bytes: daXuLy.bytes,
      contentHash: daXuLy.contentHash,
      isPrimary: true,
      sortOrder: 0,
    });

    return { tenTep: tep.ten, trangThai: "thanh_cong", productId: sp.id, imageId };
  } catch (e) {
    const thongBao = e instanceof LoiAnhKhongHopLe
      ? e.message
      : `Lỗi khi xử lý: ${e instanceof Error ? e.message : String(e)}`;
    return { tenTep: tep.ten, trangThai: "loi", thongBao };
  }
}

/** Nap tuan tu de khong lam nghen bo nho khi lo len toi 200 anh. */
export async function napNhieuTep(
  ds: { ten: string; noiDung: Buffer }[],
  boi: string | null,
): Promise<KetQuaMotTep[]> {
  const kq: KetQuaMotTep[] = [];
  for (const tep of ds.slice(0, TOI_DA_TEP)) {
    kq.push(await napMotTep(tep, boi));
  }
  return kq;
}
```

- [ ] **Step 5: Chạy test để xác nhận nó xanh**

Run: `npm test -- tests/modules/media/upload.service.test.ts`
Expected: PASS — 6 test. Test gọi Supabase thật nên mất khoảng 30–60 giây.

- [ ] **Step 6: Viết route API `src/app/api/upload/route.ts`**

```ts
import { NextResponse } from "next/server";
import { requireUser } from "@/auth/guard";
import { napNhieuTep, TOI_DA_TEP } from "@/modules/media/upload.service";

export const maxDuration = 300;

export async function POST(req: Request): Promise<NextResponse> {
  const user = await requireUser();
  const form = await req.formData();
  const tepList = form.getAll("tep").filter((t): t is File => t instanceof File);

  if (tepList.length === 0) {
    return NextResponse.json({ loi: "Chưa chọn tệp nào." }, { status: 400 });
  }
  if (tepList.length > TOI_DA_TEP) {
    return NextResponse.json(
      { loi: `Tối đa ${TOI_DA_TEP} ảnh mỗi lần. Bạn đã chọn ${tepList.length}.` },
      { status: 400 },
    );
  }

  const ds = await Promise.all(
    tepList.map(async (t) => ({ ten: t.name, noiDung: Buffer.from(await t.arrayBuffer()) })),
  );

  return NextResponse.json({ ketQua: await napNhieuTep(ds, user.id) });
}
```

- [ ] **Step 7: Viết giao diện upload**

Tạo `src/app/admin/upload/upload-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { KetQuaMotTep } from "@/modules/media/upload.service";

export function FormTaiAnh() {
  const [dangChay, datDangChay] = useState(false);
  const [ketQua, datKetQua] = useState<KetQuaMotTep[] | null>(null);
  const [loi, datLoi] = useState<string | null>(null);

  async function gui(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    datDangChay(true);
    datLoi(null);
    datKetQua(null);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: new FormData(e.currentTarget) });
      const data = await res.json();
      if (!res.ok) datLoi(data.loi ?? "Tải lên thất bại.");
      else datKetQua(data.ketQua as KetQuaMotTep[]);
    } catch {
      datLoi("Không kết nối được máy chủ. Kiểm tra đường truyền rồi thử lại.");
    } finally {
      datDangChay(false);
    }
  }

  const dem = (t: KetQuaMotTep["trangThai"]) => ketQua?.filter((r) => r.trangThai === t).length ?? 0;

  return (
    <div className="max-w-2xl">
      <form onSubmit={gui} className="flex flex-col gap-4">
        <input type="file" name="tep" multiple required
               accept=".jpg,.jpeg,.png,.webp,.heic"
               className="rounded border p-3 text-sm" />
        <button type="submit" disabled={dangChay}
                className="w-fit rounded bg-teal-800 px-4 py-2 text-sm text-white disabled:opacity-50">
          {dangChay ? "Đang tải lên…" : "Tải lên"}
        </button>
      </form>

      {loi && <p role="alert" className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-800">{loi}</p>}

      {ketQua && (
        <div className="mt-6">
          <p className="mb-3 text-sm">
            Thành công <b>{dem("thanh_cong")}</b> · Trùng <b>{dem("trung")}</b> · Lỗi <b>{dem("loi")}</b>
          </p>
          <ul className="divide-y rounded border text-sm">
            {ketQua.map((r) => (
              <li key={r.tenTep} className="flex items-start justify-between gap-4 px-3 py-2">
                <span className="truncate">{r.tenTep}</span>
                <span className="shrink-0 text-neutral-600">
                  {r.trangThai === "thanh_cong" && "✓ Đã nạp"}
                  {r.trangThai === "trung" && "Ảnh đã có trong kho"}
                  {r.trangThai === "loi" && r.thongBao}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

Tạo `src/app/admin/upload/page.tsx`:

```tsx
import { requireUser } from "@/auth/guard";
import { FormTaiAnh } from "./upload-form";
import { vi } from "@/messages/vi";

export default async function TrangTaiAnh() {
  await requireUser();
  return (
    <>
      <h1 className="mb-2 text-xl font-bold">{vi.dieu_huong.tai_anh}</h1>
      <p className="mb-6 text-sm text-neutral-600">
        Chọn tối đa 200 ảnh, mỗi ảnh không quá 20 MB. Mỗi ảnh tạo ra một sản phẩm nháp —
        sau đó vào mục Sản phẩm để điền mã, tên và giá.
      </p>
      <FormTaiAnh />
    </>
  );
}
```

- [ ] **Step 8: Kiểm tra bằng tay**

`npm run dev` → `/admin/upload`. Chọn 3–5 ảnh thật, bấm Tải lên. Kỳ vọng: bảng kết quả liệt kê từng tệp, số thành công đúng. Vào Supabase → Storage → bucket `catalogue` thấy cây thư mục `products/<id>/<id>/`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: tai anh hang loat, phat hien anh trung va bao loc theo tung tep"
```

---

## Task 11: Giao diện catalogue — lưới ảnh, tìm kiếm và lọc

Hoàn tất yêu cầu **B4** và phần hiển thị của **B2**, **B3**.

**Files:**
- Create: `src/modules/media/anh-url.ts`
- Create: `src/app/admin/products/page.tsx`, `src/app/admin/products/bo-loc.tsx`
- Create: `src/app/admin/products/[id]/page.tsx`, `src/app/admin/products/[id]/actions.ts`
- Test: `tests/modules/media/anh-url.test.ts`

**Interfaces:**
- Consumes: `timSanPham`, `docBoLocTuUrl`, `docThamSoTrang` (Task 9); `layUrlCoKy` (Task 8); `layTatCa` danh mục (Task 6); `dinhDangTien` (Task 4)
- Produces:
  - `kyNhieuUrl(khoa: (string | null)[], hanGiay?: number): Promise<(string | null)[]>` — ký hàng loạt, giữ nguyên thứ tự và giữ `null` ở đúng vị trí
  - `type SanPhamHienThi = SanPham & { urlAnh: string | null; tenDanhMuc: string | null }`

- [ ] **Step 1: Viết test cho ký URL hàng loạt**

Tạo `tests/modules/media/anh-url.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { kyNhieuUrl } from "@/modules/media/anh-url";
import { ghiTep, xoaTep } from "@/modules/media/storage";

describe("kyNhieuUrl", () => {
  it("tra ve mang rong khi dau vao rong", async () => {
    expect(await kyNhieuUrl([])).toEqual([]);
  });

  it("giu null o dung vi tri", async () => {
    const khoa = `test/${randomUUID()}.txt`;
    await ghiTep(khoa, Buffer.from("x"), "text/plain");

    const kq = await kyNhieuUrl([null, khoa, null]);
    expect(kq).toHaveLength(3);
    expect(kq[0]).toBeNull();
    expect(kq[2]).toBeNull();
    expect(kq[1]).toContain(khoa);

    await xoaTep([khoa]);
  }, 30_000);

  it("tra ve null cho khoa khong ton tai thay vi nem loi", async () => {
    const kq = await kyNhieuUrl([`test/${randomUUID()}-khong-co.txt`]);
    expect(kq[0]).toBeNull();
  }, 30_000);
});
```

- [ ] **Step 2: Chạy test để xác nhận nó hỏng**

Run: `npm test -- tests/modules/media/anh-url.test.ts`
Expected: FAIL — không tìm thấy module.

- [ ] **Step 3: Viết `src/modules/media/anh-url.ts`**

```ts
import { layUrlCoKy } from "./storage";

/**
 * Ky nhieu khoa cung luc. Mot khoa hong khong duoc lam hong ca luoi anh,
 * nen tra ve null cho khoa do thay vi nem loi.
 */
export async function kyNhieuUrl(
  khoa: (string | null)[],
  hanGiay = 3600,
): Promise<(string | null)[]> {
  return Promise.all(
    khoa.map(async (k) => {
      if (k === null) return null;
      try {
        return await layUrlCoKy(k, hanGiay);
      } catch {
        return null;
      }
    }),
  );
}
```

- [ ] **Step 4: Chạy test để xác nhận nó xanh**

Run: `npm test -- tests/modules/media/anh-url.test.ts`
Expected: PASS — 3 test.

- [ ] **Step 5: Viết thanh bộ lọc `src/app/admin/products/bo-loc.tsx`**

```tsx
import type { DanhMuc } from "@/modules/catalog/categories.service";
import { vi } from "@/messages/vi";

export function ThanhBoLoc({
  danhMuc, hienTai,
}: {
  danhMuc: DanhMuc[];
  hienTai: Record<string, string | undefined>;
}) {
  return (
    <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs">
        {vi.chung.tim_kiem}
        <input name="q" defaultValue={hienTai.q ?? ""} placeholder="Mã, tên hoặc mô tả"
               className="w-64 rounded border px-3 py-2 text-sm" />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        {vi.dieu_huong.danh_muc}
        <select name="danh_muc_path" defaultValue={hienTai.danh_muc_path ?? ""}
                className="rounded border px-3 py-2 text-sm">
          <option value="">Tất cả</option>
          {danhMuc.map((d) => <option key={d.id} value={d.path}>{d.name}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Giá từ
        <input name="gia_tu" type="number" min="0" defaultValue={hienTai.gia_tu ?? ""}
               className="w-32 rounded border px-3 py-2 text-sm" />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Giá đến
        <input name="gia_den" type="number" min="0" defaultValue={hienTai.gia_den ?? ""}
               className="w-32 rounded border px-3 py-2 text-sm" />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Trạng thái
        <select name="trang_thai" defaultValue={hienTai.trang_thai ?? ""}
                className="rounded border px-3 py-2 text-sm">
          <option value="">Tất cả</option>
          <option value="active">Đang bán</option>
          <option value="draft">Nháp</option>
          <option value="discontinued">Ngừng bán</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Ảnh
        <select name="co_anh" defaultValue={hienTai.co_anh ?? ""}
                className="rounded border px-3 py-2 text-sm">
          <option value="">Tất cả</option>
          <option value="1">Đã có ảnh</option>
          <option value="0">Chưa có ảnh</option>
        </select>
      </label>

      <button className="rounded bg-teal-800 px-4 py-2 text-sm text-white">Lọc</button>
      <a href="/admin/products" className="px-2 py-2 text-sm text-neutral-600 hover:underline">
        Xoá lọc
      </a>
    </form>
  );
}
```

- [ ] **Step 6: Viết trang danh sách `src/app/admin/products/page.tsx`**

```tsx
import Link from "next/link";
import { requireUser } from "@/auth/guard";
import { timSanPham } from "@/modules/catalog/products.service";
import { docBoLocTuUrl, docThamSoTrang } from "@/modules/catalog/search-query";
import { layTatCa } from "@/modules/catalog/categories.service";
import { kyNhieuUrl } from "@/modules/media/anh-url";
import { dinhDangTien } from "@/lib/money";
import { ThanhBoLoc } from "./bo-loc";
import { vi } from "@/messages/vi";

export default async function TrangSanPham({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireUser();
  const sp = await searchParams;

  const [{ ds, tong }, danhMuc] = await Promise.all([
    timSanPham(docBoLocTuUrl(sp), docThamSoTrang(sp)),
    layTatCa(),
  ]);
  const urls = await kyNhieuUrl(ds.map((s) => s.anhDaiDien));
  const tenDanhMuc = new Map(danhMuc.map((d) => [d.id, d.name]));

  const trang = docThamSoTrang(sp);
  const soTrang = Math.max(1, Math.ceil(tong / trang.moiTrang));

  function urlTrang(n: number): string {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v) q.set(k, v);
    q.set("trang", String(n));
    return `/admin/products?${q.toString()}`;
  }

  return (
    <>
      <h1 className="mb-4 text-xl font-bold">{vi.dieu_huong.san_pham}</h1>
      <ThanhBoLoc danhMuc={danhMuc} hienTai={sp} />
      <p className="mb-4 text-sm text-neutral-600">Tìm thấy {tong} sản phẩm</p>

      {ds.length === 0 ? (
        <p className="text-sm text-neutral-500">{vi.chung.khong_co_du_lieu}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {ds.map((s, i) => (
            <li key={s.id} className="overflow-hidden rounded-lg border">
              <Link href={`/admin/products/${s.id}`}>
                <div className="aspect-square bg-neutral-100">
                  {urls[i] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={urls[i]!} alt={s.name} loading="lazy"
                         className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                      Chưa có ảnh
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-mono text-[11px] text-neutral-500">{s.sku}</p>
                  <p className="line-clamp-2 text-sm font-medium">{s.name}</p>
                  <p className="mt-1 text-sm">
                    {s.listPrice
                      ? dinhDangTien(Number(s.listPrice), s.currency === "USD" ? "USD" : "VND")
                      : <span className="text-neutral-400">Chưa có giá</span>}
                  </p>
                  {s.categoryId && (
                    <p className="mt-1 text-[11px] text-neutral-500">
                      {tenDanhMuc.get(s.categoryId)}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {soTrang > 1 && (
        <nav className="mt-8 flex gap-2 text-sm">
          {Array.from({ length: soTrang }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={urlTrang(n)}
                  className={`rounded border px-3 py-1 ${n === trang.trang ? "bg-teal-800 text-white" : ""}`}>
              {n}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
```

- [ ] **Step 7: Viết trang chi tiết sản phẩm**

Tạo `src/app/admin/products/[id]/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/auth/guard";
import { capNhatSanPham, LoiSkuTrung } from "@/modules/catalog/products.service";

export async function luuSanPham(form: FormData): Promise<void> {
  await requireUser();
  const id = String(form.get("id"));
  const gia = String(form.get("list_price") ?? "").trim();

  try {
    await capNhatSanPham(id, {
      sku: String(form.get("sku") ?? "").trim(),
      name: String(form.get("name") ?? "").trim(),
      description: String(form.get("description") ?? ""),
      listPrice: gia === "" ? null : Number(gia),
      categoryId: String(form.get("category_id") ?? "") || null,
      status: form.get("status") as "active" | "discontinued" | "draft",
    });
  } catch (e) {
    if (e instanceof LoiSkuTrung) throw new Error(e.message);
    throw e;
  }

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");
}
```

Tạo `src/app/admin/products/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { requireUser } from "@/auth/guard";
import { layTheoId } from "@/modules/catalog/products.service";
import { layTatCa } from "@/modules/catalog/categories.service";
import { layTheoSanPham } from "@/modules/media/images.repo";
import { kyNhieuUrl } from "@/modules/media/anh-url";
import { luuSanPham } from "./actions";
import { vi } from "@/messages/vi";

export default async function TrangChiTiet({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const sp = await layTheoId(id);
  if (!sp) notFound();

  const [danhMuc, anhs] = await Promise.all([layTatCa(), layTheoSanPham(id)]);
  const urls = await kyNhieuUrl(anhs.map((a) => (a.variants as Record<string, string>).medium));

  return (
    <div className="grid max-w-4xl gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        {urls.length === 0 && <p className="text-sm text-neutral-500">Sản phẩm chưa có ảnh.</p>}
        {urls.map((u, i) => u && (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={anhs[i].id} src={u} alt={sp.name} className="w-full rounded-lg border" />
        ))}
      </div>

      <form action={luuSanPham} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={sp.id} />

        <label className="flex flex-col gap-1 text-xs">Mã sản phẩm
          <input name="sku" defaultValue={sp.sku} required
                 className="rounded border px-3 py-2 font-mono text-sm" />
        </label>

        <label className="flex flex-col gap-1 text-xs">Tên
          <input name="name" defaultValue={sp.name} required
                 className="rounded border px-3 py-2 text-sm" />
        </label>

        <label className="flex flex-col gap-1 text-xs">Mô tả
          <textarea name="description" defaultValue={sp.description} rows={4}
                    className="rounded border px-3 py-2 text-sm" />
        </label>

        <label className="flex flex-col gap-1 text-xs">Giá niêm yết
          <input name="list_price" type="number" min="0" step="1"
                 defaultValue={sp.listPrice ?? ""}
                 className="rounded border px-3 py-2 text-sm" />
        </label>

        <label className="flex flex-col gap-1 text-xs">{vi.dieu_huong.danh_muc}
          <select name="category_id" defaultValue={sp.categoryId ?? ""}
                  className="rounded border px-3 py-2 text-sm">
            <option value="">— Chưa phân loại —</option>
            {danhMuc.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs">Trạng thái
          <select name="status" defaultValue={sp.status}
                  className="rounded border px-3 py-2 text-sm">
            <option value="active">Đang bán</option>
            <option value="draft">Nháp</option>
            <option value="discontinued">Ngừng bán</option>
          </select>
        </label>

        <button className="w-fit rounded bg-teal-800 px-4 py-2 text-sm text-white">
          {vi.chung.luu}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 8: Kiểm tra bằng tay**

`npm run dev` → `/admin/products`. Kỳ vọng: thấy lưới ảnh các sản phẩm nháp vừa upload ở Task 10. Gõ `ghe go` vào ô tìm kiếm khi trong kho có sản phẩm tên `Ghế gỗ sồi` → phải ra kết quả. Bấm vào một sản phẩm, sửa mã và giá, bấm Lưu → quay lại danh sách thấy giá đã đổi.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: giao dien catalogue voi luoi anh, tim kiem tieng Viet va bo loc"
```

---

## Task 12: Gán thông tin hàng loạt

Phủ yêu cầu **A4** và **B5**.

**Files:**
- Create: `src/app/admin/products/hang-loat.tsx`
- Create: `src/app/admin/products/actions-hang-loat.ts`
- Modify: `src/app/admin/products/page.tsx` — bọc lưới trong form chọn nhiều
- Test: `tests/modules/catalog/hang-loat.test.ts`

**Interfaces:**
- Consumes: `capNhatHangLoat` (Task 9)
- Produces:
  - `docYeuCauHangLoat(form: FormData): { ids: string[]; thayDoi: { categoryId?: string | null; status?: TrangThaiSanPham; listPrice?: number | null }; phanTramGia?: number }` — hàm thuần đọc form
  - `tinhGiaSauPhanTram(giaHienTai: number | null, phanTram: number): number | null` — hàm thuần

- [ ] **Step 1: Viết test**

Tạo `tests/modules/catalog/hang-loat.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { docYeuCauHangLoat, tinhGiaSauPhanTram } from "@/app/admin/products/actions-hang-loat";

function form(cap: [string, string][]): FormData {
  const f = new FormData();
  for (const [k, v] of cap) f.append(k, v);
  return f;
}

describe("tinhGiaSauPhanTram", () => {
  it("tang 10 phan tram", () => {
    expect(tinhGiaSauPhanTram(1_000_000, 10)).toBe(1_100_000);
  });
  it("giam 10 phan tram", () => {
    expect(tinhGiaSauPhanTram(1_000_000, -10)).toBe(900_000);
  });
  it("lam tron ve so nguyen", () => {
    expect(tinhGiaSauPhanTram(999, 10)).toBe(1099);
  });
  it("khong tinh duoc khi chua co gia", () => {
    expect(tinhGiaSauPhanTram(null, 10)).toBeNull();
  });
  it("khong cho gia am", () => {
    expect(tinhGiaSauPhanTram(1000, -200)).toBe(0);
  });
});

describe("docYeuCauHangLoat", () => {
  it("doc danh sach id da tick", () => {
    const kq = docYeuCauHangLoat(form([["chon", "a"], ["chon", "b"]]));
    expect(kq.ids).toEqual(["a", "b"]);
  });

  it("bo qua truong de trong", () => {
    const kq = docYeuCauHangLoat(form([["chon", "a"], ["category_id", ""], ["status", ""]]));
    expect(kq.thayDoi).toEqual({});
  });

  it("doc danh muc va trang thai khi co gia tri", () => {
    const kq = docYeuCauHangLoat(form([["chon", "a"], ["category_id", "c1"], ["status", "active"]]));
    expect(kq.thayDoi).toEqual({ categoryId: "c1", status: "active" });
  });

  it("hieu gia tri dac biet xoa danh muc", () => {
    const kq = docYeuCauHangLoat(form([["chon", "a"], ["category_id", "__xoa__"]]));
    expect(kq.thayDoi.categoryId).toBeNull();
  });

  it("doc phan tram gia", () => {
    expect(docYeuCauHangLoat(form([["chon", "a"], ["phan_tram_gia", "-15"]])).phanTramGia).toBe(-15);
  });

  it("bo qua trang thai khong hop le", () => {
    expect(docYeuCauHangLoat(form([["chon", "a"], ["status", "bay"]])).thayDoi.status).toBeUndefined();
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận nó hỏng**

Run: `npm test -- tests/modules/catalog/hang-loat.test.ts`
Expected: FAIL — không tìm thấy module.

- [ ] **Step 3: Viết `src/app/admin/products/actions-hang-loat.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/auth/guard";
import { capNhatHangLoat, capNhatSanPham, layTheoId } from "@/modules/catalog/products.service";
import type { TrangThaiSanPham } from "@/modules/catalog/search-query";

const TRANG_THAI: TrangThaiSanPham[] = ["active", "discontinued", "draft"];
/** Gia tri dac biet trong <select> nghia la "bo danh muc", phan biet voi "khong doi". */
export const XOA_DANH_MUC = "__xoa__";

export type ThayDoiHangLoat = {
  categoryId?: string | null;
  status?: TrangThaiSanPham;
  listPrice?: number | null;
};

/** Ham thuan — doc form thanh y dinh ro rang. */
export function docYeuCauHangLoat(form: FormData): {
  ids: string[];
  thayDoi: ThayDoiHangLoat;
  phanTramGia?: number;
} {
  const ids = form.getAll("chon").map(String).filter(Boolean);
  const thayDoi: ThayDoiHangLoat = {};

  const dm = String(form.get("category_id") ?? "");
  if (dm === XOA_DANH_MUC) thayDoi.categoryId = null;
  else if (dm) thayDoi.categoryId = dm;

  const tt = String(form.get("status") ?? "");
  if (TRANG_THAI.includes(tt as TrangThaiSanPham)) thayDoi.status = tt as TrangThaiSanPham;

  const gia = String(form.get("list_price") ?? "").trim();
  if (gia !== "") thayDoi.listPrice = Number(gia);

  const pt = String(form.get("phan_tram_gia") ?? "").trim();
  const phanTramGia = pt === "" ? undefined : Number(pt);

  return {
    ids,
    thayDoi,
    phanTramGia: Number.isFinite(phanTramGia) ? phanTramGia : undefined,
  };
}

/** Ham thuan — ap phan tram len gia hien tai, khong bao gio ra so am. */
export function tinhGiaSauPhanTram(giaHienTai: number | null, phanTram: number): number | null {
  if (giaHienTai === null) return null;
  return Math.max(0, Math.round(giaHienTai * (1 + phanTram / 100)));
}

export async function apDungHangLoat(form: FormData): Promise<void> {
  await requireAdmin();
  const { ids, thayDoi, phanTramGia } = docYeuCauHangLoat(form);
  if (ids.length === 0) return;

  if (Object.keys(thayDoi).length > 0) {
    await capNhatHangLoat(ids, thayDoi);
  }

  // Phan tram phai tinh theo gia rieng cua tung san pham nen khong gop mot cau lenh duoc.
  if (phanTramGia !== undefined && phanTramGia !== 0) {
    for (const id of ids) {
      const sp = await layTheoId(id);
      if (!sp) continue;
      const moi = tinhGiaSauPhanTram(sp.listPrice === null ? null : Number(sp.listPrice), phanTramGia);
      if (moi !== null) await capNhatSanPham(id, { listPrice: moi });
    }
  }

  revalidatePath("/admin/products");
}
```

- [ ] **Step 4: Chạy test để xác nhận nó xanh**

Run: `npm test -- tests/modules/catalog/hang-loat.test.ts`
Expected: PASS — 11 test.

- [ ] **Step 5: Viết thanh thao tác `src/app/admin/products/hang-loat.tsx`**

```tsx
import type { DanhMuc } from "@/modules/catalog/categories.service";
import { XOA_DANH_MUC } from "./actions-hang-loat";

export function ThanhHangLoat({ danhMuc }: { danhMuc: DanhMuc[] }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border bg-neutral-50 p-4">
      <p className="w-full text-xs text-neutral-600">
        Tick chọn sản phẩm bên dưới rồi điền các ô cần đổi. Ô để trống nghĩa là giữ nguyên.
      </p>

      <label className="flex flex-col gap-1 text-xs">Chuyển danh mục
        <select name="category_id" defaultValue="" className="rounded border px-3 py-2 text-sm">
          <option value="">— Giữ nguyên —</option>
          <option value={XOA_DANH_MUC}>— Bỏ danh mục —</option>
          {danhMuc.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">Đổi trạng thái
        <select name="status" defaultValue="" className="rounded border px-3 py-2 text-sm">
          <option value="">— Giữ nguyên —</option>
          <option value="active">Đang bán</option>
          <option value="draft">Nháp</option>
          <option value="discontinued">Ngừng bán</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">Đặt giá cố định
        <input name="list_price" type="number" min="0" placeholder="Giữ nguyên"
               className="w-36 rounded border px-3 py-2 text-sm" />
      </label>

      <label className="flex flex-col gap-1 text-xs">Đổi giá theo %
        <input name="phan_tram_gia" type="number" step="1" placeholder="vd: -10"
               className="w-28 rounded border px-3 py-2 text-sm" />
      </label>

      <button className="rounded bg-teal-800 px-4 py-2 text-sm text-white">
        Áp dụng cho mục đã chọn
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Nối vào trang danh sách**

Trong `src/app/admin/products/page.tsx`, thêm import:

```tsx
import { ThanhHangLoat } from "./hang-loat";
import { apDungHangLoat } from "./actions-hang-loat";
```

Bọc phần lưới sản phẩm trong một `<form>`. Thay khối bắt đầu từ `{ds.length === 0 ? (` bằng:

```tsx
<form action={apDungHangLoat}>
  <ThanhHangLoat danhMuc={danhMuc} />
  {ds.length === 0 ? (
    <p className="text-sm text-neutral-500">{vi.chung.khong_co_du_lieu}</p>
  ) : (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {ds.map((s, i) => (
        <li key={s.id} className="relative overflow-hidden rounded-lg border">
          <label className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center
                            rounded bg-white/90 shadow">
            <input type="checkbox" name="chon" value={s.id} aria-label={`Chọn ${s.name}`} />
          </label>
          <Link href={`/admin/products/${s.id}`}>
            <div className="aspect-square bg-neutral-100">
              {urls[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urls[i]!} alt={s.name} loading="lazy"
                     className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                  Chưa có ảnh
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="font-mono text-[11px] text-neutral-500">{s.sku}</p>
              <p className="line-clamp-2 text-sm font-medium">{s.name}</p>
              <p className="mt-1 text-sm">
                {s.listPrice
                  ? dinhDangTien(Number(s.listPrice), s.currency === "USD" ? "USD" : "VND")
                  : <span className="text-neutral-400">Chưa có giá</span>}
              </p>
              {s.categoryId && (
                <p className="mt-1 text-[11px] text-neutral-500">{tenDanhMuc.get(s.categoryId)}</p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )}
</form>
```

- [ ] **Step 7: Kiểm tra bằng tay**

`npm run dev` → `/admin/products`. Tick 3 sản phẩm, chọn một danh mục, bấm **Áp dụng** → cả 3 đổi danh mục. Tick 2 sản phẩm đã có giá, nhập `-10` vào ô phần trăm, áp dụng → giá giảm đúng 10%.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: thao tac hang loat — doi danh muc, trang thai va gia theo phan tram"
```

---

## Task 13: Cấu hình thương hiệu

Phủ yêu cầu **G2**.

**Files:**
- Create: `src/modules/brand/brand.repo.ts`
- Create: `src/app/admin/brand/page.tsx`, `src/app/admin/brand/actions.ts`
- Test: `tests/modules/brand/brand.repo.test.ts`

**Interfaces:**
- Consumes: `db`, `Tx` (Task 2); `ghiTep`, `layUrlCoKy` (Task 8)
- Produces:
  - `type ThuongHieu = { id: string; companyName: string; logoKey: string | null; address: string; phone: string; website: string; primaryColor: string; accentColor: string; fontFamily: string; currency: string }`
  - `layThuongHieu(tx?: Tx): Promise<ThuongHieu>` — luôn trả về một bản ghi; tự tạo bản ghi mặc định ở lần gọi đầu
  - `luuThuongHieu(gt: Partial<ThuongHieu>, tx?: Tx): Promise<void>`

- [ ] **Step 1: Viết test**

Tạo `tests/modules/brand/brand.repo.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { withRollback } from "../../helpers/db";
import { layThuongHieu, luuThuongHieu } from "@/modules/brand/brand.repo";

describe("cau hinh thuong hieu", () => {
  it("tao ban ghi mac dinh o lan goc dau tien", async () => {
    await withRollback(async (tx) => {
      const th = await layThuongHieu(tx);
      expect(th.id).toBeTruthy();
      expect(th.currency).toBe("VND");
    });
  });

  it("goi hai lan tra ve cung mot ban ghi", async () => {
    await withRollback(async (tx) => {
      const a = await layThuongHieu(tx);
      const b = await layThuongHieu(tx);
      expect(a.id).toBe(b.id);
    });
  });

  it("luu roi doc lai thay gia tri moi", async () => {
    await withRollback(async (tx) => {
      await layThuongHieu(tx);
      await luuThuongHieu({ companyName: "Công ty ABC", phone: "0900000000" }, tx);
      const sau = await layThuongHieu(tx);
      expect(sau.companyName).toBe("Công ty ABC");
      expect(sau.phone).toBe("0900000000");
    });
  });

  it("chi ghi de truong duoc truyen vao", async () => {
    await withRollback(async (tx) => {
      await layThuongHieu(tx);
      await luuThuongHieu({ companyName: "ABC" }, tx);
      await luuThuongHieu({ phone: "0911" }, tx);
      const sau = await layThuongHieu(tx);
      expect(sau.companyName).toBe("ABC");
      expect(sau.phone).toBe("0911");
    });
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận nó hỏng**

Run: `npm test -- tests/modules/brand/brand.repo.test.ts`
Expected: FAIL — không tìm thấy module.

- [ ] **Step 3: Viết `src/modules/brand/brand.repo.ts`**

```ts
import { eq } from "drizzle-orm";
import { db, type Tx } from "@/db/client";
import { brandSettings } from "@/db/schema";

export type ThuongHieu = {
  id: string;
  companyName: string;
  logoKey: string | null;
  address: string;
  phone: string;
  website: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  currency: string;
};

type Handle = Tx | typeof db;
const h = (tx?: Tx): Handle => tx ?? db;

/** He thong chi co dung mot ban ghi thuong hieu. Tao no neu chua co. */
export async function layThuongHieu(tx?: Tx): Promise<ThuongHieu> {
  const [co] = await h(tx).select().from(brandSettings).limit(1);
  if (co) return co as ThuongHieu;
  const [moi] = await h(tx).insert(brandSettings).values({}).returning();
  return moi as ThuongHieu;
}

export async function luuThuongHieu(gt: Partial<ThuongHieu>, tx?: Tx): Promise<void> {
  const hien_tai = await layThuongHieu(tx);
  const { id: _bo, ...con_lai } = gt;
  await h(tx).update(brandSettings)
    .set({ ...con_lai, updatedAt: new Date() })
    .where(eq(brandSettings.id, hien_tai.id));
}
```

- [ ] **Step 4: Chạy test để xác nhận nó xanh**

Run: `npm test -- tests/modules/brand/brand.repo.test.ts`
Expected: PASS — 4 test.

- [ ] **Step 5: Viết `src/app/admin/brand/actions.ts`**

```ts
"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/auth/guard";
import { luuThuongHieu } from "@/modules/brand/brand.repo";
import { ghiTep } from "@/modules/media/storage";

export async function luuCauHinh(form: FormData): Promise<void> {
  await requireAdmin();

  let logoKey: string | undefined;
  const logo = form.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const duoi = logo.name.split(".").pop()?.toLowerCase() ?? "png";
    logoKey = `brand/logo-${randomUUID()}.${duoi}`;
    await ghiTep(logoKey, Buffer.from(await logo.arrayBuffer()), logo.type || "image/png");
  }

  await luuThuongHieu({
    companyName: String(form.get("company_name") ?? ""),
    address: String(form.get("address") ?? ""),
    phone: String(form.get("phone") ?? ""),
    website: String(form.get("website") ?? ""),
    primaryColor: String(form.get("primary_color") ?? "#0B6E63"),
    accentColor: String(form.get("accent_color") ?? "#8A5A0B"),
    currency: String(form.get("currency") ?? "VND"),
    ...(logoKey ? { logoKey } : {}),
  });

  revalidatePath("/admin/brand");
}
```

- [ ] **Step 6: Viết `src/app/admin/brand/page.tsx`**

```tsx
import { requireAdmin } from "@/auth/guard";
import { layThuongHieu } from "@/modules/brand/brand.repo";
import { layUrlCoKy } from "@/modules/media/storage";
import { luuCauHinh } from "./actions";
import { vi } from "@/messages/vi";

export default async function TrangThuongHieu() {
  await requireAdmin();
  const th = await layThuongHieu();
  const urlLogo = th.logoKey ? await layUrlCoKy(th.logoKey).catch(() => null) : null;

  return (
    <div className="max-w-lg">
      <h1 className="mb-2 text-xl font-bold">{vi.dieu_huong.thuong_hieu}</h1>
      <p className="mb-6 text-sm text-neutral-600">
        Thông tin ở đây dùng chung cho mọi bản báo giá. Đổi logo một lần là toàn bộ báo giá mới
        dùng logo mới.
      </p>

      <form action={luuCauHinh} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-xs">Tên công ty
          <input name="company_name" defaultValue={th.companyName}
                 className="rounded border px-3 py-2 text-sm" />
        </label>

        <div className="flex items-end gap-4">
          {urlLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={urlLogo} alt="Logo hiện tại" className="h-16 rounded border bg-white p-1" />
          )}
          <label className="flex flex-1 flex-col gap-1 text-xs">Logo
            <input name="logo" type="file" accept="image/*"
                   className="rounded border px-3 py-2 text-sm" />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-xs">Địa chỉ
          <input name="address" defaultValue={th.address}
                 className="rounded border px-3 py-2 text-sm" />
        </label>

        <label className="flex flex-col gap-1 text-xs">Điện thoại
          <input name="phone" defaultValue={th.phone}
                 className="rounded border px-3 py-2 text-sm" />
        </label>

        <label className="flex flex-col gap-1 text-xs">Website
          <input name="website" defaultValue={th.website}
                 className="rounded border px-3 py-2 text-sm" />
        </label>

        <div className="flex gap-4">
          <label className="flex flex-col gap-1 text-xs">Màu chủ đạo
            <input name="primary_color" type="color" defaultValue={th.primaryColor}
                   className="h-10 w-20 rounded border" />
          </label>
          <label className="flex flex-col gap-1 text-xs">Màu nhấn
            <input name="accent_color" type="color" defaultValue={th.accentColor}
                   className="h-10 w-20 rounded border" />
          </label>
          <label className="flex flex-col gap-1 text-xs">Tiền tệ
            <select name="currency" defaultValue={th.currency}
                    className="rounded border px-3 py-2 text-sm">
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </label>
        </div>

        <button className="w-fit rounded bg-teal-800 px-4 py-2 text-sm text-white">
          {vi.chung.luu}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 7: Kiểm tra bằng tay**

`npm run dev` → `/admin/brand`. Điền tên công ty, tải logo, bấm Lưu → tải lại trang thấy logo hiện ra. Đăng nhập bằng tài khoản `sale` → mục Thương hiệu không hiện trên thanh điều hướng, và gõ thẳng `/admin/brand` bị đẩy về `/admin`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: cau hinh thuong hieu dung chung"
```

---

## Task 14: Kiểm thử đầu-cuối và hoàn tất mốc

**Files:**
- Create: `playwright.config.ts`, `e2e/dang-nhap.spec.ts`, `e2e/catalogue.spec.ts`
- Create: `README.md`
- Modify: `package.json` — thêm script `test:e2e`

**Interfaces:**
- Consumes: toàn bộ ứng dụng đã dựng ở Task 1–13
- Produces: — (task cuối)

- [ ] **Step 1: Cài Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Cấu hình `playwright.config.ts`**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: { baseURL: "http://localhost:3000", locale: "vi-VN" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/login",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

Thêm vào `package.json` scripts:

```json
"test:e2e": "playwright test"
```

- [ ] **Step 3: Viết `e2e/dang-nhap.spec.ts`**

Thay `admin@congty.vn` / `MatKhauManh123` bằng tài khoản đã tạo ở Task 3 Step 10.

```ts
import { test, expect } from "@playwright/test";

const EMAIL = process.env.E2E_EMAIL ?? "admin@congty.vn";
const MAT_KHAU = process.env.E2E_MAT_KHAU ?? "MatKhauManh123";

test("khach chua dang nhap bi day ve trang dang nhap", async ({ page }) => {
  await page.goto("/admin/products");
  await expect(page).toHaveURL(/\/login/);
});

test("dang nhap dung thi vao duoc khu vuc quan tri", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Mật khẩu").fill(MAT_KHAU);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByRole("link", { name: "Sản phẩm" })).toBeVisible();
});

test("dang nhap sai hien thong bao loi", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Mật khẩu").fill("sai-mat-khau");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(/\/login/);
});
```

- [ ] **Step 4: Viết `e2e/catalogue.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

const EMAIL = process.env.E2E_EMAIL ?? "admin@congty.vn";
const MAT_KHAU = process.env.E2E_MAT_KHAU ?? "MatKhauManh123";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Mật khẩu").fill(MAT_KHAU);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(/\/admin/);
});

test("tao danh muc roi thay no trong danh sach", async ({ page }) => {
  const ten = `Danh mục thử ${Date.now()}`;
  await page.goto("/admin/categories");
  await page.getByPlaceholder("Tên danh mục mới").fill(ten);
  await page.getByRole("button", { name: "Thêm" }).click();
  await expect(page.getByText(ten)).toBeVisible();
});

test("tim kiem khong dau tra ve dung san pham co dau", async ({ page }) => {
  await page.goto("/admin/products");
  await page.getByPlaceholder("Mã, tên hoặc mô tả").fill("ghe");
  await page.getByRole("button", { name: "Lọc" }).click();
  await expect(page).toHaveURL(/q=ghe/);
  await expect(page.getByText(/Tìm thấy \d+ sản phẩm/)).toBeVisible();
});
```

- [ ] **Step 5: Chạy kiểm thử đầu-cuối**

Trước khi chạy, dùng giao diện tạo ít nhất một sản phẩm tên `Ghế gỗ sồi` để phép tìm kiếm có dữ liệu thật.

Run: `npm run test:e2e`
Expected: PASS — 5 test.

- [ ] **Step 6: Chạy toàn bộ kiểm thử và kiểm tra kiểu**

Run: `npm test && npm run typecheck && npm run build`
Expected: toàn bộ test đơn vị xanh, không lỗi kiểu, build thành công.

- [ ] **Step 7: Viết `README.md`**

```markdown
# Catalogue Quote System

Hệ thống quản lý catalogue ảnh sản phẩm và tạo báo giá trực tuyến.

- Đặc tả: [PRD-CQS-001](docs/superpowers/specs/2026-08-28-catalogue-quote-system-design.md)
- Kế hoạch mốc hiện tại: [M0 + M1](docs/superpowers/plans/2026-08-28-m0-m1-nen-mong-va-catalogue.md)

## Chạy trên máy

1. Chép `.env.example` thành `.env.local` rồi điền khoá Supabase.
2. `npm install`
3. `npm run db:migrate` — áp lược đồ lên Supabase
4. `npx tsx scripts/tao-admin.mts <email> <mat-khau> "<Họ tên>"` — tạo tài khoản admin đầu tiên
5. `npm run dev` — mở http://localhost:3000

## Lệnh

| Lệnh | Việc |
|---|---|
| `npm run dev` | Chạy máy chủ phát triển |
| `npm test` | Kiểm thử đơn vị và tích hợp (Vitest) |
| `npm run test:e2e` | Kiểm thử đầu-cuối (Playwright) |
| `npm run typecheck` | Kiểm tra kiểu TypeScript |
| `npm run db:generate` | Sinh migration từ `src/db/schema.ts` |
| `npm run db:migrate` | Áp migration lên cơ sở dữ liệu |

## Cấu trúc

- `src/lib/` — tiện ích thuần, không phụ thuộc gì
- `src/db/` — lược đồ và kết nối cơ sở dữ liệu
- `src/auth/` — phiên đăng nhập và chốt chặn vai trò
- `src/modules/` — nghiệp vụ, tách theo miền (`catalog`, `media`, `brand`)
- `src/app/` — route và giao diện; chỉ gọi xuống `modules`, không chứa nghiệp vụ

Chiều phụ thuộc luôn là `app` → `modules` → `db`/`lib`. Không có mũi tên ngược.
```

- [ ] **Step 8: Commit cuối mốc**

```bash
git add -A
git commit -m "test: kiem thu dau-cuoi cho dang nhap va catalogue, them README"
git tag m1-catalogue
```

---

## Đối chiếu với đặc tả

| Yêu cầu PRD | Task phủ | Ghi chú |
|---|---|---|
| **A1** Upload ảnh trực tiếp | 10 | Giới hạn 20 MB / 200 ảnh; một tệp lỗi không làm hỏng cả lô |
| **A4** Gán thông tin hàng loạt | 12 | Chọn nhiều rồi gán chung danh mục / trạng thái / giá |
| **A5** Xử lý ảnh sau khi nạp | 7, 10 | 3 biến thể WebP, xoá EXIF, mã băm nội dung |
| **B1** Danh mục nhiều cấp | 5, 6 | Đường dẫn vật chất hoá, chặn vòng lặp, xoá nhánh có chuyển sản phẩm |
| **B2** Sản phẩm | 9, 11 | Đầy đủ trường; `sku` duy nhất |
| **B3** Ảnh sản phẩm | 10, 11 | Nhiều ảnh mỗi sản phẩm, có ảnh đại diện |
| **B4** Tìm kiếm và lọc | 4, 9, 11 | Không dấu, lọc theo danh mục/giá/trạng thái/có ảnh |
| **B5** Thao tác hàng loạt | 12 | Gồm cả tăng giảm giá theo phần trăm |
| **B6** Phát hiện ảnh trùng | 10 | Báo trùng theo mã băm, không tạo bản ghi mới |
| **G1** Tài khoản và phân quyền | 3 | Hai vai trò, chốt chặn phía máy chủ |
| **G2** Cấu hình thương hiệu | 13 | Một bản ghi dùng chung |

**Ngoài phạm vi kế hoạch này** (nằm ở mốc sau): A2/A3 đồng bộ Google Drive (M3) · toàn bộ Module C, D, E, F (M2, M4, M5) · B3 kéo thả sắp xếp ảnh và G3 nhật ký hoạt động (M5).

**Sai khác có chủ đích so với PRD §5:** PRD ghi bảng `users`; ở đây `users.id` dùng chung khoá với `auth.users` của Supabase thay vì tự lưu `password_hash`, vì đã chọn Supabase Auth ở §6.2. Mật khẩu do Supabase băm và giữ, đúng tinh thần PRD §8.2.
