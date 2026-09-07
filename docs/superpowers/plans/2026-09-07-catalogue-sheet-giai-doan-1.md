# Lưới catalogue đọc từ Google Sheet — Kế hoạch thực thi (Giai đoạn 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm một trang lưới ảnh đọc thẳng một tab Google Sheet mỗi lần mở, hiển thị đủ mọi dòng kèm ảnh riêng tư từ Drive, có tìm kiếm, bộ lọc và đánh dấu dòng khuyết dữ liệu.

**Architecture:** Một module mới `src/modules/sheet/` gồm ba client mỏng (auth, Sheets, Drive) và hai file thuần không I/O (`catalogue.mapper.ts` biến bảng thô thành mô hình, `catalogue.view.ts` lọc và thống kê). Ảnh Drive đi qua route proxy nạp lười, resize rồi cache vào Supabase Storage và trả URL có ký. Trang lưới là server component, bộ lọc là form GET — không cần JavaScript phía client.

**Tech Stack:** Next.js 16.3.3 · React 19.2.8 · Tailwind 4 · TypeScript · vitest · sharp · Supabase Storage · `google-auth-library`

**Đặc tả:** `docs/superpowers/specs/2026-09-07-catalogue-sheet-giai-doan-1-design.md`

## Global Constraints

- **Tailwind 4** — không có `tailwind.config.js`. Token khai báo bằng `@theme` trong `src/app/globals.css`.
- **Chỉ `src/lib/env.ts` được đọc `process.env`.** Ngoại lệ duy nhất là `drizzle.config.ts`.
- **Chỉ `src/modules/media/storage.ts` được gọi Supabase Storage.**
- **Mọi chuỗi hiển thị nằm trong `src/messages/vi.ts`**, không viết thẳng vào JSX.
- **Kiểm tra quyền luôn ở phía máy chủ.** Ẩn nút không phải là kiểm soát truy cập.
- **Chiều phụ thuộc `app → modules → db/lib`.** Không có mũi tên ngược.
- **Định danh và chú thích trong code viết tiếng Việt KHÔNG DẤU** (theo lối `docBoLocTuUrl`, `chuanHoaTimKiem`). Chuỗi hiển thị trong `vi.ts` thì có dấu đầy đủ.
- **Thông điệp commit tiếng Việt không dấu**, dạng `type: mo ta ngan`. **Không** thêm dòng `Co-Authored-By` hay `Generated with` nào.
- **Chỉ push lên remote `quocviet-IT`.** Kiểm bằng `git remote -v` trước khi đẩy.
- **Không sửa test cho khớp code.** Gặp mâu thuẫn thì dừng, tìm bên nào sai, báo lại.
- **Không chạy `DROP`, `TRUNCATE`, hay xoá dữ liệu mình không tạo ra.** CSDL và bucket là thật và dùng chung.
- **Không cắt bớt output test.** Dán nguyên dòng pass/fail khi báo cáo.
- Thư viện thêm vào **đúng một gói**: `google-auth-library`. Không dùng `googleapis`.

---

## Cấu trúc tệp

| Tệp | Trách nhiệm |
|---|---|
| `src/app/globals.css` | **Sửa** — token thương hiệu, gỡ khối dark mode |
| `src/app/layout.tsx` | **Sửa** — nạp font có bộ dấu tiếng Việt |
| `src/lib/env.ts` | **Sửa** — bốn biến môi trường mới |
| `src/modules/sheet/catalogue.mapper.ts` | **Tạo** — thuần: bảng thô sang `DongCatalogue[]`, sinh cờ |
| `src/modules/sheet/catalogue.view.ts` | **Tạo** — thuần: lọc, thống kê, đọc bộ lọc từ URL |
| `src/modules/sheet/google-auth.ts` | **Tạo** — cửa ngõ duy nhất tới `google-auth-library` |
| `src/modules/sheet/sheet.client.ts` | **Tạo** — cửa ngõ duy nhất tới Sheets API |
| `src/modules/sheet/drive.client.ts` | **Tạo** — cửa ngõ duy nhất tới Drive API |
| `src/modules/sheet/catalogue.service.ts` | **Tạo** — ghép client với mapper, đệm 60 giây |
| `src/modules/media/storage.ts` | **Sửa** — khoá cache ảnh sheet, kiểm tệp tồn tại |
| `src/modules/media/anh-drive.ts` | **Tạo** — tải, resize, cache, trả URL có ký |
| `src/app/api/anh-drive/[fileId]/route.ts` | **Tạo** — proxy ảnh có chốt đăng nhập |
| `src/app/admin/catalogue-sheet/page.tsx` | **Tạo** — trang lưới |
| `src/app/admin/catalogue-sheet/bo-loc.tsx` | **Tạo** — form GET lọc và tìm kiếm |
| `src/messages/vi.ts` | **Sửa** — chuỗi hiển thị của màn hình mới |
| `src/app/admin/layout.tsx` | **Sửa** — thêm mục điều hướng |
| `scripts/kiem-tra-google.mts` | **Tạo** — script chứng minh service account vào được Drive |

`catalogue.view.ts` là bổ sung so với cấu trúc trong đặc tả. Tách ra để `catalogue.mapper.ts` giữ đúng một việc — dịch bảng thô sang mô hình — còn phần lọc và đếm phục vụ giao diện nằm riêng.

---

## Thứ tự và lý do

Bốn task đầu **không phụ thuộc Google**. Làm chúng trước để nếu service account bị chính sách miền chặn (mục 11.1 của đặc tả) thì phần lớn công việc vẫn xong, chỉ tắc ở khâu nối dây.

Task 5 là **cổng chặn**: không qua được thì dừng, báo người dùng, không đi vòng bằng tài khoản cá nhân.

---

### Task 1: Token thiết kế và font có bộ dấu tiếng Việt

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Test: `tests/app/thiet-ke.test.ts`

**Interfaces:**
- Consumes: không có
- Produces: lớp tiện ích Tailwind `bg-hp-foundation`, `text-hp-ink`, `text-hp-body`, `text-hp-muted`, `border-hp-rule`, `bg-hp-card`, `bg-hp-inset`, `border-hp-pink`, `bg-hp-pink-strong`, `font-title`, `font-body`. Mọi task giao diện sau dùng đúng các lớp này.

Ba giá trị dưới đây đã đo và **không được đổi**: `Cardo` (font thân bài mà hệ thiết kế chỉ định) không có bộ dấu tiếng Việt; `#E91D79` chỉ đạt 4,27:1 làm nền nút chữ trắng nên rớt WCAG AA; `#8A8178` chỉ đạt 3,14–3,58:1 nên rớt AA ở nhãn 11px.

- [ ] **Step 1: Viết test thất bại**

Tạo `tests/app/thiet-ke.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");

describe("token thiet ke Hung Phat", () => {
  it("khai bao du token mau trong khoi @theme", () => {
    for (const ten of [
      "--color-hp-foundation: #F7F1EB",
      "--color-hp-card: #FBF7F1",
      "--color-hp-inset: #EFE8DD",
      "--color-hp-ink: #2A2725",
      "--color-hp-body: #4A4540",
      "--color-hp-muted: #6E6760",
      "--color-hp-rule: #D4CFC4",
      "--color-hp-pink: #E91D79",
      "--color-hp-pink-strong: #C4165F",
    ]) {
      expect(css.replace(/\s+/g, " ")).toContain(ten);
    }
  });

  // Boilerplate Next.js dat nen #0a0a0a khi may bat che do toi. De lai thi
  // choi voi toan bo he mau be. Cong phai doc STYLESHEET, khong doc trang.
  it("khong con khoi prefers-color-scheme cua boilerplate", () => {
    expect(css).not.toContain("prefers-color-scheme");
  });

  it("khong dung mau muted goc cua he thiet ke — no rot WCAG AA o nhan 11px", () => {
    expect(css).not.toContain("#8A8178");
  });

  it("font nap kem bo dau tieng Viet", () => {
    expect(layout).toContain("Cormorant_Garamond");
    expect(layout).toContain("EB_Garamond");
    // Thieu "vietnamese" trong subsets thi Google khong gui font co dau ve,
    // du da chon dung font. Day la loi im lang: chu van hien, bang font khac.
    expect(layout).not.toContain('subsets: ["latin"]');
    const soLanCoTiengViet = layout.match(/subsets: \["latin", "vietnamese"\]/g) ?? [];
    expect(soLanCoTiengViet.length).toBe(2);
  });

  it("khong con font Geist cua boilerplate", () => {
    expect(layout).not.toContain("Geist");
  });
});
```

- [ ] **Step 2: Chạy test để chắc chắn nó đỏ**

Run: `npx vitest run tests/app/thiet-ke.test.ts`
Expected: FAIL — 4 test đỏ, `globals.css` chưa có `@theme` với token `hp-*`. Test thứ ba (`không dùng màu muted gốc`) xanh ngay từ đầu: boilerplate chưa bao giờ chứa `#8A8178`. Nó là chốt chặn hồi quy cho tương lai, không phải khẳng định do TDD dẫn ra.

- [ ] **Step 3: Thay `src/app/globals.css`**

Thay **toàn bộ** nội dung file bằng:

```css
@import "tailwindcss";

@theme {
  --color-hp-foundation:  #F7F1EB;
  --color-hp-card:        #FBF7F1;
  --color-hp-inset:       #EFE8DD;
  --color-hp-ink:         #2A2725;
  --color-hp-body:        #4A4540;
  --color-hp-muted:       #6E6760;
  --color-hp-rule:        #D4CFC4;
  --color-hp-pink:        #E91D79;
  --color-hp-pink-strong: #C4165F;

  --font-title: var(--font-title-nap), Georgia, serif;
  --font-body:  var(--font-body-nap), Georgia, serif;
}

body {
  background: var(--color-hp-foundation);
  color: var(--color-hp-body);
  font-family: var(--font-body);
  font-optical-sizing: auto;
}
```

- [ ] **Step 4: Thay phần nạp font trong `src/app/layout.tsx`**

Thay **toàn bộ** nội dung file bằng:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import { vi } from "@/messages/vi";
import "./globals.css";

// "The Seasons" cua he thiet ke la font thuong mai, khong co ban web.
// Cormorant Garamond la ban thay ma chinh he thiet ke chi dinh.
const fontTieuDe = Cormorant_Garamond({
  variable: "--font-title-nap",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
});

// He thiet ke chi dinh "Cardo" cho than bai, nhung Cardo KHONG co subset
// vietnamese tren Google Fonts. Ca giao dien la tieng Viet nen dung no la
// moi chu co dau roi sang font he thong. EB Garamond giu dung y do serif
// than bai va co du dau.
const fontThanBai = EB_Garamond({
  variable: "--font-body-nap",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: vi.trang.tieu_de,
  description: vi.trang.mo_ta,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${fontTieuDe.variable} ${fontThanBai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Chạy test để chắc chắn nó xanh**

Run: `npx vitest run tests/app/thiet-ke.test.ts`
Expected: PASS — 5 test xanh.

- [ ] **Step 6: Chạy typecheck và build**

Run: `npm run typecheck && npm run build`
Expected: cả hai thành công. Build phải tải được font từ Google — máy phải có mạng.

- [ ] **Step 7: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx tests/app/thiet-ke.test.ts
git commit -m "feat(ui): token thiet ke Hung Phat va font co bo dau tieng Viet"
```

---

### Task 2: Mapper — bảng thô sang mô hình

**Files:**
- Create: `src/modules/sheet/catalogue.mapper.ts`
- Create: `tests/modules/sheet/fixtures/bang-mau.ts`
- Test: `tests/modules/sheet/catalogue.mapper.test.ts`

**Interfaces:**
- Consumes: không có (thuần, không I/O)
- Produces:
  - `type OTho = { formattedValue?: string; userEnteredValue?: { formulaValue?: string }; hyperlink?: string }`
  - `type CoBatThuong = "thieu-sku" | "thieu-anh" | "thieu-mo-ta" | "trung" | "tl-vang-lech"`
  - `type DongCatalogue` (xem Step 3)
  - `class LoiThieuCot extends Error` với thuộc tính `cotThieu: string[]`
  - `function chuanHoaTieuDe(s: string): string`
  - `function tachFileIdAnh(congThuc: string | undefined): string | null`
  - `function tachSize(chiTiet: string | null): string | null`
  - `function tinhTlVangSuyRa(chiTiet: string | null): number | null`
  - `function anhXaBang(hang: OTho[][]): DongCatalogue[]`

- [ ] **Step 1: Tạo fixture**

Tạo `tests/modules/sheet/fixtures/bang-mau.ts`. Đây là dữ liệu thật rút gọn từ bảng nguồn, giữ đủ mọi trường hợp biên:

```ts
import type { OTho } from "@/modules/sheet/catalogue.mapper";

const o = (v: string): OTho => ({ formattedValue: v });
const rong: OTho = {};
const anh = (id: string): OTho => ({
  userEnteredValue: { formulaValue: `=IMAGE("https://lh3.google.com/u/0/d/${id}")` },
});
const lien = (v: string, url: string): OTho => ({ formattedValue: v, hyperlink: url });

const THU_MUC = "https://drive.google.com/drive/folders/1On2rBPpBzpLsU7xTyvg0H8v7MM12foE8";

/**
 * Dong 1 la bang tieu de gop o. Dong 2 la tieu de cot.
 * O tieu de "TL VANG" trong bang that CO ky tu xuong dong — giu nguyen o day,
 * vi chinh no la thu lam moi phep so khop truc tiep bi truot.
 */
export const bangMau: OTho[][] = [
  [rong, o("ONLINE CATALOGUE")],
  [
    o("SKU"), o("SO"), o("MO"), o("Chi tiết SP"), o("MÃ MẪU"), o("LOẠI"),
    o("DÒNG"), o("CHẤT LIỆU"), o("TL VÀNG\n (gr)"), o("SIZE"), o("Ổ chủ"),
    o("HÌNH"), o("FOLDER HÌNH"),
  ],
  // 3 — day du, size nam o cot SIZE, xoan lab
  [o("108632"), o("25.10006"), o("25.34648"),
   o("LGDRI: 14KY 7RD/0.326cts 2.85gr D12741 Size: 10"), o("D12741"), o("Complete"),
   o("NHẪN"), o("14KY"), o("2.78"), o("10"), rong,
   anh("18I_Y9I_tLtnizSbupQclY48QBxG3I3XB"), lien("CQ1", THU_MUC)],
  // 4 — cot SIZE trong, size chi co trong mo ta, xoan tu nhien
  [o("204779"), o("25.10271"), o("25.35019"),
   o("DIARI: 18KW 11RD/0.398cts 4.07gr D11031 Size: 18VN"), o("D11031"), o("Complete"),
   o("NHẪN"), o("18KW"), o("3.99"), rong, rong,
   anh("1aXAYbzgcH8J_4GkS_3gkUAvjQA6mR5be"), lien("CQ1", THU_MUC)],
  // 5 — MAT ANH (o HINH rong)
  [o("108930"), o("25.10272"), o("25.35020"),
   o("DIARI: 18KW 11RD/0.400cts 4.00gr D11032 Size: 6"), o("D11032"), o("Complete"),
   o("NHẪN"), o("18KW"), o("3.92"), rong, rong, rong, lien("CQ1", THU_MUC)],
  // 6 — THIEU SKU
  [rong, o("26.10455"), o("26.35607"),
   o("DIARI: 18KY 20RD/0.150cts 3.71gr D11039 Size: 7"), o("D11039"), o("Complete"),
   o("NHẪN"), o("18KY"), o("3.68"), rong, rong,
   anh("1lEQM2d-xJ6YxmFCOforzUnl8RgqoyRaM"), lien("CQ1", THU_MUC)],
  // 7 — THIEU MO TA (va thieu SKU)
  [rong, o("26.10456"), o("26.35608"), rong, o("D11040"), o("Complete"),
   o("NHẪN"), o("18KY"), o("3.68"), rong, rong,
   anh("1CNLZ0aCG3_OJM9kWIittylsQvV3zapPP"), lien("CQ1", THU_MUC)],
  // 8 — TL VANG LECH: 2.41 - 0.2*0.234 = 2.3632, bang ghi 2.41 (quen tru da)
  [o("109177"), o("26.10307"), o("26.35171"),
   o("LGDRI: 18KY 15RD/0.234cts 2.41gr D12800 Size: 5"), o("D12800"), o("Complete"),
   o("NHẪN"), o("18KY"), o("2.41"), rong, rong,
   anh("1a-y9LfglXbLQGfH9ybafsMjzv4-O1mWC"), lien("CQ1", THU_MUC)],
  // 9 va 10 — TRUNG KHIT nhau theo cap (MA MAU, MO).
  // Dung 0.500cts chu khong phai 0.525: voi 0.525 thi 3.68-0.105=3.575 va bien do
  // lech la 0.00499999999999989 — nam duoi nguong 0.005 CHI NHO SAI SO DAU PHAY DONG.
  // Mot fixture nhu vay bien test thanh tro choi may rui. 0.500 cho bien do bang 0.
  [rong, o("26.10393"), o("26.35535"),
   o("LGDRI: PT900PD 6BG/0.500cts 3.68gr D12751-01 Size: 6"), o("D12751-01"), o("Complete"),
   o("NHẪN"), o("PT900PD"), o("3.58"), rong, rong,
   anh("1hDzs73oviksvqJsp9UBIbIVwylZoL9F_"), lien("CQ1", THU_MUC)],
  [rong, o("26.10393"), o("26.35535"),
   o("LGDRI: PT900PD 6BG/0.500cts 3.68gr D12751-01 Size: 6"), o("D12751-01"), o("Complete"),
   o("NHẪN"), o("PT900PD"), o("3.58"), rong, rong,
   anh("1hDzs73oviksvqJsp9UBIbIVwylZoL9F_"), lien("CQ1", THU_MUC)],
  // 11 — NHIEU cum cts trong mot mo ta: 5.18 - 0.2*(0.116+0.441) = 5.0686
  [o("109800"), o("25.10258"), o("26.35145"),
   o("LGDRI: 18KY 4RD/0.116cts+6MQ/0.441cts 5.18gr B12741 Size: 7"), o("B12741"),
   o("Complete"), o("NHẪN"), o("18KY"), o("5.07"), rong, rong,
   anh("1QAIP8HdAFiZMHczOQ7G-dD9ACQJfdqIv"), lien("CQ1", THU_MUC)],
];
```

- [ ] **Step 2: Viết test thất bại**

Tạo `tests/modules/sheet/catalogue.mapper.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  LoiThieuCot, anhXaBang, chuanHoaTieuDe, tachFileIdAnh, tachSize, tinhTlVangSuyRa,
} from "@/modules/sheet/catalogue.mapper";
import { bangMau } from "./fixtures/bang-mau";

describe("chuanHoaTieuDe", () => {
  it("gop xuong dong va khoang trang thanh mot dau cach", () => {
    expect(chuanHoaTieuDe("TL VÀNG\n (gr)")).toBe("tl vàng (gr)");
  });
  it("bo khoang trang dau cuoi va khong phan biet hoa thuong", () => {
    expect(chuanHoaTieuDe("  Chi Tiết SP  ")).toBe("chi tiết sp");
  });
});

describe("tachFileIdAnh", () => {
  it("tach duoc id tu cong thuc IMAGE", () => {
    expect(tachFileIdAnh('=IMAGE("https://lh3.google.com/u/0/d/abc-DEF_123")'))
      .toBe("abc-DEF_123");
  });
  it("tra null khi o rong hoac khong phai cong thuc IMAGE", () => {
    expect(tachFileIdAnh(undefined)).toBeNull();
    expect(tachFileIdAnh("chu thuong")).toBeNull();
  });
});

describe("tachSize", () => {
  it("lay phan sau chu Size", () => {
    expect(tachSize("DIARI: 18KW 11RD/0.398cts 4.07gr D11031 Size: 18VN")).toBe("18VN");
    expect(tachSize("LGDRI: 14KY 7RD/0.326cts 2.85gr D12741 Size: 10")).toBe("10");
  });
  it("tra null khi khong co", () => {
    expect(tachSize("khong co gi")).toBeNull();
    expect(tachSize(null)).toBeNull();
  });
});

describe("tinhTlVangSuyRa", () => {
  it("tru khoi luong da quy tu carat", () => {
    // 2.85 - 0.2*0.326 = 2.7848
    expect(tinhTlVangSuyRa("LGDRI: 14KY 7RD/0.326cts 2.85gr D12741 Size: 10"))
      .toBeCloseTo(2.7848, 4);
  });
  it("cong don MOI cum cts trong mo ta", () => {
    // 5.18 - 0.2*(0.116+0.441) = 5.0686
    expect(tinhTlVangSuyRa("LGDRI: 18KY 4RD/0.116cts+6MQ/0.441cts 5.18gr B12741 Size: 7"))
      .toBeCloseTo(5.0686, 4);
  });
  it("tra null khi khong co gr", () => {
    expect(tinhTlVangSuyRa("khong co so")).toBeNull();
  });
});

describe("anhXaBang", () => {
  const ds = anhXaBang(bangMau);

  it("bo hai dong dau, giu dung so dong du lieu", () => {
    expect(ds).toHaveLength(9);
  });

  it("giu so dong that cua bang de doi chieu", () => {
    expect(ds[0].dongSheet).toBe(3);
    expect(ds[8].dongSheet).toBe(11);
  });

  it("doc dung cot du tieu de co ky tu xuong dong", () => {
    expect(ds[0].tlVang).toBe(2.78);
  });

  it("tach duoc fileId anh", () => {
    expect(ds[0].fileIdAnh).toBe("18I_Y9I_tLtnizSbupQclY48QBxG3I3XB");
  });

  it("lay hyperlink lam duong dan thu muc", () => {
    expect(ds[0].urlThuMuc).toContain("/drive/folders/");
  });

  it("uu tien cot SIZE, trong thi tach tu mo ta", () => {
    expect(ds[0].size).toBe("10");   // co trong cot
    expect(ds[1].size).toBe("18VN"); // chi co trong mo ta
  });

  it("suy loai xoan tu tien to LGDRI / DIARI", () => {
    expect(ds[0].loaiXoan).toBe("lab");
    expect(ds[1].loaiXoan).toBe("tu-nhien");
  });

  it("gan co thieu-anh dung dong", () => {
    expect(ds.filter((d) => d.co.includes("thieu-anh")).map((d) => d.dongSheet)).toEqual([5]);
  });

  it("gan co thieu-sku dung dong", () => {
    expect(ds.filter((d) => d.co.includes("thieu-sku")).map((d) => d.dongSheet))
      .toEqual([6, 7, 9, 10]);
  });

  it("gan co thieu-mo-ta dung dong", () => {
    expect(ds.filter((d) => d.co.includes("thieu-mo-ta")).map((d) => d.dongSheet)).toEqual([7]);
  });

  it("gan co trung cho CA HAI dong trung nhau", () => {
    expect(ds.filter((d) => d.co.includes("trung")).map((d) => d.dongSheet)).toEqual([9, 10]);
  });

  it("gan co tl-vang-lech dung dong, va KHONG bao nham dong hop le", () => {
    expect(ds.filter((d) => d.co.includes("tl-vang-lech")).map((d) => d.dongSheet)).toEqual([8]);
  });

  it("dong day du khong mang co nao", () => {
    expect(ds[0].co).toEqual([]);
  });

  it("nem LoiThieuCot neu thieu cot bat buoc, va neu dich danh cot nao", () => {
    const thieu = bangMau.map((h) => [...h]);
    thieu[1][3] = { formattedValue: "Ghi chu" }; // doi ten cot "Chi tiết SP"
    try {
      anhXaBang(thieu);
      throw new Error("le ra phai nem loi");
    } catch (e) {
      expect(e).toBeInstanceOf(LoiThieuCot);
      expect((e as LoiThieuCot).cotThieu).toContain("Chi tiết SP");
    }
  });
});
```

- [ ] **Step 3: Chạy test để chắc chắn nó đỏ**

Run: `npx vitest run tests/modules/sheet/catalogue.mapper.test.ts`
Expected: FAIL — không phân giải được `@/modules/sheet/catalogue.mapper`.

- [ ] **Step 4: Viết `src/modules/sheet/catalogue.mapper.ts`**

```ts
/** Mot o cua Sheets API, chi giu ba truong ma man hinh nay can. */
export type OTho = {
  formattedValue?: string;
  userEnteredValue?: { formulaValue?: string };
  hyperlink?: string;
};

export type CoBatThuong =
  | "thieu-sku" | "thieu-anh" | "thieu-mo-ta" | "trung" | "tl-vang-lech";

export type DongCatalogue = {
  dongSheet: number;
  sku: string | null;
  maMau: string | null;
  mo: string | null;
  chiTiet: string | null;
  chatLieu: string | null;
  loaiXoan: "lab" | "tu-nhien" | null;
  tlVang: number | null;
  size: string | null;
  fileIdAnh: string | null;
  urlThuMuc: string | null;
  co: CoBatThuong[];
};

export class LoiThieuCot extends Error {
  constructor(public readonly cotThieu: string[]) {
    super(`Bảng tính thiếu cột bắt buộc: ${cotThieu.join(", ")}`);
    this.name = "LoiThieuCot";
  }
}

/**
 * Mot o tieu de trong bang that chua ky tu xuong dong ("TL VANG\n (gr)").
 * So khop truc tiep se truot, nen phai chuan hoa truoc khi doi chieu.
 */
export function chuanHoaTieuDe(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Moi truong logic nhan nhieu ten tieu de. Tab khac co the bo phan "(gr)",
 * nen liet ke ca hai thay vi cot chet mot chuoi.
 */
const COT = {
  sku:      { ten: "SKU",         batBuoc: true,  nhan: ["sku"] },
  mo:       { ten: "MO",          batBuoc: true,  nhan: ["mo"] },
  chiTiet:  { ten: "Chi tiết SP", batBuoc: true,  nhan: ["chi tiết sp"] },
  maMau:    { ten: "MÃ MẪU",      batBuoc: true,  nhan: ["mã mẫu"] },
  chatLieu: { ten: "CHẤT LIỆU",   batBuoc: true,  nhan: ["chất liệu"] },
  tlVang:   { ten: "TL VÀNG",     batBuoc: true,  nhan: ["tl vàng (gr)", "tl vàng"] },
  hinh:     { ten: "HÌNH",        batBuoc: true,  nhan: ["hình"] },
  size:     { ten: "SIZE",        batBuoc: false, nhan: ["size"] },
  thuMuc:   { ten: "FOLDER HÌNH", batBuoc: false, nhan: ["folder hình"] },
} as const;

type TenTruong = keyof typeof COT;

const DONG_TIEU_DE = 1; // chi so 0-based; dong 1 cua bang la bang tieu de gop o
const HE_SO_CARAT_SANG_GRAM = 0.2;
const NGUONG_LECH_TL_VANG = 0.005; // cot hien thi lam tron hai chu so thap phan

export function tachFileIdAnh(congThuc: string | undefined): string | null {
  if (!congThuc) return null;
  const m = /^=IMAGE\(.*?\/d\/([A-Za-z0-9_-]+)/i.exec(congThuc);
  return m ? m[1] : null;
}

export function tachSize(chiTiet: string | null): string | null {
  if (!chiTiet) return null;
  const m = /Size:\s*(\S+)/i.exec(chiTiet);
  return m ? m[1] : null;
}

export function tinhTlVangSuyRa(chiTiet: string | null): number | null {
  if (!chiTiet) return null;
  const gr = /([\d.]+)\s*gr\b/i.exec(chiTiet);
  if (!gr) return null;
  const cts = [...chiTiet.matchAll(/([\d.]+)\s*cts\b/gi)].map((m) => Number(m[1]));
  const tongCts = cts.reduce((a, b) => a + b, 0);
  return Number(gr[1]) - HE_SO_CARAT_SANG_GRAM * tongCts;
}

function chu(o: OTho | undefined): string | null {
  const v = o?.formattedValue?.trim();
  return v ? v : null;
}

export function anhXaBang(hang: OTho[][]): DongCatalogue[] {
  const tieuDe = (hang[DONG_TIEU_DE] ?? []).map((o) => chuanHoaTieuDe(o.formattedValue ?? ""));

  const viTri = {} as Record<TenTruong, number>;
  const thieu: string[] = [];
  for (const [khoa, dinhNghia] of Object.entries(COT) as [TenTruong, typeof COT[TenTruong]][]) {
    const i = tieuDe.findIndex((t) => (dinhNghia.nhan as readonly string[]).includes(t));
    viTri[khoa] = i;
    if (i === -1 && dinhNghia.batBuoc) thieu.push(dinhNghia.ten);
  }
  if (thieu.length > 0) throw new LoiThieuCot(thieu);

  const lay = (h: OTho[], khoa: TenTruong): OTho | undefined =>
    viTri[khoa] === -1 ? undefined : h[viTri[khoa]];

  const ds: DongCatalogue[] = [];
  for (let i = DONG_TIEU_DE + 1; i < hang.length; i++) {
    const h = hang[i] ?? [];
    const chiTiet = chu(lay(h, "chiTiet"));
    const tlVangThoc = chu(lay(h, "tlVang"));
    const tlVang = tlVangThoc === null ? null : Number(tlVangThoc);

    const dong: DongCatalogue = {
      dongSheet: i + 1,
      sku: chu(lay(h, "sku")),
      maMau: chu(lay(h, "maMau")),
      mo: chu(lay(h, "mo")),
      chiTiet,
      chatLieu: chu(lay(h, "chatLieu")),
      loaiXoan: chiTiet === null ? null
        : /^LGDRI/i.test(chiTiet) ? "lab"
        : /^DIARI/i.test(chiTiet) ? "tu-nhien"
        : null,
      tlVang: tlVang !== null && Number.isFinite(tlVang) ? tlVang : null,
      size: chu(lay(h, "size")) ?? tachSize(chiTiet),
      fileIdAnh: tachFileIdAnh(lay(h, "hinh")?.userEnteredValue?.formulaValue),
      urlThuMuc: lay(h, "thuMuc")?.hyperlink ?? null,
      co: [],
    };

    if (dong.sku === null) dong.co.push("thieu-sku");
    if (dong.fileIdAnh === null) dong.co.push("thieu-anh");
    if (dong.chiTiet === null) dong.co.push("thieu-mo-ta");

    const suyRa = tinhTlVangSuyRa(chiTiet);
    if (suyRa !== null && dong.tlVang !== null
        && Math.abs(suyRa - dong.tlVang) > NGUONG_LECH_TL_VANG) {
      dong.co.push("tl-vang-lech");
    }

    ds.push(dong);
  }

  // Co "trung" gan cho MOI dong trong nhom, khong phai chi ban sao thu hai:
  // nguoi doc can thay ca hai de biet nen giu dong nao.
  // Khoa trung la cap (MA MAU, MO) theo dung spec. Dung JSON.stringify thay vi
  // noi chuoi bang dau cach: noi chuoi co the khien hai cap gia tri khac nhau
  // tao ra cung mot khoa (vi du maMau="A" + mo="B C" trung voi maMau="A B" +
  // mo="C"), con JSON.stringify giu ranh gioi tung phan tu ro rang.
  const dem = new Map<string, number>();
  const khoaTrung = (d: DongCatalogue) => JSON.stringify([d.maMau, d.mo]);
  for (const d of ds) dem.set(khoaTrung(d), (dem.get(khoaTrung(d)) ?? 0) + 1);
  for (const d of ds) if ((dem.get(khoaTrung(d)) ?? 0) > 1) d.co.push("trung");

  return ds;
}
```

- [ ] **Step 5: Chạy test để chắc chắn nó xanh**

Run: `npx vitest run tests/modules/sheet/catalogue.mapper.test.ts`
Expected: PASS — toàn bộ test xanh.

- [ ] **Step 6: Chứng minh test có thể đỏ thật**

Đổi tạm `NGUONG_LECH_TL_VANG` thành `999`, chạy lại. Test `gan co tl-vang-lech dung dong` **phải đỏ**. Khôi phục lại `0.005` rồi chạy lại cho xanh.

Nguyên tắc của dự án: test chưa ai nhìn thấy đỏ thì chưa chứng minh được gì.

- [ ] **Step 7: Commit**

```bash
git add src/modules/sheet/catalogue.mapper.ts tests/modules/sheet/catalogue.mapper.test.ts tests/modules/sheet/fixtures/bang-mau.ts
git commit -m "feat(sheet): anh xa bang tinh sang mo hinh catalogue va sinh co bat thuong"
```

---

### Task 3: Lọc và thống kê

**Files:**
- Create: `src/modules/sheet/catalogue.view.ts`
- Test: `tests/modules/sheet/catalogue.view.test.ts`

**Interfaces:**
- Consumes: `DongCatalogue`, `CoBatThuong` từ `catalogue.mapper.ts`
- Produces:
  - `type BoLocCatalogue = { q: string | null; chatLieu: string | null; loaiXoan: "lab" | "tu-nhien" | null; chiCanhBao: boolean }`
  - `type MucDem = { gia_tri: string; soLuong: number }`
  - `type ThongKe = { tong: number; thieuAnh: number; thieuSku: number; tlVangLech: number; theoChatLieu: MucDem[]; theoLoaiXoan: MucDem[] }`
  - `function docBoLocTuUrl(sp: Record<string, string | undefined>): BoLocCatalogue`
  - `function locDanhSach(ds: DongCatalogue[], loc: BoLocCatalogue): DongCatalogue[]`
  - `function tinhThongKe(ds: DongCatalogue[]): ThongKe`

- [ ] **Step 1: Viết test thất bại**

Tạo `tests/modules/sheet/catalogue.view.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { anhXaBang } from "@/modules/sheet/catalogue.mapper";
import { docBoLocTuUrl, locDanhSach, tinhThongKe } from "@/modules/sheet/catalogue.view";
import { bangMau } from "./fixtures/bang-mau";

const ds = anhXaBang(bangMau);
const KHONG_LOC = { q: null, chatLieu: null, loaiXoan: null, chiCanhBao: false };

describe("docBoLocTuUrl", () => {
  it("doc du bon tham so", () => {
    expect(docBoLocTuUrl({ q: "d127", chat_lieu: "18KY", loai_xoan: "lab", canh_bao: "1" }))
      .toEqual({ q: "d127", chatLieu: "18KY", loaiXoan: "lab", chiCanhBao: true });
  });
  it("bo qua gia tri loai_xoan khong hop le", () => {
    expect(docBoLocTuUrl({ loai_xoan: "bay" }).loaiXoan).toBeNull();
  });
  it("chuoi rong coi nhu khong loc", () => {
    expect(docBoLocTuUrl({ q: "  " }).q).toBeNull();
  });
});

describe("tinhThongKe", () => {
  const tk = tinhThongKe(ds);
  it("dem dung tong va tung loai canh bao", () => {
    expect(tk.tong).toBe(9);
    expect(tk.thieuAnh).toBe(1);
    expect(tk.thieuSku).toBe(4);
    expect(tk.tlVangLech).toBe(1);
  });
  it("dem theo chat lieu, nhieu nhat truoc", () => {
    expect(tk.theoChatLieu).toEqual([
      { gia_tri: "18KY", soLuong: 4 },
      { gia_tri: "18KW", soLuong: 2 },
      { gia_tri: "PT900PD", soLuong: 2 },
      { gia_tri: "14KY", soLuong: 1 },
    ]);
  });
  it("dem theo loai xoan", () => {
    expect(tk.theoLoaiXoan).toEqual([
      { gia_tri: "lab", soLuong: 5 },
      { gia_tri: "tu-nhien", soLuong: 3 },
    ]);
  });
});

describe("locDanhSach", () => {
  it("khong loc thi tra nguyen danh sach", () => {
    expect(locDanhSach(ds, KHONG_LOC)).toHaveLength(9);
  });
  it("loc theo chat lieu", () => {
    expect(locDanhSach(ds, { ...KHONG_LOC, chatLieu: "PT900PD" })).toHaveLength(2);
  });
  it("loc theo loai xoan", () => {
    expect(locDanhSach(ds, { ...KHONG_LOC, loaiXoan: "tu-nhien" })).toHaveLength(3);
  });
  it("chi dong co canh bao", () => {
    // 6 dong mang co: 5,6,7,8,9,10. Dong 3,4,11 sach.
    expect(locDanhSach(ds, { ...KHONG_LOC, chiCanhBao: true })).toHaveLength(6);
  });
  it("tim theo ma mau, khong phan biet hoa thuong", () => {
    expect(locDanhSach(ds, { ...KHONG_LOC, q: "d12751" })).toHaveLength(2);
  });
  it("tim theo sku", () => {
    expect(locDanhSach(ds, { ...KHONG_LOC, q: "108632" })).toHaveLength(1);
  });
  it("tim duoc ca trong mo ta, khong chi ma mau va sku", () => {
    // "PT900PD" chi xuat hien trong Chi tiet SP cua hai dong PT900PD.
    // Go chu thuong ma van ra ket qua chu hoa -> chung minh luon tinh khong phan
    // biet hoa thuong. Tinh khong dau da co bo test rieng o tests/lib/vietnamese.test.ts.
    expect(locDanhSach(ds, { ...KHONG_LOC, q: "pt900pd" })).toHaveLength(2);
  });
  it("cong don nhieu dieu kien", () => {
    // 18KY co 4 dong (6,7,8,11); trong do 3 dong mang co (6,7,8).
    expect(locDanhSach(ds, { ...KHONG_LOC, chatLieu: "18KY", chiCanhBao: true }))
      .toHaveLength(3);
  });
});
```

- [ ] **Step 2: Chạy test để chắc chắn nó đỏ**

Run: `npx vitest run tests/modules/sheet/catalogue.view.test.ts`
Expected: FAIL — không phân giải được `@/modules/sheet/catalogue.view`.

- [ ] **Step 3: Viết `src/modules/sheet/catalogue.view.ts`**

```ts
import { chuanHoaTimKiem } from "@/lib/vietnamese";
import type { DongCatalogue } from "./catalogue.mapper";

export type BoLocCatalogue = {
  q: string | null;
  chatLieu: string | null;
  loaiXoan: "lab" | "tu-nhien" | null;
  chiCanhBao: boolean;
};

export type MucDem = { gia_tri: string; soLuong: number };

export type ThongKe = {
  tong: number;
  thieuAnh: number;
  thieuSku: number;
  tlVangLech: number;
  theoChatLieu: MucDem[];
  theoLoaiXoan: MucDem[];
};

function chuoi(v: string | undefined): string | null {
  const s = v?.trim();
  return s ? s : null;
}

export function docBoLocTuUrl(sp: Record<string, string | undefined>): BoLocCatalogue {
  const xoan = chuoi(sp.loai_xoan);
  return {
    q: chuoi(sp.q),
    chatLieu: chuoi(sp.chat_lieu),
    loaiXoan: xoan === "lab" || xoan === "tu-nhien" ? xoan : null,
    chiCanhBao: sp.canh_bao === "1",
  };
}

function demTheo(ds: DongCatalogue[], chon: (d: DongCatalogue) => string | null): MucDem[] {
  const dem = new Map<string, number>();
  for (const d of ds) {
    const v = chon(d);
    if (v !== null) dem.set(v, (dem.get(v) ?? 0) + 1);
  }
  // Nhieu nhat truoc; bang nhau thi theo bang chu cai de thu tu on dinh.
  return [...dem.entries()]
    .map(([gia_tri, soLuong]) => ({ gia_tri, soLuong }))
    .sort((a, b) => b.soLuong - a.soLuong || a.gia_tri.localeCompare(b.gia_tri));
}

export function tinhThongKe(ds: DongCatalogue[]): ThongKe {
  return {
    tong: ds.length,
    thieuAnh: ds.filter((d) => d.co.includes("thieu-anh")).length,
    thieuSku: ds.filter((d) => d.co.includes("thieu-sku")).length,
    tlVangLech: ds.filter((d) => d.co.includes("tl-vang-lech")).length,
    theoChatLieu: demTheo(ds, (d) => d.chatLieu),
    theoLoaiXoan: demTheo(ds, (d) => d.loaiXoan),
  };
}

export function locDanhSach(ds: DongCatalogue[], loc: BoLocCatalogue): DongCatalogue[] {
  const tu_khoa = loc.q === null ? null : chuanHoaTimKiem(loc.q);
  return ds.filter((d) => {
    if (loc.chatLieu !== null && d.chatLieu !== loc.chatLieu) return false;
    if (loc.loaiXoan !== null && d.loaiXoan !== loc.loaiXoan) return false;
    if (loc.chiCanhBao && d.co.length === 0) return false;
    if (tu_khoa !== null) {
      const kho = chuanHoaTimKiem([d.maMau ?? "", d.sku ?? "", d.chiTiet ?? ""].join(" "));
      if (!kho.includes(tu_khoa)) return false;
    }
    return true;
  });
}
```

- [ ] **Step 4: Chạy test để chắc chắn nó xanh**

Run: `npx vitest run tests/modules/sheet/catalogue.view.test.ts`
Expected: PASS — toàn bộ test xanh.

- [ ] **Step 5: Commit**

```bash
git add src/modules/sheet/catalogue.view.ts tests/modules/sheet/catalogue.view.test.ts
git commit -m "feat(sheet): loc va thong ke danh sach catalogue"
```

---

### Task 4: Bốn biến môi trường mới

**Files:**
- Modify: `src/lib/env.ts`
- Modify: `.env.example`
- Test: `tests/lib/env.test.ts` (thêm test, không thay file)

**Interfaces:**
- Consumes: `parseEnv`, `getEnv` sẵn có
- Produces: `getEnv()` trả thêm `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_KEY`, `CATALOGUE_SHEET_ID`, `CATALOGUE_SHEET_TAB` (mặc định `"test"`)

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `tests/lib/env.test.ts`:

```ts
describe("cau hinh Google Sheet", () => {
  const day_du = {
    DATABASE_URL: "postgresql://u:p@h:5432/d",
    NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "pk",
    SUPABASE_SECRET_KEY: "sk",
    GOOGLE_SERVICE_ACCOUNT_EMAIL: "may@du-an.iam.gserviceaccount.com",
    GOOGLE_SERVICE_ACCOUNT_KEY: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
    CATALOGUE_SHEET_ID: "1abcDEF",
  };

  it("CATALOGUE_SHEET_TAB mac dinh la test", () => {
    expect(parseEnv(day_du).CATALOGUE_SHEET_TAB).toBe("test");
  });

  it("nem loi neu thieu khoa service account", () => {
    const { GOOGLE_SERVICE_ACCOUNT_KEY: _bo, ...thieu } = day_du;
    expect(() => parseEnv(thieu)).toThrow(/GOOGLE_SERVICE_ACCOUNT_KEY/);
  });

  it("nem loi neu thieu ID bang tinh", () => {
    const { CATALOGUE_SHEET_ID: _bo, ...thieu } = day_du;
    expect(() => parseEnv(thieu)).toThrow(/CATALOGUE_SHEET_ID/);
  });
});
```

Nếu `parseEnv` chưa được import trong file đó thì thêm vào dòng import sẵn có.

- [ ] **Step 2: Chạy test để chắc chắn nó đỏ**

Run: `npx vitest run tests/lib/env.test.ts`
Expected: FAIL — `CATALOGUE_SHEET_TAB` là `undefined`.

- [ ] **Step 3: Thêm bốn trường vào schema trong `src/lib/env.ts`**

Trong đối tượng `z.object({...})`, thêm sau `SUPABASE_STORAGE_BUCKET`:

```ts
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().min(1),
  GOOGLE_SERVICE_ACCOUNT_KEY: z.string().min(1),
  CATALOGUE_SHEET_ID: z.string().min(1),
  CATALOGUE_SHEET_TAB: z.string().min(1).default("test"),
```

- [ ] **Step 4: Chạy test để chắc chắn nó xanh**

Run: `npx vitest run tests/lib/env.test.ts`
Expected: PASS.

- [ ] **Step 5: Bổ sung `.env.example`**

Thêm vào cuối file:

```
# Service account doc Google Sheet va Drive.
# Khoa rieng PEM luu tren MOT dong, xuong dong viet bang \n.
GOOGLE_SERVICE_ACCOUNT_EMAIL=ten@du-an.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"
CATALOGUE_SHEET_ID=id_bang_tinh
CATALOGUE_SHEET_TAB=test
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/env.ts .env.example tests/lib/env.test.ts
git commit -m "feat(config): bon bien moi truong cho nguon Google Sheet"
```

---

### Task 5: Client Google — **CỔNG CHẶN**

**Files:**
- Create: `src/modules/sheet/google-auth.ts`
- Create: `src/modules/sheet/sheet.client.ts`
- Create: `src/modules/sheet/drive.client.ts`
- Create: `scripts/kiem-tra-google.mts`
- Test: `tests/modules/sheet/google.tich-hop.test.ts`

**Interfaces:**
- Consumes: `getEnv()` từ `@/lib/env`; `OTho` từ `catalogue.mapper.ts`
- Produces:
  - `function layAccessToken(): Promise<string>`
  - `function docBangTho(sheetId: string, tab: string): Promise<OTho[][]>`
  - `function taiTepDrive(fileId: string): Promise<Buffer>`

**Trước khi viết code, phải có credentials.** Việc này người dùng làm, không phải agent:

1. Tạo service account trong Google Cloud, bật **Google Sheets API** và **Google Drive API**, tải khoá JSON.
2. Thêm địa chỉ `…@….iam.gserviceaccount.com` vào Shared Drive nguồn với quyền **Người xem**.
3. Điền `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_KEY`, `CATALOGUE_SHEET_ID` vào `.env.local`.

Service account là **tài khoản ngoài miền công ty**. Nếu Workspace cấm chia sẻ ra ngoài miền thì bước 2 bị từ chối. **Gặp trường hợp này thì dừng lại báo người dùng** — không thay bằng OAuth tài khoản cá nhân của nhân viên, không nhúng cookie, không đi đường vòng.

- [ ] **Step 1: Cài thư viện**

Run: `npm install google-auth-library`
Expected: thêm đúng một gói vào `dependencies`.

- [ ] **Step 2: Viết test tích hợp thất bại**

Tạo `tests/modules/sheet/google.tich-hop.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { docBangTho } from "@/modules/sheet/sheet.client";
import { taiTepDrive } from "@/modules/sheet/drive.client";
import { anhXaBang } from "@/modules/sheet/catalogue.mapper";

// Bo qua khi may chua co khoa, de bo test van chay duoc tren may sach.
const coKhoa = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_KEY && process.env.CATALOGUE_SHEET_ID);
const kiemTra = coKhoa ? describe : describe.skip;

kiemTra("doc that tu Google", () => {
  it("doc duoc bang va anh xa ra dong co du lieu", async () => {
    const tho = await docBangTho(process.env.CATALOGUE_SHEET_ID!, process.env.CATALOGUE_SHEET_TAB ?? "test");
    const ds = anhXaBang(tho);
    expect(ds.length).toBeGreaterThan(0);
    expect(ds.some((d) => d.fileIdAnh !== null)).toBe(true);
  }, 30000);

  it("tai duoc anh rieng tu tu Drive", async () => {
    const tho = await docBangTho(process.env.CATALOGUE_SHEET_ID!, process.env.CATALOGUE_SHEET_TAB ?? "test");
    const id = anhXaBang(tho).find((d) => d.fileIdAnh !== null)!.fileIdAnh!;
    const bytes = await taiTepDrive(id);
    expect(bytes.byteLength).toBeGreaterThan(1000);
  }, 60000);
});
```

- [ ] **Step 3: Chạy test để chắc chắn nó đỏ**

Run: `npx vitest run tests/modules/sheet/google.tich-hop.test.ts`
Expected: FAIL — không phân giải được `@/modules/sheet/sheet.client`.

- [ ] **Step 4: Viết `src/modules/sheet/google-auth.ts`**

```ts
import { JWT } from "google-auth-library";
import { getEnv } from "@/lib/env";

// Chi can quyen doc. Drive.readonly du de tai file trong Shared Drive
// ma service account duoc moi vao voi vai tro Nguoi xem.
const PHAM_VI = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
];

let phien: JWT | null = null;

function layPhien(): JWT {
  if (phien !== null) return phien;
  const env = getEnv();
  phien = new JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // Khoa luu tren mot dong trong .env; phai tra lai ky tu xuong dong that,
    // khong thi thu vien khong parse duoc PEM.
    key: env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, "\n"),
    scopes: PHAM_VI,
  });
  return phien;
}

export async function layAccessToken(): Promise<string> {
  const { token } = await layPhien().getAccessToken();
  if (!token) throw new Error("Không lấy được access token của service account.");
  return token;
}
```

- [ ] **Step 5: Viết `src/modules/sheet/sheet.client.ts`**

```ts
import { layAccessToken } from "./google-auth";
import type { OTho } from "./catalogue.mapper";

// values.get chi tra chu da dinh dang, khong thay cong thuc IMAGE lan hyperlink.
// spreadsheets.get kem field mask nay lay du ca ba tang trong MOT lan goi.
const FIELD_MASK = "sheets.data.rowData.values(formattedValue,userEnteredValue,hyperlink)";

/**
 * Boc ten tab theo cu phap pham vi A1: dat trong dau nhay don, moi dau nhay
 * don co san trong ten phai nhan doi. Ten tab la cau hinh (CATALOGUE_SHEET_TAB)
 * nen co the mang dau cach, dau hai cham... (vi du "Online Cataloge") — thieu
 * buoc boc nay thi Google khong parse duoc pham vi va tra ve loi 400.
 * encodeURIComponent chi ma hoa ky tu, khong tu them dau nhay.
 */
function boPhamViA1(tab: string): string {
  return `'${tab.replace(/'/g, "''")}'`;
}

export async function docBangTho(sheetId: string, tab: string): Promise<OTho[][]> {
  const token = await layAccessToken();
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}` +
    `?ranges=${encodeURIComponent(boPhamViA1(tab))}&includeGridData=true&fields=${encodeURIComponent(FIELD_MASK)}`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Không đọc được bảng tính (${res.status}): ${await res.text()}`);
  }
  const body = (await res.json()) as {
    sheets?: { data?: { rowData?: { values?: OTho[] }[] }[] }[];
  };
  const rowData = body.sheets?.[0]?.data?.[0]?.rowData ?? [];
  return rowData.map((h) => h.values ?? []);
}
```

- [ ] **Step 6: Viết `src/modules/sheet/drive.client.ts`**

```ts
import { layAccessToken } from "./google-auth";

export async function taiTepDrive(fileId: string): Promise<Buffer> {
  const token = await layAccessToken();
  const url =
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}` +
    `?alt=media&supportsAllDrives=true`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Không tải được tệp ${fileId} (${res.status}): ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}
```

- [ ] **Step 7: Viết script kiểm chứng `scripts/kiem-tra-google.mts`**

Dự án là CommonJS nên script dùng top-level await **phải** có đuôi `.mts`. `dotenv.config()` phải chạy **trước** khi nạp module đọc env — ESM nâng mọi `import` lên trên, nên dùng `import()` động.

```ts
import { config } from "dotenv";
config({ path: ".env.local" });

const { docBangTho } = await import("../src/modules/sheet/sheet.client");
const { taiTepDrive } = await import("../src/modules/sheet/drive.client");
const { anhXaBang } = await import("../src/modules/sheet/catalogue.mapper");

const id = process.env.CATALOGUE_SHEET_ID!;
const tab = process.env.CATALOGUE_SHEET_TAB ?? "test";

const tho = await docBangTho(id, tab);
const ds = anhXaBang(tho);
console.log(`Doc duoc ${ds.length} dong tu tab "${tab}".`);
console.log(`Dong dau: ${JSON.stringify(ds[0], null, 2)}`);

const dongCoAnh = ds.find((d) => d.fileIdAnh !== null);
if (!dongCoAnh) {
  console.log("Khong dong nao co anh — khong thu tai duoc.");
} else {
  const bytes = await taiTepDrive(dongCoAnh.fileIdAnh!);
  console.log(`Tai duoc anh ${dongCoAnh.fileIdAnh}: ${bytes.byteLength} bytes.`);
}
```

- [ ] **Step 8: Chạy script kiểm chứng**

Run: `npx tsx scripts/kiem-tra-google.mts`
Expected: in ra số dòng đọc được, nội dung dòng đầu, và số byte của một ảnh.

Nếu lỗi `403` hoặc `404` ở bước đọc bảng: service account chưa được thêm vào Shared Drive, hoặc bị chính sách miền chặn. **Dừng, báo người dùng.**

- [ ] **Step 9: Chạy test tích hợp**

Run: `npx vitest run tests/modules/sheet/google.tich-hop.test.ts`
Expected: PASS — 2 test xanh (hoặc `skipped` nếu máy chưa có khoá).

- [ ] **Step 10: Commit**

```bash
git add src/modules/sheet/google-auth.ts src/modules/sheet/sheet.client.ts src/modules/sheet/drive.client.ts scripts/kiem-tra-google.mts tests/modules/sheet/google.tich-hop.test.ts package.json package-lock.json
git commit -m "feat(sheet): client doc Google Sheet va tai tep Drive bang service account"
```

---

### Task 6: Service — ghép và đệm 60 giây

**Files:**
- Create: `src/modules/sheet/catalogue.service.ts`
- Test: `tests/modules/sheet/catalogue.service.test.ts`

**Interfaces:**
- Consumes: `docBangTho`, `anhXaBang`, `getEnv()`
- Produces:
  - `function layDanhSachCatalogue(): Promise<DongCatalogue[]>`
  - `function xoaBoDem(): void` — chỉ dùng trong test
  - `const HAN_BO_DEM_MS = 60_000`

- [ ] **Step 1: Viết test thất bại**

Tạo `tests/modules/sheet/catalogue.service.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bangMau } from "./fixtures/bang-mau";

const docBangTho = vi.fn();
vi.mock("@/modules/sheet/sheet.client", () => ({ docBangTho }));
vi.mock("@/lib/env", () => ({
  getEnv: () => ({ CATALOGUE_SHEET_ID: "id-gia", CATALOGUE_SHEET_TAB: "test" }),
}));

const { layDanhSachCatalogue, xoaBoDem } = await import("@/modules/sheet/catalogue.service");

beforeEach(() => {
  docBangTho.mockReset();
  docBangTho.mockResolvedValue(bangMau);
  xoaBoDem();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("layDanhSachCatalogue", () => {
  it("goi Sheets API dung mot lan cho nhieu lan doc lien tiep", async () => {
    await layDanhSachCatalogue();
    await layDanhSachCatalogue();
    await layDanhSachCatalogue();
    expect(docBangTho).toHaveBeenCalledTimes(1);
  });

  it("doc lai sau khi bo dem het han", async () => {
    await layDanhSachCatalogue();
    vi.advanceTimersByTime(60_001);
    await layDanhSachCatalogue();
    expect(docBangTho).toHaveBeenCalledTimes(2);
  });

  it("truyen dung ID va tab tu cau hinh", async () => {
    await layDanhSachCatalogue();
    expect(docBangTho).toHaveBeenCalledWith("id-gia", "test");
  });

  it("khong dem ket qua loi — lan sau van goi lai", async () => {
    docBangTho.mockRejectedValueOnce(new Error("mang hong"));
    await expect(layDanhSachCatalogue()).rejects.toThrow("mang hong");
    await layDanhSachCatalogue();
    expect(docBangTho).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Chạy test để chắc chắn nó đỏ**

Run: `npx vitest run tests/modules/sheet/catalogue.service.test.ts`
Expected: FAIL — không phân giải được `@/modules/sheet/catalogue.service`.

- [ ] **Step 3: Viết `src/modules/sheet/catalogue.service.ts`**

```ts
import { getEnv } from "@/lib/env";
import { anhXaBang, type DongCatalogue } from "./catalogue.mapper";
import { docBangTho } from "./sheet.client";

// Bang tinh do nguoi sua tay, tan suat thay doi tinh bang gio. 60 giay du de
// nhieu nguoi mo trang lien tiep khong tao ra nhieu lan goi API.
export const HAN_BO_DEM_MS = 60_000;

let boDem: { luc: number; ds: DongCatalogue[] } | null = null;

/** Chi dung trong test. */
export function xoaBoDem(): void {
  boDem = null;
}

export async function layDanhSachCatalogue(): Promise<DongCatalogue[]> {
  if (boDem !== null && Date.now() - boDem.luc < HAN_BO_DEM_MS) return boDem.ds;

  const env = getEnv();
  const tho = await docBangTho(env.CATALOGUE_SHEET_ID, env.CATALOGUE_SHEET_TAB);
  const ds = anhXaBang(tho);
  // Chi ghi bo dem SAU khi ca hai buoc thanh cong — khong dem ket qua loi.
  boDem = { luc: Date.now(), ds };
  return ds;
}
```

- [ ] **Step 4: Chạy test để chắc chắn nó xanh**

Run: `npx vitest run tests/modules/sheet/catalogue.service.test.ts`
Expected: PASS — 4 test xanh.

- [ ] **Step 5: Commit**

```bash
git add src/modules/sheet/catalogue.service.ts tests/modules/sheet/catalogue.service.test.ts
git commit -m "feat(sheet): dich vu doc catalogue kem bo dem 60 giay"
```

---

### Task 7: Cache ảnh Drive vào Storage

**Files:**
- Modify: `src/modules/media/storage.ts`
- Create: `src/modules/media/anh-drive.ts`
- Test: `tests/modules/media/anh-drive.test.ts`

**Interfaces:**
- Consumes: `taiTepDrive` từ `drive.client.ts`; `tinhKichThuocMoi` từ `image-processor.ts`
- Produces:
  - trong `storage.ts`: `function dungKhoaAnhSheet(fileId: string, canhDai: number): string` và `function tepTonTai(khoa: string): Promise<boolean>`
  - trong `anh-drive.ts`: `const CANH_DAI_ANH_SHEET = 600` và `function layUrlAnhSheet(fileId: string): Promise<string>`

Không dùng `xuLyAnh` sẵn có: nó sinh **ba** biến thể 400/1200/2000, còn màn hình này chỉ cần một biến thể 600. Nhưng **phải** dùng lại `tinhKichThuocMoi` và luật "chỉ truyền một chiều ràng buộc" — truyền cả hai chiều kèm `fit:"inside"` làm sharp làm tròn hai lần và lệch 1px.

- [ ] **Step 1: Viết test thất bại**

Tạo `tests/modules/media/anh-drive.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { LoiAnhKhongHopLe } from "@/modules/media/image-processor";

const taiTepDrive = vi.fn();
vi.mock("@/modules/sheet/drive.client", () => ({ taiTepDrive }));

const { layUrlAnhSheet, CANH_DAI_ANH_SHEET } = await import("@/modules/media/anh-drive");
const { dungKhoaAnhSheet, tepTonTai, xoaTep } = await import("@/modules/media/storage");

// randomUUID, khong dung Date.now(): bucket la that va dung chung giua cac lan
// chay (ke ca CI), do phan giai mili-giay co the trung nhau. Xem anh-url.test.ts.
const FILE_ID = `test-${randomUUID()}`;
const khoa = dungKhoaAnhSheet(FILE_ID, CANH_DAI_ANH_SHEET);

afterEach(async () => {
  // Bucket la that va dung chung — khong duoc bo lai rac.
  await xoaTep([khoa]).catch(() => {});
  taiTepDrive.mockReset();
});

describe("dungKhoaAnhSheet", () => {
  it("dat duoi tien to rieng, khong lan vao anh san pham", () => {
    expect(dungKhoaAnhSheet("abc", 600)).toBe("sheet-cache/abc-600.webp");
  });
});

describe("layUrlAnhSheet", () => {
  it("tai tu Drive, thu nho, ghi vao Storage roi tra URL co ky", async () => {
    const to = await sharp({
      create: { width: 2000, height: 1500, channels: 3, background: "#ffffff" },
    }).jpeg().toBuffer();
    taiTepDrive.mockResolvedValue(to);

    const url = await layUrlAnhSheet(FILE_ID);

    expect(url).toContain("http");
    expect(await tepTonTai(khoa)).toBe(true);
    expect(taiTepDrive).toHaveBeenCalledOnce();
  }, 30000);

  it("lan thu hai KHONG goi lai Drive", async () => {
    const to = await sharp({
      create: { width: 800, height: 800, channels: 3, background: "#ffffff" },
    }).jpeg().toBuffer();
    taiTepDrive.mockResolvedValue(to);

    await layUrlAnhSheet(FILE_ID);
    await layUrlAnhSheet(FILE_ID);

    expect(taiTepDrive).toHaveBeenCalledOnce();
  }, 30000);

  it("thu nho ve dung canh dai 600 va chuyen sang webp", async () => {
    const to = await sharp({
      create: { width: 2000, height: 1000, channels: 3, background: "#ffffff" },
    }).jpeg().toBuffer();
    taiTepDrive.mockResolvedValue(to);

    await layUrlAnhSheet(FILE_ID);

    // Doc lai chinh tep da ghi de kiem, thay vi tin vao gia tri trung gian.
    const { taiVe } = await import("@/modules/media/storage");
    const meta = await sharp(await taiVe(khoa)).metadata();
    expect(meta.width).toBe(600);
    expect(meta.height).toBe(300);
    expect(meta.format).toBe("webp");
  }, 30000);

  it("tu choi voi loi mien nguyen khi Drive tra ve du lieu khong phai anh", async () => {
    taiTepDrive.mockResolvedValue(Buffer.from("khong phai anh"));

    await expect(layUrlAnhSheet(FILE_ID)).rejects.toBeInstanceOf(LoiAnhKhongHopLe);
  }, 30000);
});
```

- [ ] **Step 2: Chạy test để chắc chắn nó đỏ**

Run: `npx vitest run tests/modules/media/anh-drive.test.ts`
Expected: FAIL — `dungKhoaAnhSheet` chưa tồn tại.

- [ ] **Step 3: Thêm ba hàm vào `src/modules/media/storage.ts`**

Thêm vào cuối file:

```ts
/** Tien to rieng, tach khoi anh san pham do nguoi dung tai len. */
export function dungKhoaAnhSheet(fileId: string, canhDai: number): string {
  return `sheet-cache/${fileId}-${canhDai}.webp`;
}

export async function tepTonTai(khoa: string): Promise<boolean> {
  const cat = khoa.lastIndexOf("/");
  const thuMuc = cat === -1 ? "" : khoa.slice(0, cat);
  const ten = cat === -1 ? khoa : khoa.slice(cat + 1);
  const { data, error } = await kho.list(thuMuc, { search: ten, limit: 100 });
  if (error) throw new Error(`Không liệt kê được ${thuMuc}: ${error.message}`);
  return (data ?? []).some((t) => t.name === ten);
}

export async function taiVe(khoa: string): Promise<Buffer> {
  const { data, error } = await kho.download(khoa);
  if (error || !data) throw new Error(`Không tải được tệp ${khoa}: ${error?.message}`);
  return Buffer.from(await data.arrayBuffer());
}
```

- [ ] **Step 4: Viết `src/modules/media/anh-drive.ts`**

```ts
import sharp, { type Metadata } from "sharp";
import { taiTepDrive } from "@/modules/sheet/drive.client";
import { LoiAnhKhongHopLe, tinhKichThuocMoi } from "./image-processor";
import { dungKhoaAnhSheet, ghiTep, layUrlCoKy, tepTonTai } from "./storage";

export const CANH_DAI_ANH_SHEET = 600;
const HAN_URL_GIAY = 3600;

/**
 * Tra URL co ky cho anh Drive, tai va cache khi chua co.
 * Anh goc tren Drive nang vai MB toi hon chuc MB; ban 600px con khoang 40 KB.
 */
export async function layUrlAnhSheet(fileId: string): Promise<string> {
  const khoa = dungKhoaAnhSheet(fileId, CANH_DAI_ANH_SHEET);

  if (!(await tepTonTai(khoa))) {
    const goc = await taiTepDrive(fileId);
    // taiTepDrive chi kiem tra HTTP OK, khong kiem content-type/do dai — Drive co
    // the tra ve mot than tep cut hoac khong phai anh. Boc metadata() nhu quy uoc
    // trong image-processor.ts de doi thanh loi mien nguyen, khong phai loi sharp tho.
    let meta: Metadata;
    try {
      meta = await sharp(goc).metadata();
    } catch (e) {
      throw new LoiAnhKhongHopLe(e instanceof Error ? e.message : String(e));
    }
    if (!meta.width || !meta.height) {
      throw new LoiAnhKhongHopLe("không đọc được kích thước");
    }
    const kt = tinhKichThuocMoi(meta.width, meta.height, CANH_DAI_ANH_SHEET);
    // Chi truyen MOT chieu — truyen ca hai kem fit:"inside" lam sharp lam tron
    // hai lan roi lech 1px. Xem chu thich trong image-processor.ts.
    const rangBuoc = meta.width >= meta.height ? { width: kt.width } : { height: kt.height };
    // metadata() chi doc header nen tep bi cat ngang giua chung van qua duoc
    // buoc kiem tra o tren; loi that chi lo ra khi resize/encode phai quet het
    // du lieu anh. Boc rieng buoc nay de doi loi libvips tho thanh loi mien nguyen.
    let nho: Buffer;
    try {
      nho = await sharp(goc)
        .rotate()
        .resize({ ...rangBuoc, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    } catch (e) {
      throw new LoiAnhKhongHopLe(e instanceof Error ? e.message : String(e));
    }
    await ghiTep(khoa, nho, "image/webp");
  }

  return layUrlCoKy(khoa, HAN_URL_GIAY);
}
```

- [ ] **Step 5: Chạy test để chắc chắn nó xanh**

Run: `npx vitest run tests/modules/media/anh-drive.test.ts`
Expected: PASS — 5 test xanh. Test này chạm Storage thật nên cần `.env.local`.

- [ ] **Step 6: Commit**

```bash
git add src/modules/media/storage.ts src/modules/media/anh-drive.ts tests/modules/media/anh-drive.test.ts
git commit -m "feat(media): cache anh Drive vao Storage duoi dang webp 600px"
```

---

### Task 8: Route proxy ảnh

**Files:**
- Create: `src/app/api/anh-drive/[fileId]/route.ts`
- Test: `tests/app/anh-drive-route.test.ts`

**Interfaces:**
- Consumes: `layUrlAnhSheet` từ `anh-drive.ts`; `getSessionUser` từ `@/auth/guard`
- Produces: `GET(req, { params })` trả `302` sang URL có ký, `401` khi chưa đăng nhập, `400` khi `fileId` không hợp lệ

Route dùng `getSessionUser()` chứ không dùng `requireUser()`: `requireUser` gọi `redirect("/login")`, mà chuyển hướng một thẻ `<img>` sang trang đăng nhập thì trình duyệt chỉ hiện ảnh vỡ. `401` là câu trả lời đúng cho một tài nguyên.

- [ ] **Step 1: Viết test thất bại**

Tạo `tests/app/anh-drive-route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionUser = vi.fn();
const layUrlAnhSheet = vi.fn();
vi.mock("@/auth/guard", () => ({ getSessionUser }));
vi.mock("@/modules/media/anh-drive", () => ({ layUrlAnhSheet }));

const { GET } = await import("@/app/api/anh-drive/[fileId]/route");

const NGUOI_DUNG = { id: "u1", email: "a@b.c", fullName: "A", role: "sale", isActive: true };
const goi = (fileId: string) =>
  GET(new Request("http://x/api/anh-drive/x"), { params: Promise.resolve({ fileId }) });

beforeEach(() => {
  getSessionUser.mockReset();
  layUrlAnhSheet.mockReset();
  layUrlAnhSheet.mockResolvedValue("https://ky.example/anh.webp");
});

describe("GET /api/anh-drive/[fileId]", () => {
  it("tu choi khi chua dang nhap", async () => {
    getSessionUser.mockResolvedValue(null);
    expect((await goi("1AbcDefGhiJkl")).status).toBe(401);
    expect(layUrlAnhSheet).not.toHaveBeenCalled();
  });

  it("tu choi khi tai khoan bi vo hieu hoa", async () => {
    getSessionUser.mockResolvedValue({ ...NGUOI_DUNG, isActive: false });
    expect((await goi("1AbcDefGhiJkl")).status).toBe(401);
  });

  it("tu choi fileId khong hop le — gia tri nay den tu URL", async () => {
    getSessionUser.mockResolvedValue(NGUOI_DUNG);
    for (const xau of ["../../bi-mat", "a", "co khoang trang", "x".repeat(200)]) {
      expect((await goi(xau)).status).toBe(400);
    }
    expect(layUrlAnhSheet).not.toHaveBeenCalled();
  });

  it("chuyen huong sang URL co ky khi hop le", async () => {
    getSessionUser.mockResolvedValue(NGUOI_DUNG);
    const res = await goi("1AbcDefGhiJkl");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://ky.example/anh.webp");
  });

  it("tra 502 khi Drive hong, khong nem ra ngoai", async () => {
    getSessionUser.mockResolvedValue(NGUOI_DUNG);
    layUrlAnhSheet.mockRejectedValue(new Error("drive hong"));
    expect((await goi("1AbcDefGhiJkl")).status).toBe(502);
  });
});
```

- [ ] **Step 2: Chạy test để chắc chắn nó đỏ**

Run: `npx vitest run tests/app/anh-drive-route.test.ts`
Expected: FAIL — không phân giải được route.

- [ ] **Step 3: Viết `src/app/api/anh-drive/[fileId]/route.ts`**

```ts
import { getSessionUser } from "@/auth/guard";
import { layUrlAnhSheet } from "@/modules/media/anh-drive";

// fileId den tu duong dan URL nen khong tin duoc. Chan truoc khi dung no
// de dung khoa Storage hay goi Drive.
const DANG_FILE_ID = /^[A-Za-z0-9_-]{10,80}$/;

// URL co ky tra ve chi dung mot lan cho MOT phien va het han sau mot gio
// (xem HAN_URL_GIAY trong anh-drive.ts). Khong gi lien quan toi tuyen nay —
// ke ca trang thai dang nhap — duoc phep nam trong bat ky bo dem trung gian
// nao; mot Location bi cache qua thoi han se tra ra anh vo lang le.
const KHONG_LUU_DEM = "private, no-store";

function phanHoiRong(status: number, headers?: HeadersInit): Response {
  return new Response(null, {
    status,
    headers: { "Cache-Control": KHONG_LUU_DEM, ...headers },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ fileId: string }> },
): Promise<Response> {
  const user = await getSessionUser();
  if (user === null || !user.isActive) {
    return phanHoiRong(401);
  }

  const { fileId } = await params;
  if (!DANG_FILE_ID.test(fileId)) {
    return phanHoiRong(400);
  }

  try {
    const url = await layUrlAnhSheet(fileId);
    return phanHoiRong(302, { Location: url });
  } catch (loi) {
    // Mot anh hong khong duoc lam hong ca luoi — nguoi goi (tag <img>) chi
    // nhan 502 rong, khong bao gio lo van ban loi tho cua libvips/Drive ra
    // ngoai. Nhung neu khong ghi lai o day thi ca bon nguyen nhan co the xay
    // ra (Drive thieu/khong truy cap duoc, anh khong hop le tuc LoiAnhKhongHopLe,
    // Supabase Storage sap, hay sai khoa service account) deu bien mat khong
    // dau vet — khong con gi de grep khi anh vo xuat hien hang loat tren luoi.
    console.error(`[anh-drive] loi lay url anh cho fileId=${fileId}:`, loi);
    return phanHoiRong(502);
  }
}
```

- [ ] **Step 4: Chạy test để chắc chắn nó xanh**

Run: `npx vitest run tests/app/anh-drive-route.test.ts`
Expected: PASS — 7 test xanh (5 gốc + 2 test bổ sung sau review: mọi phản hồi mang
`Cache-Control: private, no-store`, và lỗi từ `layUrlAnhSheet` được ghi log phía
server bằng `console.error` kèm `fileId`, trong khi thân phản hồi cho trình duyệt
vẫn rỗng và status vẫn `502`).

- [ ] **Step 5: Chứng minh chốt đăng nhập thật sự chặn**

Tạm bỏ hai dòng `if (user === null || !user.isActive)`, chạy lại test. Hai test đầu **phải đỏ**. Khôi phục rồi chạy lại cho xanh.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/anh-drive tests/app/anh-drive-route.test.ts
git commit -m "feat(api): proxy anh Drive co chot dang nhap va bo dem"
```

---

### Task 9: Trang lưới

**Files:**
- Create: `src/app/admin/catalogue-sheet/page.tsx`
- Create: `src/app/admin/catalogue-sheet/bo-loc.tsx`
- Modify: `src/messages/vi.ts`
- Modify: `src/app/admin/layout.tsx`

**Interfaces:**
- Consumes: `layDanhSachCatalogue`, `docBoLocTuUrl`, `locDanhSach`, `tinhThongKe`, `requireUser`, `vi`
- Produces: trang tại `/admin/catalogue-sheet`

Bộ lọc là **form GET server component**, giống `src/app/admin/products/bo-loc.tsx` — không cần `"use client"`, không cần JavaScript phía client.

- [ ] **Step 1: Thêm chuỗi hiển thị vào `src/messages/vi.ts`**

Thêm khối này vào trong đối tượng `vi`, sau khối `san_pham`:

```ts
  catalogue_sheet: {
    tieu_de: "Catalogue nhẫn",
    nguon: "Nguồn — bảng tính trực tuyến",
    tim_kiem_nhan: "Tìm mã mẫu, SKU hoặc mô tả",
    chat_lieu: "Chất liệu",
    loai_xoan: "Loại xoàn",
    xoan_lab: "Xoàn lab",
    xoan_tu_nhien: "Xoàn tự nhiên",
    tat_ca: "Tất cả",
    chi_canh_bao: "Chỉ dòng có cảnh báo",
    loc: "Lọc",
    xoa_loc: "Xoá lọc",
    dem_mau: "Mẫu",
    dem_thieu_anh: "Thiếu ảnh",
    dem_thieu_sku: "Thiếu SKU",
    dem_tl_vang_lech: "Lệch TL vàng",
    chua_co_anh: "Chưa có ảnh",
    mo_thu_muc: "Mở thư mục ảnh",
    khong_khop: "Không có mẫu nào khớp bộ lọc.",
    co_thieu_sku: "Thiếu SKU",
    co_thieu_anh: "Thiếu ảnh",
    co_thieu_mo_ta: "Thiếu mô tả",
    co_trung: "Trùng dòng",
    co_tl_vang_lech: "Lệch TL vàng",
    loi_doc_bang: "Không đọc được bảng tính. Kiểm tra cấu hình nguồn dữ liệu rồi thử lại.",
  },
```

- [ ] **Step 2: Viết `src/app/admin/catalogue-sheet/bo-loc.tsx`**

```tsx
import type { ThongKe } from "@/modules/sheet/catalogue.view";
import type { BoLocCatalogue } from "@/modules/sheet/catalogue.view";
import { vi } from "@/messages/vi";

const NHAN_EYEBROW = "block text-[11px] uppercase tracking-[0.14em] text-hp-muted";

function MucLoc({
  ten, giaTri, hienTai, nhan, soLuong,
}: {
  ten: string; giaTri: string; hienTai: string | null; nhan: string; soLuong?: number;
}) {
  const dangBat = (hienTai ?? "") === giaTri;
  return (
    <label className="cursor-pointer">
      <input type="radio" name={ten} value={giaTri} defaultChecked={dangBat} className="sr-only peer" />
      <span
        className={`inline-block border-b-2 pb-0.5 text-[11px] uppercase tracking-[0.14em]
                    transition-colors duration-150
                    ${dangBat ? "border-hp-pink text-hp-ink" : "border-transparent text-hp-muted hover:text-hp-ink"}`}
      >
        {nhan}
        {soLuong !== undefined && <span className="ml-1.5 tabular-nums">{soLuong}</span>}
      </span>
    </label>
  );
}

export function ThanhBoLoc({ thongKe, hienTai }: { thongKe: ThongKe; hienTai: BoLocCatalogue }) {
  return (
    <form method="get" className="mb-10 space-y-6">
      <div className="max-w-sm">
        <label className={NHAN_EYEBROW} htmlFor="q">
          {vi.catalogue_sheet.tim_kiem_nhan}
        </label>
        <input
          id="q" name="q" defaultValue={hienTai.q ?? ""}
          className="mt-2 w-full border-0 border-b border-hp-rule bg-transparent px-0.5 py-1.5
                     font-body text-base text-hp-body transition-colors duration-150
                     focus:border-b-2 focus:border-hp-pink focus:pb-[5px] focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
        <span className={`${NHAN_EYEBROW} w-24`}>{vi.catalogue_sheet.chat_lieu}</span>
        <MucLoc ten="chat_lieu" giaTri="" hienTai={hienTai.chatLieu}
                nhan={vi.catalogue_sheet.tat_ca} soLuong={thongKe.tong} />
        {thongKe.theoChatLieu.map((m) => (
          <MucLoc key={m.gia_tri} ten="chat_lieu" giaTri={m.gia_tri} hienTai={hienTai.chatLieu}
                  nhan={m.gia_tri} soLuong={m.soLuong} />
        ))}
      </div>

      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
        <span className={`${NHAN_EYEBROW} w-24`}>{vi.catalogue_sheet.loai_xoan}</span>
        <MucLoc ten="loai_xoan" giaTri="" hienTai={hienTai.loaiXoan}
                nhan={vi.catalogue_sheet.tat_ca} />
        {thongKe.theoLoaiXoan.map((m) => (
          <MucLoc key={m.gia_tri} ten="loai_xoan" giaTri={m.gia_tri} hienTai={hienTai.loaiXoan}
                  nhan={m.gia_tri === "lab" ? vi.catalogue_sheet.xoan_lab : vi.catalogue_sheet.xoan_tu_nhien}
                  soLuong={m.soLuong} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          <input type="checkbox" name="canh_bao" value="1" defaultChecked={hienTai.chiCanhBao}
                 className="accent-hp-pink-strong" />
          {vi.catalogue_sheet.chi_canh_bao}
        </label>

        <button
          className="rounded-sm bg-hp-ink px-[22px] py-[14px] text-xs uppercase tracking-[0.14em]
                     text-hp-foundation transition-colors duration-150 hover:bg-hp-pink-strong"
        >
          {vi.catalogue_sheet.loc}
        </button>

        <a href="/admin/catalogue-sheet"
           className="text-[11px] uppercase tracking-[0.14em] text-hp-muted hover:text-hp-ink">
          {vi.catalogue_sheet.xoa_loc}
        </a>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Viết `src/app/admin/catalogue-sheet/page.tsx`**

```tsx
import { requireUser } from "@/auth/guard";
import { layDanhSachCatalogue } from "@/modules/sheet/catalogue.service";
import { docBoLocTuUrl, locDanhSach, tinhThongKe } from "@/modules/sheet/catalogue.view";
import type { CoBatThuong, DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import { ThanhBoLoc } from "./bo-loc";
import { vi } from "@/messages/vi";

const NHAN_CO: Record<CoBatThuong, string> = {
  "thieu-sku": vi.catalogue_sheet.co_thieu_sku,
  "thieu-anh": vi.catalogue_sheet.co_thieu_anh,
  "thieu-mo-ta": vi.catalogue_sheet.co_thieu_mo_ta,
  "trung": vi.catalogue_sheet.co_trung,
  "tl-vang-lech": vi.catalogue_sheet.co_tl_vang_lech,
};

/** Chuan tieng Viet dung dau phay thap phan, du bang tinh ghi dau cham. */
function dinhDangGam(v: number | null): string | null {
  return v === null ? null : `${v.toFixed(2).replace(".", ",")} g`;
}

function O({ so, nhan }: { so: number; nhan: string }) {
  return (
    <div className="px-6 first:pl-0">
      <p className="font-title text-2xl tabular-nums text-hp-ink">{so}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-hp-muted">{nhan}</p>
    </div>
  );
}

function The({ d }: { d: DongCatalogue }) {
  return (
    <li className="border border-hp-rule bg-hp-card">
      <div className="flex aspect-[4/5] items-center justify-center bg-hp-inset">
        {d.fileIdAnh ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/anh-drive/${d.fileIdAnh}`}
            alt={d.maMau ?? ""}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
            {vi.catalogue_sheet.chua_co_anh}
          </span>
        )}
      </div>

      <div className="p-5">
        {d.chatLieu && (
          <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
            {d.chatLieu}
          </span>
        )}
        <h3 className="mt-1 font-title text-xl leading-tight text-hp-ink">{d.maMau ?? "—"}</h3>

        <p className="mt-2 flex flex-wrap gap-x-4 text-sm tabular-nums text-hp-body">
          {dinhDangGam(d.tlVang) && <span>{dinhDangGam(d.tlVang)}</span>}
          {d.size && <span>Size {d.size}</span>}
        </p>

        {d.co.length > 0 && (
          <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-hp-muted">
            {d.co.map((c) => NHAN_CO[c]).join(" · ")}
          </p>
        )}

        {d.urlThuMuc && (
          <a href={d.urlThuMuc} target="_blank" rel="noreferrer"
             className="mt-3 inline-block text-[10px] uppercase tracking-[0.14em] text-hp-muted
                        transition-colors duration-150 hover:text-hp-ink hover:underline">
            {vi.catalogue_sheet.mo_thu_muc}
          </a>
        )}
      </div>
    </li>
  );
}

export default async function TrangCatalogueSheet({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireUser();
  const sp = await searchParams;
  const loc = docBoLocTuUrl(sp);

  let tatCa: DongCatalogue[];
  try {
    tatCa = await layDanhSachCatalogue();
  } catch {
    return (
      <p className="text-sm text-hp-pink-strong">{vi.catalogue_sheet.loi_doc_bang}</p>
    );
  }

  const thongKe = tinhThongKe(tatCa);
  const ds = locDanhSach(tatCa, loc);

  return (
    <>
      <div className="mb-8">
        <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {vi.catalogue_sheet.nguon}
        </span>
        <h1 className="mt-2 font-title text-[28px] leading-tight text-hp-ink">
          {vi.catalogue_sheet.tieu_de}
        </h1>
        <div className="mt-4 h-px bg-hp-rule" />
      </div>

      <div className="mb-10 flex divide-x divide-hp-rule">
        <O so={thongKe.tong} nhan={vi.catalogue_sheet.dem_mau} />
        <O so={thongKe.thieuAnh} nhan={vi.catalogue_sheet.dem_thieu_anh} />
        <O so={thongKe.thieuSku} nhan={vi.catalogue_sheet.dem_thieu_sku} />
        <O so={thongKe.tlVangLech} nhan={vi.catalogue_sheet.dem_tl_vang_lech} />
      </div>

      <ThanhBoLoc thongKe={thongKe} hienTai={loc} />

      {ds.length === 0 ? (
        <p className="text-sm text-hp-muted">{vi.catalogue_sheet.khong_khop}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {ds.map((d) => <The key={d.dongSheet} d={d} />)}
        </ul>
      )}
    </>
  );
}
```

- [ ] **Step 4: Thêm mục điều hướng vào `src/app/admin/layout.tsx`**

Thêm khoá vào `vi.dieu_huong` trong `src/messages/vi.ts`:

```ts
    catalogue_sheet: "Catalogue (bảng tính)",
```

Rồi thêm link vào `layout.tsx`, ngay sau link `/admin/products`:

```tsx
        <Link href="/admin/catalogue-sheet" className="rounded px-2 py-1 text-sm hover:bg-neutral-100">
          {vi.dieu_huong.catalogue_sheet}
        </Link>
```

- [ ] **Step 5: Chạy typecheck, lint và toàn bộ test**

Run: `npm run typecheck && npm run lint && npm test`
Expected: typecheck sạch, lint sạch, toàn bộ test xanh. **Dán nguyên dòng tổng kết pass/fail, không cắt bớt.**

Bộ test của dự án chập chờn khoảng 1 lần hỏng trên 7 lần chạy và nguyên nhân chưa tìm ra. Nếu đỏ, chạy lại một lần để phân biệt lỗi thật với chập chờn — nhưng **không** chạy lại quá một lần rồi coi là xanh.

- [ ] **Step 6: Kiểm bằng mắt trên trình duyệt**

Run: `npm run dev`

Mở `http://localhost:3000/admin/catalogue-sheet` và xác nhận:

1. Số thẻ bằng số dòng dữ liệu trong tab nguồn
2. Dải số khớp với số thẻ mang từng loại cảnh báo
3. Thẻ không có ảnh hiện khối `Chưa có ảnh`, không phải icon vỡ
4. Lọc theo một chất liệu cho ra đúng số thẻ ghi trên nhãn bộ lọc
5. Gõ từ khoá có dấu và không dấu đều ra kết quả
6. Tải lại trang lần hai, ảnh hiện gần như tức thì (đã cache)
7. Mở `/api/anh-drive/<id>` ở cửa sổ ẩn danh — bị từ chối

- [ ] **Step 7: Commit**

```bash
git add src/app/admin/catalogue-sheet src/messages/vi.ts src/app/admin/layout.tsx
git commit -m "feat(catalogue): luoi anh doc tu bang tinh theo he thiet ke Hung Phat"
```

---

## Sau khi xong

- [ ] Kiểm `git remote -v` — phải là `quocviet-IT`. Rồi `git push -u origin feat/m0-m1-catalogue`.
- [ ] Cập nhật `docs/BAN-GIAO.md`: thêm màn hình mới vào danh sách "chạy được đầu-cuối", và ghi bốn biến môi trường mới vào phần `.env.local`.
