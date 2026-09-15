# Ba bố cục xu hướng 2026 (Khung Art Deco, Thẻ tiêu bản, Chữ lớn) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm ba bố cục catalogue theo xu hướng 2026 — Khung Art Deco (`art-deco`), Thẻ tiêu bản (`tieu-ban`), Chữ lớn (`chu-lon`) — cho trang khách, bản Xem trước, bảng chọn và trang Hướng dẫn, theo spec `docs/superpowers/specs/2026-09-15-bo-cuc-xu-huong-design.md`.

**Architecture:** Phần dùng chung của mọi bố cục (`Anh`, `MaMau`, `thongSo`…) được chuyển nguyên từ `bo-cuc.tsx` sang `bo-cuc-chung.tsx`. Ba bố cục mới nằm trong `bo-cuc-xu-huong.tsx`, chỉ import từ tệp chung, và được đăng ký vào bảng `BANG` của `bo-cuc.tsx`. Quy tắc chọn chữ cỡ poster là hàm thuần `chuLonCuaMau` trong `giao-dien.model.ts`. Component được kiểm bằng `renderToStaticMarkup` trong Vitest.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, TypeScript 5, Vitest 4 (node, `react-dom/server`), Playwright (tsx).

## Global Constraints

- Repo: `C:\Users\pit010\catalogue-quote-system`, nhánh `main`, commit cục bộ; push chỉ ở Task 8 khi anh cho phép, bằng tài khoản quocviet-IT. Repo CÔNG KHAI: stage TỪNG FILE, không bao giờ `git add -A`/`git add .`.
- `BO_CUC` CHỈ THÊM VÀO CUỐI, đúng thứ tự: `"art-deco"`, `"tieu-ban"`, `"chu-lon"`. Không đổi `GIAO_DIEN_MAC_DINH`, `CHU_DE`, `docGiaoDien`. Không migration.
- Tám bố cục cũ phải ra ĐÚNG Y markup cũ sau khi tách tệp (Task 2 chứng minh bằng snapshot tạm).
- `bo-cuc-xu-huong.tsx` chỉ import từ `./bo-cuc-chung`, `@/modules/...`, `@/messages` — KHÔNG import từ `./bo-cuc` (tránh vòng lặp import).
- Mỗi bố cục mới: gốc `<ul data-bo-cuc="<khoá>">` (Thẻ tiêu bản: `ul` nằm trong một `div` bọc, `data-bo-cuc` vẫn trên `ul`); mỗi mẫu một `<li data-muc={i}>`; duyệt mẫu và ảnh theo đúng thứ tự gốc; được phép chỉ hiện một phần ảnh.
- KHÔNG chữ nào đè lên ảnh (ảnh đè ảnh thì được).
- Chữ lớn: `chuLonCuaMau(m, g.hien)` — Loại SP (nếu `hien.loaiSp` và có giá trị) → Chất liệu (nếu `hien.chatLieu` và có giá trị) → Mã mẫu → `null` (hiện `catalogue_sheet.chua_co_ma_mau`); chuỗi chỉ khoảng trắng coi như trống; trả chuỗi đã cắt khoảng trắng hai đầu.
- Chỉ dùng token màu có sẵn (`hp-ink`, `hp-body`, `hp-muted`, `hp-rule`, `hp-pink`, `hp-foundation`, `hp-plate`); hoạ tiết SVG vẽ bằng `text-hp-pink` (màu nhấn, `.mau-nhan` của trang tự chọn sắc theo tông), `aria-hidden`. Không thêm biến CSS.
- In: `li` của Khung Art Deco và Chữ lớn có `print:break-after-page`; Thẻ tiêu bản in 3 cột, thẻ `break-inside-avoid`.
- Chữ (đúng từng chữ), `vi.ts` / `en.ts`:
  - `mau_giao_dien.bo_cuc_art_deco` = "Khung Art Deco" / "Art Deco frame"
  - `mau_giao_dien.bo_cuc_art_deco_mo_ta` = "Khung kẻ đôi, góc bậc thang, ảnh lớn kèm huy hiệu ảnh chi tiết. Xu hướng 2026 — hợp nhẫn cưới, kim cương, khách VIP." / "Double-ruled frame with stepped corners, a large picture and a detail medallion. A 2026 trend — suits bridal, diamonds and VIP clients."
  - `mau_giao_dien.bo_cuc_tieu_ban` = "Thẻ tiêu bản" / "Specimen sheet"
  - `mau_giao_dien.bo_cuc_tieu_ban_mo_ta` = "Nhiều mẫu một trang như tủ trưng bày bảo tàng: ảnh nền trắng, nhãn số Nº. Xu hướng 2026 — lướt nhanh, gửi nhiều mẫu." / "Many models per page, like a museum case: white-ground pictures with Nº labels. A 2026 trend — quick to browse, good for many models."
  - `mau_giao_dien.bo_cuc_chu_lon` = "Chữ lớn" / "Big type"
  - `mau_giao_dien.bo_cuc_chu_lon_mo_ta` = "Mỗi mẫu một trang, loại sản phẩm viết cỡ poster phía trên ảnh. Xu hướng 2026 — mở đầu ấn tượng, hợp ít mẫu." / "One page per model, with the product type set poster-size above the picture. A 2026 trend — a bold first impression, best for a few models."
  - `chia_se.tieu_ban_so` = "Nº {n}" / "Nº {n}"
  - Dòng đếm của Thẻ tiêu bản dùng khoá CÓ SẴN `chia_se.khach_gom` ("{n} mẫu" / "{n} models") — cùng chữ spec định cho `tieu_ban_dem`, nên KHÔNG thêm khoá `tieu_ban_dem`.
- Chú thích trong code viết KHÔNG DẤU (lối cả repo); chữ hiện trên giao diện có dấu.
- Scratchpad: `$S = "C:\Users\pit010\AppData\Local\Temp\claude\C--Users-pit010-QUICKBOOK-WEBAPP--claude-worktrees-strange-dirac-fe8335\89331c5e-4e2b-46fc-9bff-e8a5a7b42926\scratchpad"`.
- Commit message tiếng Việt, ghi bằng Write ra tệp UTF-8 `$S\commit-msg.txt` (Read trước nếu tệp đã có, rồi ghi đè), `git commit -F "$S\commit-msg.txt"`; dòng cuối `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` (repo này mọi commit có trailer; memory "không gắn Claude" chỉ áp cho repo kế toán).
- Test: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run [đường dẫn]` (KHÔNG cắt output; đọc dòng `Test Files` và `Tests`). `npx tsc --noEmit`. `npx eslint` (11 cảnh báo cũ ở `products.service.ts`, `tests/lib/env.test.ts`; phải 0 errors). Test component đặt tên `*.test.ts` (vitest chỉ nhận `.test.ts`), dùng `createElement` + `renderToStaticMarkup`, và `vi.mock("@/messages/dung-chu")` vì `AnhTai` gọi `useChu` mà module thật kéo theo server action.
- Máy chủ cục bộ cổng 3100 (dùng chung DB production): khởi động detached `Start-Process cmd -ArgumentList '/c', "npx next start -p 3100 > `"$S\server-3100.log`" 2>&1" -WorkingDirectory C:\Users\pit010\catalogue-quote-system -WindowStyle Hidden`; đợi `curl.exe -s -o NUL -w "%{http_code}" http://localhost:3100/login` ra `200`; dừng CHỈ bằng `Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | % { Stop-Process -Id $_.OwningProcess -Force }`. Dừng trước `npm run build` và khi xong task.
- Lệnh dài (build, capture, E2E) chạy TIỀN CẢNH với timeout dài; không kết thúc lượt để chờ thông báo của lệnh nền.
- Script Playwright: tài khoản tạm và catalogue tạm XOÁ trong `finally`; hẹn giờ `setTimeout(() => trinhDuyet?.close(), N).unref()`; callback truyền vào `evaluate()`/`evaluateAll()` là hàm KHÔNG TÊN, chỉ nhận dữ liệu trần. Script tạm tên `scripts/tmp-*.mts`, không commit.
- Ảnh hướng dẫn trong `public/` là CÔNG KHAI; ảnh E2E chỉ nằm trong `$S`, không commit, không đăng.
- Không chạy migration, không push (trừ Task 8 do controller làm khi anh cho phép). Mỗi lượt sửa một tệp một thao tác Edit.

---

## Cấu trúc tệp

| Tệp | Việc |
|---|---|
| `src/modules/catalogue-share/giao-dien.model.ts` | `chuLonCuaMau`; `BO_CUC` thêm ba khoá |
| `tests/modules/catalogue-share/giao-dien.model.test.ts` | test `chuLonCuaMau`, test thứ tự `BO_CUC` |
| `src/app/catalogue/[slug]/bo-cuc-chung.tsx` (mới) | phần dùng chung chuyển nguyên từ `bo-cuc.tsx` |
| `src/app/catalogue/[slug]/bo-cuc-xu-huong.tsx` (mới) | `KhungArtDeco`, `TheTieuBan`, `ChuLon` + hoạ tiết SVG |
| `src/app/catalogue/[slug]/bo-cuc.tsx` | import từ tệp chung; `BANG` thêm ba khoá |
| `src/app/catalogue/tao/chon-giao-dien.tsx` | `nhanBoCuc`, `HinhBoCuc` cho ba khoá |
| `src/messages/vi.ts`, `src/messages/en.ts` | chữ mới |
| `tests/app/bo-cuc-xu-huong.test.ts` (mới) | test markup ba bố cục |
| `src/messages/huong-dan.vi.ts`, `huong-dan.en.ts` | "Mười một bố cục", ảnh chính |
| `scripts/chup-huong-dan.mts` | khung nhìn cao hơn ở bước 7b |
| `public/huong-dan/07-bo-cuc-mau.png`, `en/07-bo-cuc-mau.png`, `diem.json` ×2 | chụp lại |

---

### Task 1: Quy tắc chữ lớn — `chuLonCuaMau`

**Files:**
- Modify: `src/modules/catalogue-share/giao-dien.model.ts` (sau hàm `chuDeDangChon`)
- Modify: `tests/modules/catalogue-share/giao-dien.model.test.ts` (import dòng 12; thêm cuối tệp)

**Interfaces:**
- Produces:
  ```ts
  export function chuLonCuaMau(
    m: { loaiSp: string | null; chatLieu: string | null; maMau: string | null },
    hien: { loaiSp: boolean; chatLieu: boolean },
  ): string | null;
  ```

- [ ] **Step 1: Thêm import vào tệp test**

Trong `tests/modules/catalogue-share/giao-dien.model.test.ts`, thay:

```ts
  chuDeDangChon,
  THONG_SO,
```

bằng:

```ts
  chuDeDangChon,
  chuLonCuaMau,
  THONG_SO,
```

- [ ] **Step 2: Thêm test vào CUỐI tệp test**

```ts
describe("chuLonCuaMau (15/09/2026)", () => {
  const MAU = { loaiSp: "NHẪN", chatLieu: "Vàng 18K", maMau: "D101" };
  const HIEN = { loaiSp: true, chatLieu: true };

  it("Loại SP hiện và có giá trị → Loại SP", () => {
    expect(chuLonCuaMau(MAU, HIEN)).toBe("NHẪN");
  });

  it("Loại SP bị ẩn → Chất liệu", () => {
    expect(chuLonCuaMau(MAU, { ...HIEN, loaiSp: false })).toBe("Vàng 18K");
  });

  it("Loại SP hiện nhưng trống → Chất liệu", () => {
    expect(chuLonCuaMau({ ...MAU, loaiSp: null }, HIEN)).toBe("Vàng 18K");
  });

  it("cả Loại SP lẫn Chất liệu bị ẩn → Mã mẫu", () => {
    expect(chuLonCuaMau(MAU, { loaiSp: false, chatLieu: false })).toBe("D101");
  });

  it("chỉ khoảng trắng coi như trống; giá trị được cắt khoảng trắng hai đầu", () => {
    expect(chuLonCuaMau({ loaiSp: "   ", chatLieu: "  Vàng 18K ", maMau: "D101" }, HIEN)).toBe("Vàng 18K");
  });

  it("tất cả trống → null", () => {
    expect(chuLonCuaMau({ loaiSp: null, chatLieu: " ", maMau: null }, HIEN)).toBeNull();
  });
});
```

- [ ] **Step 3: Chạy, xác nhận hỏng**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/modules/catalogue-share/giao-dien.model.test.ts`
Expected: FAIL — 6 test mới báo `chuLonCuaMau is not a function`; test cũ vẫn đạt.

- [ ] **Step 4: Cài đặt**

Trong `src/modules/catalogue-share/giao-dien.model.ts`, thay:

```ts
  return c ? c.khoa : null;
}

/** Cac thong so co the bat/tat cho khach xem. Trung ten voi truong cua MucCatalogue. */
```

bằng:

```ts
  return c ? c.khoa : null;
}

/**
 * Chu co poster cua bo cuc Chu lon (15/09/2026).
 *
 * Loai SP -> Chat lieu -> Ma mau: KHONG bao gio in to mot thong so sale da bo tich
 * (hien.loaiSp / hien.chatLieu). Ma mau dung duoc vi no hien o moi bo cuc. Chuoi chi co
 * khoang trang coi nhu trong.
 */
export function chuLonCuaMau(
  m: { loaiSp: string | null; chatLieu: string | null; maMau: string | null },
  hien: { loaiSp: boolean; chatLieu: boolean },
): string | null {
  const ungVien = [hien.loaiSp ? m.loaiSp : null, hien.chatLieu ? m.chatLieu : null, m.maMau];
  for (const v of ungVien) {
    const gon = v?.trim() ?? "";
    if (gon !== "") return gon;
  }
  return null;
}

/** Cac thong so co the bat/tat cho khach xem. Trung ten voi truong cua MucCatalogue. */
```

- [ ] **Step 5: Chạy, xác nhận đạt**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/modules/catalogue-share/giao-dien.model.test.ts`
Expected: PASS, 0 failed.
Run: `npx tsc --noEmit` → không lỗi.

- [ ] **Step 6: Commit**

```bash
git add src/modules/catalogue-share/giao-dien.model.ts tests/modules/catalogue-share/giao-dien.model.test.ts
git diff --cached --name-status
git commit -F "$S\commit-msg.txt"
```

Message:

```
feat(catalogue): quy tắc chữ cỡ poster cho bố cục Chữ lớn

- chuLonCuaMau: Loại SP → Chất liệu → Mã mẫu, bỏ qua thông số sale đã ẩn và chuỗi
  chỉ có khoảng trắng.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 2: Tách phần dùng chung sang `bo-cuc-chung.tsx`

**Files:**
- Create: `src/app/catalogue/[slug]/bo-cuc-chung.tsx`
- Modify: `src/app/catalogue/[slug]/bo-cuc.tsx` (import dòng 1–19; xoá khối `gam` … `mocAnh`)
- Temp (xoá trước commit): `tests/app/tmp-bo-cuc-anh-chup.test.ts` và `tests/app/__snapshots__/tmp-bo-cuc-anh-chup.test.ts.snap`

**Interfaces:**
- Produces (từ `./bo-cuc-chung`): `export type DoiSo = { muc: MucCatalogue[]; g: GiaoDienCatalogue; t: BoChu }`; `export function thongSo(m, g, t): [string, string][]`; `export function mocAnh(muc): number[]`; `export function Anh({ m, fileId, ten, uuTien, tyLe, rong })`; `export function MaMau({ m, t, lop? })`; `export function ThongSoDong({ ds, lop? })`; `export function ThongSoBang({ ds, lop?, gon? })`; `export function DuongTrangTri({ lop })`; `export function GioiThieu({ m, lop? })`. Hành vi y như trước.

- [ ] **Step 1: Snapshot tạm của tám bố cục TRƯỚC khi tách**

Tạo `tests/app/tmp-bo-cuc-anh-chup.test.ts`:

```ts
/** TAM — xoa truoc khi commit. Chung minh tach bo-cuc-chung khong doi markup 8 bo cuc cu. */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { boChu } from "@/messages";
import type { MucCatalogue } from "@/modules/catalogue-share/chia-se.model";
import { BO_CUC, GIAO_DIEN_MAC_DINH } from "@/modules/catalogue-share/giao-dien.model";

vi.mock("@/messages/dung-chu", async () => {
  const { boChu: bo } = await import("@/messages");
  return { useChu: () => bo("vi") };
});

import { ThanCatalogue } from "@/app/catalogue/[slug]/bo-cuc";

const anh = (n: number, tien: string) =>
  Array.from({ length: n }, (_, i) => ({ fileId: `${tien}-${i + 1}`, ten: `IMG_${i + 1}.jpg` }));

const MUC: MucCatalogue[] = [
  { maMau: "D101", loaiSp: "NHẪN", chatLieu: "Vàng 18K", mau: "Vàng", size: "6", tlVang: 2.4, anh: anh(3, "a"), gioiThieu: "Nhẫn cưới đan tay." },
  { maMau: "D102", loaiSp: null, chatLieu: "Vàng trắng 14K", mau: null, size: null, tlVang: null, anh: anh(1, "b") },
  { maMau: null, loaiSp: "DÂY CHUYỀN", chatLieu: null, mau: null, size: null, tlVang: 5.1, anh: anh(6, "c") },
];

describe("TAM — 8 bo cuc cu", () => {
  for (const boCuc of BO_CUC) {
    it(boCuc, () => {
      const g = { ...GIAO_DIEN_MAC_DINH, boCuc };
      expect(renderToStaticMarkup(createElement(ThanCatalogue, { muc: MUC, g, t: boChu("vi") }))).toMatchSnapshot();
    });
  }
});
```

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/app/tmp-bo-cuc-anh-chup.test.ts`
Expected: 8 passed, dòng `Snapshots  8 written`; tệp `tests/app/__snapshots__/tmp-bo-cuc-anh-chup.test.ts.snap` được tạo.

- [ ] **Step 2: Tạo `src/app/catalogue/[slug]/bo-cuc-chung.tsx`**

```tsx
import type { BoChu } from "@/messages";
import { AnhTai } from "@/ui/anh-tai";
import type { MucCatalogue } from "@/modules/catalogue-share/chia-se.model";
import type { GiaoDienCatalogue } from "@/modules/catalogue-share/giao-dien.model";

/**
 * Phan dung chung cua moi bo cuc — tach khoi bo-cuc.tsx ngay 15/09/2026 khi them ba bo
 * cuc xu huong (bo-cuc-xu-huong.tsx). Chuyen NGUYEN, khong doi hanh vi. Nguyen tac chung
 * cua anh (nen plate, ty le 4:3, ma mau la nhan nho) xem dau bo-cuc.tsx.
 */

function gam(v: number | null): string | null {
  return v === null ? null : `${v.toFixed(2).replace(".", ",")} g`;
}

/** Cac thong so duoc phep hien, theo dung lua chon cua sale. */
export function thongSo(m: MucCatalogue, g: GiaoDienCatalogue, t: BoChu): [string, string][] {
  const tatCa: [boolean, string, string | null][] = [
    [g.hien.loaiSp, t.catalogue_sheet.cot_loai_sp, m.loaiSp],
    [g.hien.chatLieu, t.catalogue_sheet.cot_chat_lieu, m.chatLieu],
    [g.hien.mau, t.catalogue_sheet.cot_mau, m.mau],
    [g.hien.size, t.catalogue_sheet.cot_size, m.size],
    [g.hien.tlVang, t.catalogue_sheet.cot_tl_vang, gam(m.tlVang)],
  ];
  return tatCa
    .filter((x): x is [boolean, string, string] => x[0] && x[2] !== null)
    .map(([, nhan, v]) => [nhan, v]);
}

export function Anh({
  m,
  fileId,
  ten,
  uuTien,
  tyLe,
  rong,
}: {
  m: MucCatalogue;
  fileId: string;
  ten: string;
  uuTien: boolean;
  tyLe: string;
  rong: number;
}) {
  return (
    <div
      data-anh={fileId}
      title={ten}
      className={`flex cursor-zoom-in items-center justify-center overflow-hidden
                  bg-hp-plate ${tyLe}`}
    >
      <AnhTai
        src={`/api/anh-drive/${fileId}?w=${rong}`}
        alt={m.maMau ?? ten}
        // Anh dau tien tai ngay; phan con lai cho toi khi khach cuon toi. Mot
        // catalogue 40 mau co the co hon 200 anh.
        tai={uuTien ? "eager" : "lazy"}
        // scale nhe khi re chuot: dau hieu cho biet anh bam duoc, va no khong
        // lam xe dich bat cu thu gi quanh no vi da co overflow-hidden.
        lop="h-full w-full object-contain transition-transform duration-300
             hover:scale-[1.03]"
      />
    </div>
  );
}

/** Ma mau: nhan nho, khong phai tieu de. Voi khach no chi la mot ma tham chieu. */
export function MaMau({ m, t, lop }: { m: MucCatalogue; t: BoChu; lop?: string }) {
  return (
    <span className={`block text-[11px] uppercase tracking-[0.18em] text-hp-muted ${lop ?? ""}`}>
      {m.maMau ?? t.catalogue_sheet.chua_co_ma_mau}
    </span>
  );
}

/** Thong so tren mot dong, ngan cach bang dau cham giua. */
export function ThongSoDong({ ds, lop }: { ds: [string, string][]; lop?: string }) {
  if (ds.length === 0) return null;
  return (
    <p className={`text-sm leading-relaxed text-hp-body ${lop ?? ""}`}>
      {ds.map(([, v]) => v).join(" · ")}
    </p>
  );
}

/**
 * Thong so xep cot, co nhan — dung o bo cuc con nhieu cho. `gon` cho hang cua Bang mau:
 * khoang cach nho hon de nhieu mau vua mot trang.
 */
export function ThongSoBang({ ds, lop, gon }: { ds: [string, string][]; lop?: string; gon?: boolean }) {
  if (ds.length === 0) return null;
  const khoang = gon ? "gap-x-6 gap-y-2" : "gap-x-8 gap-y-4";
  return (
    <dl className={`grid grid-cols-2 ${khoang} sm:grid-cols-4 ${lop ?? ""}`}>
      {ds.map(([nhan, v]) => (
        <div key={nhan}>
          <dt className="text-[10px] uppercase tracking-[0.14em] text-hp-muted">{nhan}</dt>
          <dd className={`${gon ? "mt-0.5" : "mt-1.5"} text-sm text-hp-body`}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Duong trang tri: vach – hat thoi mau nhan – vach. `lop` dat be rong va khoang cach. */
export function DuongTrangTri({ lop }: { lop: string }) {
  return (
    <div aria-hidden className={`flex items-center ${lop}`}>
      <span className="h-px flex-grow bg-hp-rule" />
      <span className="h-1.5 w-1.5 rotate-45 bg-hp-pink" />
      <span className="h-px flex-grow bg-hp-rule" />
    </div>
  );
}

/**
 * Loi gioi thieu sale tu viet cho mot mau (gop y 11/09/2026). Giu dung cho xuong
 * dong sale go. Catalogue cu khong co truong nay thi khong ve gi.
 */
export function GioiThieu({ m, lop }: { m: MucCatalogue; lop?: string }) {
  if (!m.gioiThieu) return null;
  return (
    <p className={`max-w-2xl whitespace-pre-line text-sm leading-relaxed text-hp-body ${lop ?? ""}`}>
      {m.gioiThieu}
    </p>
  );
}

export type DoiSo = { muc: MucCatalogue[]; g: GiaoDienCatalogue; t: BoChu };

/**
 * Vi tri anh dau tien cua tung muc trong mang anh PHANG.
 *
 * Can no de biet anh nao la anh dau ca trang (anh do tai ngay, so con lai cho
 * cuon toi). Tinh truoc thanh mang thay vi cong don trong luc ve: cong don la
 * sua mot bien ben ngoai giua chung render, va React khong bao dam render chay
 * mot lan tu dau den cuoi.
 */
export function mocAnh(muc: MucCatalogue[]): number[] {
  const ra: number[] = [];
  let n = 0;
  for (const m of muc) {
    ra.push(n);
    n += m.anh.length;
  }
  return ra;
}
```

- [ ] **Step 3: `bo-cuc.tsx` — thay khối import**

Thay toàn bộ khối import đầu tệp (dòng 1–19, từ `import { MessageCircle, Phone } from "lucide-react";` tới `import { Logo } from "@/app/thuong-hieu";`) bằng:

```tsx
import { MessageCircle, Phone } from "lucide-react";
import type { BoChu } from "@/messages";
import {
  MAU_NHAN,
  cauKeuGoi,
  coKhoiLienHe,
  lienKetNhan,
  soGoiDuoc,
  type Bia,
  type BoCuc,
  type LienHe,
  type LoiKeuGoi,
  type Nhan,
  type Tone,
} from "@/modules/catalogue-share/giao-dien.model";
import { Logo } from "@/app/thuong-hieu";
import {
  Anh,
  DuongTrangTri,
  GioiThieu,
  MaMau,
  ThongSoBang,
  ThongSoDong,
  mocAnh,
  thongSo,
  type DoiSo,
} from "./bo-cuc-chung";
```

- [ ] **Step 4: `bo-cuc.tsx` — xoá khối đã chuyển**

Xoá TOÀN BỘ đoạn bắt đầu từ dòng `function gam(v: number | null): string | null {` (ngay sau hàm `bienMauNhan`) tới hết hàm `mocAnh` (dòng `  return ra;` và dấu `}` đóng hàm), tức mọi thứ nằm giữa `bienMauNhan` và khối chú thích `/**\n * Bo cuc 1 — danh sach doc.`. Đoạn bị xoá gồm: `gam`, `thongSo`, `Anh`, `MaMau`, `ThongSoDong`, `ThongSoBang`, `DuongTrangTri`, `GioiThieu`, `type DoiSo`, `mocAnh` (và chú thích của chúng). Giữ một dòng trống giữa `bienMauNhan` và chú thích Bố cục 1.

- [ ] **Step 5: Chứng minh markup không đổi, kiểm tra toàn bộ**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/app/tmp-bo-cuc-anh-chup.test.ts`
Expected: 8 passed, KHÔNG có dòng `written`, `updated`, `obsolete` hay `mismatched`.
Run: `npx tsc --noEmit` → không lỗi. Run: `npx eslint` → 0 errors (không cảnh báo mới về import thừa trong `bo-cuc.tsx` / `bo-cuc-chung.tsx`).

- [ ] **Step 6: Xoá snapshot tạm, kiểm tra tổng, commit**

Xoá `tests/app/tmp-bo-cuc-anh-chup.test.ts` và `tests/app/__snapshots__/tmp-bo-cuc-anh-chup.test.ts.snap` (xoá cả thư mục `tests/app/__snapshots__` nếu trống).
Run: vitest cả bộ → 0 failed (đọc toàn bộ output). Dừng máy chủ 3100 nếu có; `npm run build` → thành công.

```bash
git add "src/app/catalogue/[slug]/bo-cuc-chung.tsx" "src/app/catalogue/[slug]/bo-cuc.tsx"
git status --short
git diff --cached --name-status
git commit -F "$S\commit-msg.txt"
```

Expected `git status --short` sau commit: sạch (không còn tệp tạm).

Message:

```
refactor(catalogue): tách phần dùng chung của bố cục sang bo-cuc-chung.tsx

- Chuyển nguyên Anh, MaMau, thongSo, ThongSoDong, ThongSoBang, DuongTrangTri,
  GioiThieu, mocAnh, DoiSo; tám bố cục cũ ra đúng markup cũ (đã so snapshot).
- Chuẩn bị cho ba bố cục xu hướng 2026 nằm ở tệp riêng.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 3: Bố cục Khung Art Deco (`art-deco`)

**Files:**
- Modify: `src/modules/catalogue-share/giao-dien.model.ts:15-20` (`BO_CUC`)
- Create: `src/app/catalogue/[slug]/bo-cuc-xu-huong.tsx`
- Modify: `src/app/catalogue/[slug]/bo-cuc.tsx` (import; `BANG`)
- Modify: `src/app/catalogue/tao/chon-giao-dien.tsx` (`nhanBoCuc`; `HinhBoCuc`)
- Modify: `src/messages/vi.ts:420`, `src/messages/en.ts:408`
- Modify: `tests/modules/catalogue-share/giao-dien.model.test.ts:395-407`
- Create: `tests/app/bo-cuc-xu-huong.test.ts`

**Interfaces:**
- Consumes (Task 2): `Anh`, `GioiThieu`, `mocAnh`, `thongSo`, `type DoiSo` từ `./bo-cuc-chung`.
- Produces: `BoCuc` gồm `"art-deco"`; `export function KhungArtDeco({ muc, g, t }: DoiSo)` trong `bo-cuc-xu-huong.tsx`; tệp test `tests/app/bo-cuc-xu-huong.test.ts` với các hàm dùng chung `ve(Comp, boCuc, hien?)`, `dem(html, chuoi)`, hằng `MUC`, `t` (Task 4, 5 thêm test vào tệp này). Markup: `li[data-muc]`, huy hiệu `div[data-huy-hieu]`.

- [ ] **Step 1: Test thứ tự `BO_CUC` (hỏng trước)**

Trong `tests/modules/catalogue-share/giao-dien.model.test.ts`, thay:

```ts
describe("hai bố cục mới (12/09/2026)", () => {
  it("chỉ thêm vào cuối — thứ tự cũ giữ nguyên", () => {
    expect(BO_CUC).toEqual([
      "danh-sach", "luoi", "lookbook", "trien-lam", "khung-co-dien", "tap-chi",
      "bang-mau", "thu-moi",
    ]);
  });
```

bằng:

```ts
describe("bố cục xu hướng 2026 (15/09/2026)", () => {
  it("thêm vào cuối, sau tám bố cục cũ", () => {
    expect(BO_CUC.slice(8)).toEqual(["art-deco"]);
  });

  it("docGiaoDien nhận khoá bố cục mới", () => {
    for (const k of BO_CUC.slice(8)) expect(docGiaoDien({ boCuc: k }).boCuc).toBe(k);
  });
});

describe("hai bố cục mới (12/09/2026)", () => {
  it("chỉ thêm vào cuối — thứ tự cũ giữ nguyên", () => {
    expect(BO_CUC.slice(0, 8)).toEqual([
      "danh-sach", "luoi", "lookbook", "trien-lam", "khung-co-dien", "tap-chi",
      "bang-mau", "thu-moi",
    ]);
  });
```

- [ ] **Step 2: Tạo `tests/app/bo-cuc-xu-huong.test.ts` (hỏng trước)**

```ts
import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { boChu } from "@/messages";
import type { MucCatalogue } from "@/modules/catalogue-share/chia-se.model";
import {
  GIAO_DIEN_MAC_DINH,
  type BoCuc,
  type GiaoDienCatalogue,
} from "@/modules/catalogue-share/giao-dien.model";
import type { DoiSo } from "@/app/catalogue/[slug]/bo-cuc-chung";

// AnhTai doc ngon ngu qua useChu; module that keo theo server action (next/headers).
vi.mock("@/messages/dung-chu", async () => {
  const { boChu: bo } = await import("@/messages");
  return { useChu: () => bo("vi") };
});

import { KhungArtDeco } from "@/app/catalogue/[slug]/bo-cuc-xu-huong";

const t = boChu("vi");

const anh = (n: number, tien: string) =>
  Array.from({ length: n }, (_, i) => ({ fileId: `${tien}-${i + 1}`, ten: `IMG_${i + 1}.jpg` }));

/** Ba mau: 3 anh du thong so; 1 anh thieu loai SP; 6 anh thieu ma mau. */
const MUC: MucCatalogue[] = [
  { maMau: "D101", loaiSp: "NHẪN", chatLieu: "Vàng 18K", mau: "Vàng", size: "6", tlVang: 2.4, anh: anh(3, "a"), gioiThieu: "Nhẫn cưới đan tay." },
  { maMau: "D102", loaiSp: null, chatLieu: "Vàng trắng 14K", mau: null, size: null, tlVang: null, anh: anh(1, "b") },
  { maMau: null, loaiSp: "DÂY CHUYỀN", chatLieu: null, mau: null, size: null, tlVang: 5.1, anh: anh(6, "c") },
];

function ve(
  Comp: (p: DoiSo) => ReactElement,
  boCuc: BoCuc,
  hien?: Partial<GiaoDienCatalogue["hien"]>,
): string {
  const g: GiaoDienCatalogue = { ...GIAO_DIEN_MAC_DINH, boCuc, hien: { ...GIAO_DIEN_MAC_DINH.hien, ...hien } };
  return renderToStaticMarkup(createElement(Comp, { muc: MUC, g, t }));
}

const dem = (html: string, chuoi: string) => html.split(chuoi).length - 1;

describe("Khung Art Deco", () => {
  const html = ve(KhungArtDeco, "art-deco");

  it("gốc mang data-bo-cuc, mỗi mẫu một data-muc", () => {
    expect(dem(html, 'data-bo-cuc="art-deco"')).toBe(1);
    expect(dem(html, "data-muc=")).toBe(3);
  });

  it("huy hiệu chỉ ở mẫu có từ hai ảnh và chứa đúng ảnh thứ hai", () => {
    expect(dem(html, "data-huy-hieu")).toBe(2);
    expect(html).toContain('data-anh="a-2"');
    expect(html).toContain('data-anh="c-2"');
    expect(html).not.toContain('data-anh="a-3"');
    expect(html).not.toContain('data-anh="c-3"');
  });

  it("đếm số ảnh khi mẫu có hơn một ảnh", () => {
    expect(html).toContain(">3 ảnh<");
    expect(html).toContain(">6 ảnh<");
    expect(html).not.toContain(">1 ảnh<");
  });

  it("mã mẫu làm tiêu đề; mẫu thiếu mã hiện chữ thay thế", () => {
    expect(html).toContain(">D101<");
    expect(html).toContain(`>${t.catalogue_sheet.chua_co_ma_mau}<`);
  });

  it("thông số bị ẩn không lọt ra; lời giới thiệu có mặt", () => {
    expect(html).toContain("2,40 g");
    expect(html).toContain("Nhẫn cưới đan tay.");
    expect(ve(KhungArtDeco, "art-deco", { tlVang: false })).not.toContain("2,40 g");
  });
});
```

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/app/bo-cuc-xu-huong.test.ts tests/modules/catalogue-share/giao-dien.model.test.ts`
Expected: FAIL — `bo-cuc-xu-huong.test.ts` không nạp được module `bo-cuc-xu-huong`; test `BO_CUC.slice(8)` nhận `[]`.

- [ ] **Step 3: `BO_CUC` thêm `art-deco`**

Trong `giao-dien.model.ts`, thay:

```ts
  // 12/09/2026: Bang mau cho khach si, Thu moi cho khach VIP va do cuoi.
  "bang-mau", "thu-moi",
] as const;
```

bằng:

```ts
  // 12/09/2026: Bang mau cho khach si, Thu moi cho khach VIP va do cuoi.
  "bang-mau", "thu-moi",
  // 15/09/2026: bo cuc xu huong 2026 (bo-cuc-xu-huong.tsx).
  "art-deco",
] as const;
```

- [ ] **Step 4: Tạo `src/app/catalogue/[slug]/bo-cuc-xu-huong.tsx`**

```tsx
import { Anh, GioiThieu, mocAnh, thongSo, type DoiSo } from "./bo-cuc-chung";

/**
 * Ba bo cuc XU HUONG 2026 (15/09/2026) — tach khoi bo-cuc.tsx de tep do khong phinh them.
 * Nguon xu huong da kiem ghi trong docs/superpowers/specs/2026-09-15-bo-cuc-xu-huong-design.md.
 *
 * Cung luat voi tam bo cuc cu (xem dau bo-cuc.tsx): duyet mau va anh theo dung thu tu goc,
 * duoc phep chi hien mot phan anh — khung phong to tim anh theo fileId. Them hai luat: moi
 * mau mot <li data-muc>, va KHONG chu nao de len anh (anh de anh thi duoc) — chu mau nhan
 * de len nen anh gan trang da tung khong doc duoc tren tong toi.
 *
 * Tep nay KHONG import tu bo-cuc.tsx (bo-cuc.tsx import tu day): chi dung bo-cuc-chung.
 */

/** Net hoa tiet giu dung mot pixel du khung SVG phong to hay thu nho. */
const NET = { vectorEffect: "non-scaling-stroke" } as const;

/**
 * Goc bac thang — ba duong gap long nhau, hoa tiet goc khung Art Deco. `lop` dat vi tri va
 * lat guong cho ba goc con lai.
 */
function GocBacThang({ lop }: { lop: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      className={`pointer-events-none absolute h-5 w-5 text-hp-pink sm:h-6 sm:w-6 ${lop}`}
    >
      <path {...NET} d="M1 23V1h22" />
      <path {...NET} d="M5 17V5h12" />
      <path {...NET} d="M9 11V9h2" />
    </svg>
  );
}

/** Quat toa tia (nua mat troi): cung tron, bay tia va duong day — ngan anh voi ten mau. */
function QuatToaTia({ lop }: { lop: string }) {
  const tia = [0, 30, 60, 90, 120, 150, 180].map((goc) => {
    const r = (goc * Math.PI) / 180;
    return {
      x1: (50 - 12 * Math.cos(r)).toFixed(2),
      y1: (46 - 12 * Math.sin(r)).toFixed(2),
      x2: (50 - 40 * Math.cos(r)).toFixed(2),
      y2: (46 - 40 * Math.sin(r)).toFixed(2),
    };
  });
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 50"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      className={`text-hp-pink ${lop}`}
    >
      <path {...NET} d="M6 46A44 44 0 0 1 94 46" />
      {tia.map((d, k) => (
        <line key={k} {...NET} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} />
      ))}
      <line {...NET} x1="0" y1="46" x2="100" y2="46" />
    </svg>
  );
}

/** Khien nho chua so thu tu — "dau kiem dinh" dau moi khung Art Deco. */
function KhienSo({ so }: { so: number }) {
  return (
    <span className="relative flex h-11 w-9 items-center justify-center">
      <svg
        aria-hidden
        viewBox="0 0 36 44"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        className="absolute inset-0 h-full w-full text-hp-pink"
      >
        <path {...NET} d="M2 2h32v24c0 8-8 13-16 16C10 39 2 34 2 26Z" />
      </svg>
      <span className="relative font-title text-[13px] tabular-nums leading-none text-hp-ink">
        {String(so).padStart(2, "0")}
      </span>
    </span>
  );
}

/**
 * Bo cuc 9 — khung Art Deco (xu huong "Neodeco", Pinterest Predicts 2026).
 *
 * Khung ke doi nhu Khung co dien nhung co HOA TIET: goc bac thang, quat toa tia, khien so;
 * thong so chia hai cot doi xung. Mot anh chinh lon; anh thu hai (neu co) nam trong huy
 * hieu tron de len goc anh chinh. Cac anh con lai chi dem so — bam anh la luot du. Moi mau
 * mot to giay khi in.
 */
export function KhungArtDeco({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul data-bo-cuc="art-deco" className="space-y-14 print:space-y-0">
      {muc.map((m, i) => {
        const [chinh, huyHieu] = m.anh;
        const ct = thongSo(m, g, t);
        return (
          <li
            key={`${m.maMau ?? "x"}-${i}`}
            data-muc={i}
            className="break-inside-avoid border border-hp-rule p-1.5 sm:p-2 print:break-after-page"
          >
            <div className="relative flex flex-col items-center border border-hp-rule px-5 pb-8 pt-6 text-center sm:px-12 sm:pb-12">
              <GocBacThang lop="left-2 top-2" />
              <GocBacThang lop="right-2 top-2 -scale-x-100" />
              <GocBacThang lop="bottom-2 left-2 -scale-y-100" />
              <GocBacThang lop="bottom-2 right-2 -scale-x-100 -scale-y-100" />

              <KhienSo so={i + 1} />

              {chinh && (
                <div className="relative mt-6 w-full max-w-xl">
                  <Anh m={m} fileId={chinh.fileId} ten={chinh.ten} rong={1600}
                       tyLe="aspect-[4/3]" uuTien={moc[i] === 0} />
                  {huyHieu && (
                    <div
                      data-huy-hieu
                      className="absolute -bottom-6 -right-2 w-20 rounded-full border border-hp-rule
                                 bg-hp-foundation p-1 sm:-right-6 sm:w-28"
                    >
                      <Anh m={m} fileId={huyHieu.fileId} ten={huyHieu.ten} rong={400}
                           tyLe="aspect-square rounded-full" uuTien={false} />
                    </div>
                  )}
                </div>
              )}

              <QuatToaTia lop="mt-10 h-8 w-36 sm:w-44" />

              {/* Khong dung MaMau: o day ma mau la tieu de cua khung, MaMau la nhan nho. */}
              <span className="mt-4 font-title text-[20px] uppercase leading-tight tracking-[0.28em] text-hp-ink sm:text-[24px]">
                {m.maMau ?? t.catalogue_sheet.chua_co_ma_mau}
              </span>

              {/* Hai cot doi xung — ThongSoBang luon thanh bon cot tren man hinh lon. */}
              {ct.length > 0 && (
                <dl className="mt-6 grid w-full max-w-md grid-cols-2 gap-x-10 gap-y-4 border-t border-hp-rule pt-6">
                  {ct.map(([nhan, v]) => (
                    <div key={nhan}>
                      <dt className="text-[10px] uppercase tracking-[0.18em] text-hp-muted">{nhan}</dt>
                      <dd className="mt-1 text-sm text-hp-body">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <GioiThieu m={m} lop="mx-auto mt-5" />

              {m.anh.length > 1 && (
                <span className="mt-5 text-[11px] tabular-nums text-hp-muted">
                  {t.chia_se.bang_mau_so_anh.replace("{n}", String(m.anh.length))}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 5: `bo-cuc.tsx` — đăng ký**

Thay:

```tsx
} from "./bo-cuc-chung";
```

bằng:

```tsx
} from "./bo-cuc-chung";
import { KhungArtDeco } from "./bo-cuc-xu-huong";
```

Rồi thay:

```tsx
  "thu-moi": ThuMoi,
};
```

bằng:

```tsx
  "thu-moi": ThuMoi,
  "art-deco": KhungArtDeco,
};
```

- [ ] **Step 6: `chon-giao-dien.tsx` — nhãn và hình minh hoạ**

Thay:

```tsx
    "thu-moi": {
      ten: t.mau_giao_dien.bo_cuc_thu_moi,
      moTa: t.mau_giao_dien.bo_cuc_thu_moi_mo_ta,
    },
  };
}
```

bằng:

```tsx
    "thu-moi": {
      ten: t.mau_giao_dien.bo_cuc_thu_moi,
      moTa: t.mau_giao_dien.bo_cuc_thu_moi_mo_ta,
    },
    "art-deco": {
      ten: t.mau_giao_dien.bo_cuc_art_deco,
      moTa: t.mau_giao_dien.bo_cuc_art_deco_mo_ta,
    },
  };
}
```

Rồi thay:

```tsx
  const o = "bg-hp-rule";
  if (kieu === "bang-mau") {
```

bằng:

```tsx
  const o = "bg-hp-rule";
  if (kieu === "art-deco") {
    return (
      <div aria-hidden className="mx-auto max-w-[150px] border border-hp-rule p-0.5">
        <div className="relative flex flex-col items-center gap-1.5 border border-hp-rule px-3 py-2">
          <span className="absolute left-0.5 top-0.5 h-1.5 w-1.5 border-l border-t border-hp-ink/60" />
          <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 border-r border-t border-hp-ink/60" />
          <span className="absolute bottom-0.5 left-0.5 h-1.5 w-1.5 border-b border-l border-hp-ink/60" />
          <span className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 border-b border-r border-hp-ink/60" />
          <div className="relative w-4/5">
            <div className={`${o} aspect-[4/3]`} />
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-hp-card bg-hp-ink/30" />
          </div>
          <div className="mt-1 h-1.5 w-1/2 bg-hp-ink/40" />
          <div className="h-1 w-2/3 bg-hp-rule" />
        </div>
      </div>
    );
  }
  if (kieu === "bang-mau") {
```

- [ ] **Step 7: Chữ**

`src/messages/vi.ts`, thay:

```ts
    bo_cuc_thu_moi_mo_ta: "Mỗi mẫu một trang riêng, căn giữa, có dòng “Dành riêng cho” tên khách. Hợp khách VIP, đồ cưới.",
```

bằng:

```ts
    bo_cuc_thu_moi_mo_ta: "Mỗi mẫu một trang riêng, căn giữa, có dòng “Dành riêng cho” tên khách. Hợp khách VIP, đồ cưới.",
    // Ba bo cuc xu huong 2026 (15/09/2026).
    bo_cuc_art_deco: "Khung Art Deco",
    bo_cuc_art_deco_mo_ta: "Khung kẻ đôi, góc bậc thang, ảnh lớn kèm huy hiệu ảnh chi tiết. Xu hướng 2026 — hợp nhẫn cưới, kim cương, khách VIP.",
```

`src/messages/en.ts`, thay:

```ts
    bo_cuc_thu_moi_mo_ta: "Each model on its own page, centred, with a “Specially for” line using the client's name. Suits VIP clients and bridal.",
```

bằng:

```ts
    bo_cuc_thu_moi_mo_ta: "Each model on its own page, centred, with a “Specially for” line using the client's name. Suits VIP clients and bridal.",
    bo_cuc_art_deco: "Art Deco frame",
    bo_cuc_art_deco_mo_ta: "Double-ruled frame with stepped corners, a large picture and a detail medallion. A 2026 trend — suits bridal, diamonds and VIP clients.",
```

- [ ] **Step 8: Chạy lại test, kiểm tra tổng**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/app/bo-cuc-xu-huong.test.ts tests/modules/catalogue-share/giao-dien.model.test.ts`
Expected: PASS, 0 failed.
Run: `npx tsc --noEmit` → không lỗi. `npx eslint` → 0 errors. Vitest cả bộ → 0 failed. Dừng 3100 nếu có; `npm run build` → thành công.

- [ ] **Step 9: Commit**

```bash
git add src/modules/catalogue-share/giao-dien.model.ts "src/app/catalogue/[slug]/bo-cuc-xu-huong.tsx" "src/app/catalogue/[slug]/bo-cuc.tsx"
git add src/app/catalogue/tao/chon-giao-dien.tsx src/messages/vi.ts src/messages/en.ts
git add tests/modules/catalogue-share/giao-dien.model.test.ts tests/app/bo-cuc-xu-huong.test.ts
git diff --cached --name-status
git commit -F "$S\commit-msg.txt"
```

Expected `--name-status`: 8 tệp (2 `A`, 6 `M`).

Message:

```
feat(catalogue): bố cục Khung Art Deco — xu hướng Neodeco 2026

- Khung kẻ đôi, góc bậc thang, quạt toả tia, khiên số; ảnh chính lớn và huy hiệu
  tròn chứa ảnh thứ hai; thông số hai cột đối xứng; mỗi mẫu một trang khi in.
- Bảng chọn có hình minh hoạ và mô tả vi/en. Test markup bằng renderToStaticMarkup.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 4: Bố cục Thẻ tiêu bản (`tieu-ban`)

**Files:**
- Modify: `src/modules/catalogue-share/giao-dien.model.ts` (`BO_CUC`)
- Modify: `src/app/catalogue/[slug]/bo-cuc-xu-huong.tsx` (import; thêm `TheTieuBan`)
- Modify: `src/app/catalogue/[slug]/bo-cuc.tsx` (import; `BANG`)
- Modify: `src/app/catalogue/tao/chon-giao-dien.tsx` (`nhanBoCuc`; `HinhBoCuc`)
- Modify: `src/messages/vi.ts`, `src/messages/en.ts`
- Modify: `tests/modules/catalogue-share/giao-dien.model.test.ts`, `tests/app/bo-cuc-xu-huong.test.ts`

**Interfaces:**
- Consumes: Task 2 (`ThongSoDong`, `thongSo`, `Anh`, `GioiThieu`, `DoiSo`); Task 3 (tệp `bo-cuc-xu-huong.tsx` với `KhungArtDeco`; tệp test với `ve`, `dem`, `MUC`, `t`; `BO_CUC.slice(8)` đang là `["art-deco"]`).
- Produces: `BoCuc` gồm `"tieu-ban"`; `export function TheTieuBan({ muc, g, t }: DoiSo)`; khoá `chia_se.tieu_ban_so`.

- [ ] **Step 1: Test (hỏng trước)**

`tests/modules/catalogue-share/giao-dien.model.test.ts`, thay:

```ts
    expect(BO_CUC.slice(8)).toEqual(["art-deco"]);
```

bằng:

```ts
    expect(BO_CUC.slice(8)).toEqual(["art-deco", "tieu-ban"]);
```

`tests/app/bo-cuc-xu-huong.test.ts`, thay:

```ts
import { KhungArtDeco } from "@/app/catalogue/[slug]/bo-cuc-xu-huong";
```

bằng:

```ts
import { KhungArtDeco, TheTieuBan } from "@/app/catalogue/[slug]/bo-cuc-xu-huong";
```

và thêm vào CUỐI tệp:

```ts
describe("Thẻ tiêu bản", () => {
  const html = ve(TheTieuBan, "tieu-ban");

  it("gốc mang data-bo-cuc, mỗi mẫu một data-muc, có dòng đếm số mẫu", () => {
    expect(dem(html, 'data-bo-cuc="tieu-ban"')).toBe(1);
    expect(dem(html, "data-muc=")).toBe(3);
    expect(html).toContain(">3 mẫu<");
  });

  it("nhãn: số đệm ba chữ số · mã mẫu · số ảnh khi hơn một ảnh", () => {
    expect(html).toContain(">Nº 001 · D101 · 3 ảnh<");
    expect(html).toContain(">Nº 002 · D102<");
    expect(html).toContain(`>Nº 003 · ${t.catalogue_sheet.chua_co_ma_mau} · 6 ảnh<`);
  });

  it("chỉ hiện ảnh chính của mỗi mẫu", () => {
    expect(dem(html, "data-anh=")).toBe(3);
    expect(html).toContain('data-anh="a-1"');
    expect(html).not.toContain('data-anh="a-2"');
  });

  it("thông số và lời giới thiệu có mặt", () => {
    expect(html).toContain("NHẪN · Vàng 18K");
    expect(html).toContain("Nhẫn cưới đan tay.");
  });
});
```

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/app/bo-cuc-xu-huong.test.ts tests/modules/catalogue-share/giao-dien.model.test.ts`
Expected: FAIL — `TheTieuBan` không phải function / không tồn tại; `BO_CUC.slice(8)` thiếu `tieu-ban`.

- [ ] **Step 2: `BO_CUC` thêm `tieu-ban`**

Thay:

```ts
  // 15/09/2026: bo cuc xu huong 2026 (bo-cuc-xu-huong.tsx).
  "art-deco",
] as const;
```

bằng:

```ts
  // 15/09/2026: bo cuc xu huong 2026 (bo-cuc-xu-huong.tsx).
  "art-deco", "tieu-ban",
] as const;
```

- [ ] **Step 3: `bo-cuc-xu-huong.tsx` — import và component**

Thay:

```tsx
import { Anh, GioiThieu, mocAnh, thongSo, type DoiSo } from "./bo-cuc-chung";
```

bằng:

```tsx
import { Anh, GioiThieu, ThongSoDong, mocAnh, thongSo, type DoiSo } from "./bo-cuc-chung";
```

Thêm vào CUỐI tệp:

```tsx
/**
 * Bo cuc 10 — the tieu ban (xu huong "The visual index" / "Trinket design" 2026).
 *
 * Nhieu mau mot trang nhu tu trung bay bao tang: anh nen trang dat thang tren nen trang,
 * khong khung; duoi moi anh mot nhan so kieu tieu ban, chu don cach. Chi hien anh CHINH —
 * bam vao van luot du anh. Khac Bang mau (hang du lieu, chu dan dat) va Luoi anh (moi anh
 * mot o): o day moi MAU mot the, anh dan dat. Vach cham duoi moi the nhu khay trung bay,
 * de trang khong trong tron.
 */
export function TheTieuBan({ muc, g, t }: DoiSo) {
  return (
    <div>
      <p className="border-b border-hp-rule pb-3 text-[11px] uppercase tracking-[0.18em] text-hp-muted">
        {t.chia_se.khach_gom.replace("{n}", String(muc.length))}
      </p>
      <ul
        data-bo-cuc="tieu-ban"
        className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 sm:gap-x-8 print:grid-cols-3"
      >
        {muc.map((m, i) => {
          const [chinh] = m.anh;
          const nhan = [
            t.chia_se.tieu_ban_so.replace("{n}", String(i + 1).padStart(3, "0")),
            m.maMau ?? t.catalogue_sheet.chua_co_ma_mau,
            ...(m.anh.length > 1 ? [t.chia_se.bang_mau_so_anh.replace("{n}", String(m.anh.length))] : []),
          ].join(" · ");
          return (
            <li
              key={`${m.maMau ?? "x"}-${i}`}
              data-muc={i}
              className="break-inside-avoid border-b border-dotted border-hp-rule pb-6"
            >
              {chinh ? (
                // Ba the dau nam tren man hinh dau tien: tai ngay.
                <Anh m={m} fileId={chinh.fileId} ten={chinh.ten} rong={900}
                     tyLe="aspect-[4/3]" uuTien={i < 3} />
              ) : (
                <div aria-hidden className="aspect-[4/3] bg-hp-plate" />
              )}
              <span aria-hidden className="mt-3 block h-px bg-hp-rule" />
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-hp-muted">{nhan}</p>
              <ThongSoDong ds={thongSo(m, g, t)} lop="mt-1.5" />
              <GioiThieu m={m} lop="mt-2" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: `bo-cuc.tsx` — đăng ký**

Thay:

```tsx
import { KhungArtDeco } from "./bo-cuc-xu-huong";
```

bằng:

```tsx
import { KhungArtDeco, TheTieuBan } from "./bo-cuc-xu-huong";
```

Thay:

```tsx
  "art-deco": KhungArtDeco,
};
```

bằng:

```tsx
  "art-deco": KhungArtDeco,
  "tieu-ban": TheTieuBan,
};
```

- [ ] **Step 5: `chon-giao-dien.tsx`**

Thay:

```tsx
    "art-deco": {
      ten: t.mau_giao_dien.bo_cuc_art_deco,
      moTa: t.mau_giao_dien.bo_cuc_art_deco_mo_ta,
    },
  };
}
```

bằng:

```tsx
    "art-deco": {
      ten: t.mau_giao_dien.bo_cuc_art_deco,
      moTa: t.mau_giao_dien.bo_cuc_art_deco_mo_ta,
    },
    "tieu-ban": {
      ten: t.mau_giao_dien.bo_cuc_tieu_ban,
      moTa: t.mau_giao_dien.bo_cuc_tieu_ban_mo_ta,
    },
  };
}
```

Thay:

```tsx
  if (kieu === "bang-mau") {
```

bằng:

```tsx
  if (kieu === "tieu-ban") {
    return (
      <div aria-hidden className="mx-auto grid max-w-[150px] grid-cols-3 gap-x-1.5 gap-y-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i}>
            <div className={`${o} aspect-[4/3]`} />
            <div className="mt-1 h-px bg-hp-ink/40" />
            <div className="mt-0.5 h-1 w-2/3 bg-hp-rule" />
          </div>
        ))}
      </div>
    );
  }
  if (kieu === "bang-mau") {
```

- [ ] **Step 6: Chữ**

`vi.ts`, thay:

```ts
    bo_cuc_art_deco_mo_ta: "Khung kẻ đôi, góc bậc thang, ảnh lớn kèm huy hiệu ảnh chi tiết. Xu hướng 2026 — hợp nhẫn cưới, kim cương, khách VIP.",
```

bằng:

```ts
    bo_cuc_art_deco_mo_ta: "Khung kẻ đôi, góc bậc thang, ảnh lớn kèm huy hiệu ảnh chi tiết. Xu hướng 2026 — hợp nhẫn cưới, kim cương, khách VIP.",
    bo_cuc_tieu_ban: "Thẻ tiêu bản",
    bo_cuc_tieu_ban_mo_ta: "Nhiều mẫu một trang như tủ trưng bày bảo tàng: ảnh nền trắng, nhãn số Nº. Xu hướng 2026 — lướt nhanh, gửi nhiều mẫu.",
```

`vi.ts`, thay:

```ts
    thu_moi_danh_cho: "Dành riêng cho {ten}",
```

bằng:

```ts
    thu_moi_danh_cho: "Dành riêng cho {ten}",
    // Bo cuc The tieu ban (15/09/2026). {n} = so thu tu da dem ba chu so.
    tieu_ban_so: "Nº {n}",
```

`en.ts`, thay:

```ts
    bo_cuc_art_deco_mo_ta: "Double-ruled frame with stepped corners, a large picture and a detail medallion. A 2026 trend — suits bridal, diamonds and VIP clients.",
```

bằng:

```ts
    bo_cuc_art_deco_mo_ta: "Double-ruled frame with stepped corners, a large picture and a detail medallion. A 2026 trend — suits bridal, diamonds and VIP clients.",
    bo_cuc_tieu_ban: "Specimen sheet",
    bo_cuc_tieu_ban_mo_ta: "Many models per page, like a museum case: white-ground pictures with Nº labels. A 2026 trend — quick to browse, good for many models.",
```

`en.ts`, thay:

```ts
    thu_moi_danh_cho: "Specially for {ten}",
```

bằng:

```ts
    thu_moi_danh_cho: "Specially for {ten}",
    tieu_ban_so: "Nº {n}",
```

- [ ] **Step 7: Chạy test, kiểm tra tổng**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/app/bo-cuc-xu-huong.test.ts tests/modules/catalogue-share/giao-dien.model.test.ts`
Expected: PASS, 0 failed.
`npx tsc --noEmit` → không lỗi; `npx eslint` → 0 errors; vitest cả bộ → 0 failed; dừng 3100 nếu có; `npm run build` → thành công.

- [ ] **Step 8: Commit**

```bash
git add src/modules/catalogue-share/giao-dien.model.ts "src/app/catalogue/[slug]/bo-cuc-xu-huong.tsx" "src/app/catalogue/[slug]/bo-cuc.tsx"
git add src/app/catalogue/tao/chon-giao-dien.tsx src/messages/vi.ts src/messages/en.ts
git add tests/modules/catalogue-share/giao-dien.model.test.ts tests/app/bo-cuc-xu-huong.test.ts
git diff --cached --name-status
git commit -F "$S\commit-msg.txt"
```

Expected: 8 tệp `M`.

Message:

```
feat(catalogue): bố cục Thẻ tiêu bản — xu hướng The visual index 2026

- Nhiều mẫu một trang: ảnh chính nền trắng không khung, nhãn chữ đơn cách
  "Nº 001 · mã mẫu · N ảnh", vạch chấm như khay trưng bày; in 3 cột.
- Dòng đếm dùng khoá có sẵn chia_se.khach_gom; thêm chia_se.tieu_ban_so.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 5: Bố cục Chữ lớn (`chu-lon`)

**Files:**
- Modify: `src/modules/catalogue-share/giao-dien.model.ts` (`BO_CUC`)
- Modify: `src/app/catalogue/[slug]/bo-cuc-xu-huong.tsx` (import; thêm `ChuLon`)
- Modify: `src/app/catalogue/[slug]/bo-cuc.tsx` (import; `BANG`)
- Modify: `src/app/catalogue/tao/chon-giao-dien.tsx`
- Modify: `src/messages/vi.ts`, `src/messages/en.ts`
- Modify: `tests/modules/catalogue-share/giao-dien.model.test.ts`, `tests/app/bo-cuc-xu-huong.test.ts`

**Interfaces:**
- Consumes: Task 1 (`chuLonCuaMau`); Task 2 (`Anh`, `MaMau`, `DuongTrangTri`, `ThongSoDong`, `GioiThieu`, `mocAnh`, `thongSo`, `DoiSo`); Task 3–4 (tệp `bo-cuc-xu-huong.tsx` với `KhungArtDeco`, `TheTieuBan`; tệp test với `ve`, `dem`, `MUC`, `t`; `BO_CUC.slice(8)` đang là `["art-deco", "tieu-ban"]`).
- Produces: `BoCuc` gồm `"chu-lon"`; `export function ChuLon({ muc, g, t }: DoiSo)`; markup chữ lớn `p[data-chu-lon]`.

- [ ] **Step 1: Test (hỏng trước)**

`giao-dien.model.test.ts`, thay:

```ts
    expect(BO_CUC.slice(8)).toEqual(["art-deco", "tieu-ban"]);
```

bằng:

```ts
    expect(BO_CUC.slice(8)).toEqual(["art-deco", "tieu-ban", "chu-lon"]);
```

`tests/app/bo-cuc-xu-huong.test.ts`, thay:

```ts
import { KhungArtDeco, TheTieuBan } from "@/app/catalogue/[slug]/bo-cuc-xu-huong";
```

bằng:

```ts
import { ChuLon, KhungArtDeco, TheTieuBan } from "@/app/catalogue/[slug]/bo-cuc-xu-huong";
```

và thêm vào CUỐI tệp:

```ts
describe("Chữ lớn", () => {
  const html = ve(ChuLon, "chu-lon");
  const chuLon = (s: string) => [...s.matchAll(/data-chu-lon="true"[^>]*>([^<]*)</g)].map((x) => x[1]);

  it("gốc mang data-bo-cuc, mỗi mẫu một data-muc", () => {
    expect(dem(html, 'data-bo-cuc="chu-lon"')).toBe(1);
    expect(dem(html, "data-muc=")).toBe(3);
  });

  it("chữ lớn theo chuLonCuaMau: Loại SP, thiếu thì Chất liệu", () => {
    expect(chuLon(html)).toEqual(["NHẪN", "Vàng trắng 14K", "DÂY CHUYỀN"]);
  });

  it("ẩn Loại SP thì chữ lớn sang Chất liệu, thiếu nữa thì chữ thay cho mã mẫu", () => {
    expect(chuLon(ve(ChuLon, "chu-lon", { loaiSp: false }))).toEqual([
      "Vàng 18K", "Vàng trắng 14K", t.catalogue_sheet.chua_co_ma_mau,
    ]);
  });

  it("số thứ tự dạng 01 / 03 và tối đa bốn ảnh phụ", () => {
    expect(html).toContain(">01 / 03<");
    expect(html).toContain('data-anh="c-5"');
    expect(html).not.toContain('data-anh="c-6"');
  });

  it("thông số và lời giới thiệu có mặt", () => {
    expect(html).toContain("Nhẫn cưới đan tay.");
    expect(html).toContain(">D101<");
  });
});
```

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/app/bo-cuc-xu-huong.test.ts tests/modules/catalogue-share/giao-dien.model.test.ts`
Expected: FAIL — `ChuLon` không tồn tại; `BO_CUC.slice(8)` thiếu `chu-lon`.

- [ ] **Step 2: `BO_CUC` thêm `chu-lon`**

Thay:

```ts
  "art-deco", "tieu-ban",
] as const;
```

bằng:

```ts
  "art-deco", "tieu-ban", "chu-lon",
] as const;
```

- [ ] **Step 3: `bo-cuc-xu-huong.tsx` — import và component**

Thay:

```tsx
import { Anh, GioiThieu, ThongSoDong, mocAnh, thongSo, type DoiSo } from "./bo-cuc-chung";
```

bằng:

```tsx
import { chuLonCuaMau } from "@/modules/catalogue-share/giao-dien.model";
import {
  Anh,
  DuongTrangTri,
  GioiThieu,
  MaMau,
  ThongSoDong,
  mocAnh,
  thongSo,
  type DoiSo,
} from "./bo-cuc-chung";
```

Thêm vào CUỐI tệp:

```tsx
/**
 * Bo cuc 11 — chu lon (xu huong "Typographic Maximalism" 2026).
 *
 * Chu co poster la hinh anh chinh: loai san pham, hoac chat lieu, hoac ma mau — xem
 * chuLonCuaMau, khong bao gio in to mot thong so sale da an. Chu nam TREN anh, khong de len
 * anh. Khoang cach dong >= 1.12 de dau tieng Viet chong nhieu tang (Ề, Ẫ) khong bi cat.
 * Moi mau mot to giay khi in.
 */
export function ChuLon({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul data-bo-cuc="chu-lon" className="space-y-24 print:space-y-0">
      {muc.map((m, i) => {
        const [chinh, ...phu] = m.anh;
        return (
          <li
            key={`${m.maMau ?? "x"}-${i}`}
            data-muc={i}
            className="break-inside-avoid print:break-after-page"
          >
            <div className="flex items-center gap-4">
              <span className="font-title text-lg tabular-nums leading-none text-hp-pink">
                {`${String(i + 1).padStart(2, "0")} / ${String(muc.length).padStart(2, "0")}`}
              </span>
              <span aria-hidden className="h-px flex-grow bg-hp-rule" />
            </div>

            <p
              data-chu-lon
              className="mt-6 break-words font-title text-[clamp(3rem,13vw,9.5rem)] uppercase
                         leading-[1.12] tracking-[0.02em] text-hp-ink print:text-[64pt]"
            >
              {chuLonCuaMau(m, g.hien) ?? t.catalogue_sheet.chua_co_ma_mau}
            </p>

            <div className="mt-8 grid gap-8 sm:grid-cols-[minmax(0,1fr)_15rem] sm:items-end">
              <div>
                {chinh && (
                  <Anh m={m} fileId={chinh.fileId} ten={chinh.ten} rong={2000}
                       tyLe="aspect-[4/3]" uuTien={moc[i] === 0} />
                )}
                {phu.length > 0 && (
                  <ul className="mt-3 grid grid-cols-4 gap-2">
                    {phu.slice(0, 4).map((a) => (
                      <li key={a.fileId}>
                        <Anh m={m} fileId={a.fileId} ten={a.ten} rong={500}
                             tyLe="aspect-[4/3]" uuTien={false} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <MaMau m={m} t={t} />
                <DuongTrangTri lop="w-24 gap-2" />
                <ThongSoDong ds={thongSo(m, g, t)} />
                <GioiThieu m={m} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 4: `bo-cuc.tsx` — đăng ký**

Thay:

```tsx
import { KhungArtDeco, TheTieuBan } from "./bo-cuc-xu-huong";
```

bằng:

```tsx
import { ChuLon, KhungArtDeco, TheTieuBan } from "./bo-cuc-xu-huong";
```

Thay:

```tsx
  "tieu-ban": TheTieuBan,
};
```

bằng:

```tsx
  "tieu-ban": TheTieuBan,
  "chu-lon": ChuLon,
};
```

- [ ] **Step 5: `chon-giao-dien.tsx`**

Thay:

```tsx
    "tieu-ban": {
      ten: t.mau_giao_dien.bo_cuc_tieu_ban,
      moTa: t.mau_giao_dien.bo_cuc_tieu_ban_mo_ta,
    },
  };
}
```

bằng:

```tsx
    "tieu-ban": {
      ten: t.mau_giao_dien.bo_cuc_tieu_ban,
      moTa: t.mau_giao_dien.bo_cuc_tieu_ban_mo_ta,
    },
    "chu-lon": {
      ten: t.mau_giao_dien.bo_cuc_chu_lon,
      moTa: t.mau_giao_dien.bo_cuc_chu_lon_mo_ta,
    },
  };
}
```

Thay:

```tsx
  if (kieu === "tieu-ban") {
```

bằng:

```tsx
  if (kieu === "chu-lon") {
    return (
      <div aria-hidden className="mx-auto max-w-[150px] space-y-1.5">
        <div className="h-4 w-full bg-hp-ink/40" />
        <div className="flex items-end gap-1.5">
          <div className={`${o} aspect-[4/3] w-3/5`} />
          <div className="flex flex-grow flex-col gap-1">
            <div className="h-1 w-2/3 bg-hp-ink/40" />
            <div className="h-1 w-full bg-hp-rule" />
          </div>
        </div>
      </div>
    );
  }
  if (kieu === "tieu-ban") {
```

- [ ] **Step 6: Chữ**

`vi.ts`, thay:

```ts
    bo_cuc_tieu_ban_mo_ta: "Nhiều mẫu một trang như tủ trưng bày bảo tàng: ảnh nền trắng, nhãn số Nº. Xu hướng 2026 — lướt nhanh, gửi nhiều mẫu.",
```

bằng:

```ts
    bo_cuc_tieu_ban_mo_ta: "Nhiều mẫu một trang như tủ trưng bày bảo tàng: ảnh nền trắng, nhãn số Nº. Xu hướng 2026 — lướt nhanh, gửi nhiều mẫu.",
    bo_cuc_chu_lon: "Chữ lớn",
    bo_cuc_chu_lon_mo_ta: "Mỗi mẫu một trang, loại sản phẩm viết cỡ poster phía trên ảnh. Xu hướng 2026 — mở đầu ấn tượng, hợp ít mẫu.",
```

`en.ts`, thay:

```ts
    bo_cuc_tieu_ban_mo_ta: "Many models per page, like a museum case: white-ground pictures with Nº labels. A 2026 trend — quick to browse, good for many models.",
```

bằng:

```ts
    bo_cuc_tieu_ban_mo_ta: "Many models per page, like a museum case: white-ground pictures with Nº labels. A 2026 trend — quick to browse, good for many models.",
    bo_cuc_chu_lon: "Big type",
    bo_cuc_chu_lon_mo_ta: "One page per model, with the product type set poster-size above the picture. A 2026 trend — a bold first impression, best for a few models.",
```

- [ ] **Step 7: Chạy test, kiểm tra tổng**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/app/bo-cuc-xu-huong.test.ts tests/modules/catalogue-share/giao-dien.model.test.ts`
Expected: PASS, 0 failed.
`npx tsc --noEmit` → không lỗi; `npx eslint` → 0 errors; vitest cả bộ → 0 failed; dừng 3100 nếu có; `npm run build` → thành công.
Run: `Get-ChildItem .next\static -Recurse -Filter *.css | Select-String -Pattern 'clamp\(3rem' | Measure-Object | % Count` → ≥ 1 (Tailwind sinh cỡ chữ lớn).

- [ ] **Step 8: Commit**

```bash
git add src/modules/catalogue-share/giao-dien.model.ts "src/app/catalogue/[slug]/bo-cuc-xu-huong.tsx" "src/app/catalogue/[slug]/bo-cuc.tsx"
git add src/app/catalogue/tao/chon-giao-dien.tsx src/messages/vi.ts src/messages/en.ts
git add tests/modules/catalogue-share/giao-dien.model.test.ts tests/app/bo-cuc-xu-huong.test.ts
git diff --cached --name-status
git commit -F "$S\commit-msg.txt"
```

Expected: 8 tệp `M`.

Message:

```
feat(catalogue): bố cục Chữ lớn — xu hướng Typographic Maximalism 2026

- Mỗi mẫu một trang: Loại SP (hoặc Chất liệu, Mã mẫu) cỡ poster phía trên ảnh, không
  đè lên ảnh; ảnh chính + tối đa bốn ảnh phụ; thông số và lời giới thiệu bên cạnh.
- Không in to thông số sale đã ẩn (chuLonCuaMau).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 6: Kiểm tra tổng, E2E cục bộ và soát bằng mắt

Ghi chú phạm vi: mục E2E "bỏ tích Loại SP → chữ lớn đổi sang Chất liệu" của spec §3.8 được khoá bằng test đơn vị ở Task 5 (`renderToStaticMarkup`), không lặp trong E2E — dữ liệu bảng tính thật có thể thiếu Loại SP ở ba mẫu được chọn, làm E2E hỏng ngẫu nhiên.

**Files:**
- Temp (không commit, giữ tới Task 8): `scripts/tmp-e2e-bo-cuc-xu-huong.mts`

- [ ] **Step 1: Kiểm tra toàn bộ trên cây sạch**

```powershell
New-Item -ItemType Directory -Force "$S\tam" | Out-Null
Get-ChildItem C:\Users\pit010\catalogue-quote-system\scripts\tmp-*.mts -ErrorAction SilentlyContinue | Move-Item -Destination "$S\tam\" -Force
git -C C:\Users\pit010\catalogue-quote-system status --short
```

Expected: trống. Dừng 3100. `npx tsc --noEmit` → không lỗi; `npx eslint` → 0 errors; vitest cả bộ → 0 failed (đọc toàn bộ); `npm run build` → thành công. Trả script tạm về: `Move-Item "$S\tam\tmp-*.mts" C:\Users\pit010\catalogue-quote-system\scripts\ -Force` (nếu có). Khởi động 3100, đợi `/login` 200.

- [ ] **Step 2: Tạo `scripts/tmp-e2e-bo-cuc-xu-huong.mts`**

```ts
/**
 * TAM — khong commit. E2E ba bo cuc xu huong: Xem truoc (tong sang + tong toi), trang
 * khach, ban in. Chay: GOC=<goc> RA=<thu muc anh> npx tsx scripts/tmp-e2e-bo-cuc-xu-huong.mts
 * Tai khoan admin tam + catalogue tam XOA trong finally; hen gio 9 phut.
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium, type Browser, type Page } from "playwright";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import { boChu } from "../src/messages/index";

const GOC = process.env.GOC ?? "http://localhost:3100";
const RA = process.env.RA;
if (!RA) throw new Error("Thieu bien RA");

const t = boChu("vi");
const ch = t.chia_se;
const thoat = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const co = (s: string) => new RegExp(thoat(s.trim()), "i");
const dung = (s: string) => new RegExp(`^${thoat(s.trim())}$`, "i");

const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const EMAIL = `e2e-bocuc-${randomBytes(4).toString("hex")}@ctyhp.vn`;
const MAT_KHAU = randomBytes(18).toString("base64url");
const KHOA = ["art-deco", "tieu-ban", "chu-lon"] as const;
const SO_MAU = 3;
let idNguoi: string | null = null;
let trinhDuyet: Browser | null = null;
let dat = 0;
let hong = 0;

function kiem(ten: string, ok: boolean, chiTiet = ""): void {
  if (ok) { dat++; console.log(`  OK   ${ten}`); } else { hong++; console.log(`  HONG ${ten} ${chiTiet}`); }
}

setTimeout(() => {
  console.log("HONG: qua 9 phut, dong trinh duyet de finally don dep");
  void trinhDuyet?.close().catch(() => {});
}, 9 * 60_000).unref();

async function chonMauVaMoTao(page: Page): Promise<void> {
  await page.goto(`${GOC}/admin/catalogue-sheet`, { waitUntil: "networkidle", timeout: 120_000 });
  const oTich = page.locator("tbody tr").filter({ has: page.locator("img") }).locator('input[type="checkbox"]');
  await oTich.first().waitFor();
  for (let i = 0; i < SO_MAU; i++) await oTich.nth(i).check();
  await page.goto(`${GOC}/catalogue/tao`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.locator("[data-anh]").first().waitFor({ timeout: 90_000 });
}

async function chonRadio(page: Page, ten: string, giaTri: string): Promise<void> {
  await page.locator("label").filter({ has: page.locator(`input[name="${ten}"][value="${giaTri}"]`) }).click();
  await page.waitForTimeout(150);
}

try {
  await mkdir(RA, { recursive: true });
  const { data, error } = await supa.auth.admin.createUser({ email: EMAIL, password: MAT_KHAU, email_confirm: true });
  if (error) throw error;
  idNguoi = data.user.id;
  await sql`insert into users (id, email, full_name, role) values (${idNguoi}, ${EMAIL}, 'E2E bố cục', 'admin')`;

  trinhDuyet = await chromium.launch();
  const ngu = await trinhDuyet.newContext({ viewport: { width: 1440, height: 900 } });
  await ngu.addCookies([{ name: "ngon-ngu", value: "vi", url: GOC }]);
  const page = await ngu.newPage();
  page.setDefaultTimeout(45_000);

  await page.goto(`${GOC}/login`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.getByRole("button", { name: co(t.dang_nhap.khong_vao_duoc) }).click();
  await page.fill("#email", EMAIL);
  await page.fill("#mat_khau", MAT_KHAU);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 90_000, waitUntil: "commit" }),
    page.getByRole("button", { name: dung(t.dang_nhap.nut) }).click(),
  ]);

  const hop = page.getByRole("dialog", { name: co(ch.xem_truoc) });
  const moXemTruoc = async (khoa: string) => {
    await page.getByRole("button", { name: dung(ch.xem_truoc) }).first().click();
    await hop.locator(`[data-bo-cuc="${khoa}"]`).waitFor({ timeout: 30_000 });
    await page.waitForTimeout(2000);
  };
  const dongXemTruoc = async () => {
    await hop.getByRole("button", { name: dung(t.catalogue_sheet.dong_ngan) }).click();
    await hop.waitFor({ state: "hidden" });
  };

  for (const khoa of KHOA) {
    await chonMauVaMoTao(page);
    await chonRadio(page, "bo_cuc", khoa);

    // 1. Xem truoc, tong Be co dien
    await chonRadio(page, "tone", "beige");
    await moXemTruoc(khoa);
    kiem(`${khoa}: Xem truoc tong sang co ${SO_MAU} mau`,
      (await hop.locator(`[data-bo-cuc="${khoa}"] > li`).count()) === SO_MAU);
    await page.screenshot({ path: join(RA, `xem-truoc-${khoa}-sang.png`), fullPage: false });
    await hop.locator(`[data-bo-cuc="${khoa}"]`).screenshot({ path: join(RA, `xem-truoc-${khoa}-sang-than.png`) });
    await dongXemTruoc();

    // 2. Xem truoc, tong Xanh dem (nen toi)
    await chonRadio(page, "tone", "xanh-dem");
    await moXemTruoc(khoa);
    kiem(`${khoa}: Xem truoc tong toi co ${SO_MAU} mau`,
      (await hop.locator(`[data-bo-cuc="${khoa}"] > li`).count()) === SO_MAU);
    await hop.locator(`[data-bo-cuc="${khoa}"]`).screenshot({ path: join(RA, `xem-truoc-${khoa}-toi-than.png`) });
    await dongXemTruoc();
    await chonRadio(page, "tone", "beige");

    // 3. Tao link, mo trang khach
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByRole("button", { name: co(ch.nut_tao) }).click();
    await page.getByRole("button", { name: co(ch.chep_link) }).waitFor({ state: "visible", timeout: 90_000 });
    const link = (await page.locator("p.break-all").first().textContent())?.trim() ?? "";

    const khach = await ngu.newPage();
    await khach.goto(link, { waitUntil: "networkidle", timeout: 120_000 });
    await khach.waitForTimeout(2500);
    const goc = khach.locator(`[data-bo-cuc="${khoa}"]`);
    kiem(`${khoa}: trang khach co ${SO_MAU} mau`, (await goc.locator(":scope > li").count()) === SO_MAU);
    await khach.screenshot({ path: join(RA, `trang-khach-${khoa}.png`), fullPage: true });

    if (khoa === "art-deco") {
      const [huyHieu, mauNhieuAnh] = await goc.evaluate((ul) => {
        const ds = Array.from(ul.querySelectorAll(":scope > li"));
        return [
          ul.querySelectorAll("[data-huy-hieu]").length,
          ds.filter((li) => li.querySelectorAll("[data-anh]").length >= 2).length,
        ];
      });
      kiem("art-deco: so huy hieu bang so mau co tu hai anh", huyHieu === mauNhieuAnh, `(huy hieu ${huyHieu}, mau ${mauNhieuAnh})`);
    }
    if (khoa === "tieu-ban") {
      const nhanDau = (await goc.locator(":scope > li").first().locator("p.font-mono").textContent())?.trim() ?? "";
      // Dong dem la the p ngay truoc ul trong div boc — trang khach con mot dong "N mau" o dau trang.
      const dongDem = (await khach.locator('div:has(> [data-bo-cuc="tieu-ban"]) > p').first().textContent())?.trim() ?? "";
      kiem("tieu-ban: nhan mau dau Nº 001, dong dem dung so mau",
        nhanDau.startsWith("Nº 001") && dongDem === ch.khach_gom.replace("{n}", String(SO_MAU)),
        `(nhan "${nhanDau}", dong dem "${dongDem}")`);
    }
    if (khoa === "chu-lon") {
      const chu = await goc.locator("[data-chu-lon]").allTextContents();
      kiem("chu-lon: moi mau co chu lon khong trong", chu.length === SO_MAU && chu.every((c) => c.trim() !== ""), JSON.stringify(chu));
    }

    // 4. Ban in
    await khach.emulateMedia({ media: "print" });
    if (khoa === "tieu-ban") {
      const cot = await goc.evaluate((ul) => getComputedStyle(ul).gridTemplateColumns.split(" ").length);
      kiem("tieu-ban: ban in 3 cot", cot === 3, `(thay ${cot})`);
    } else {
      const ngat = await goc.evaluate((ul) =>
        Array.from(ul.querySelectorAll(":scope > li")).every((li) => getComputedStyle(li).breakAfter === "page"));
      kiem(`${khoa}: ban in moi mau mot trang`, ngat);
    }
    await khach.emulateMedia({ media: "screen" });
    await khach.close();
  }

  console.log(`\nKet qua: ${dat} dat, ${hong} hong`);
  if (hong > 0) process.exitCode = 1;
} catch (e) {
  console.log("HONG: " + String(e).slice(0, 800));
  process.exitCode = 1;
} finally {
  if (trinhDuyet) await trinhDuyet.close().catch(() => {});
  if (idNguoi) {
    const xoa = await sql`delete from catalogues where owner_id = ${idNguoi} returning id`.catch(() => []);
    console.log(`Da xoa ${xoa.length} catalogue tam`);
    await sql`delete from users where id = ${idNguoi}`.catch(() => {});
    const { error } = await supa.auth.admin.deleteUser(idNguoi);
    console.log(error ? `!! CHUA XOA ${EMAIL}: ${error.message}` : "Da xoa tai khoan tam");
  }
  await sql.end({ timeout: 5 });
}
```

- [ ] **Step 3: Chạy E2E cục bộ**

Run (PowerShell, tiền cảnh, timeout 10 phút): `$env:GOC="http://localhost:3100"; $env:RA="$S\e2e-bo-cuc-local"; npx tsx scripts/tmp-e2e-bo-cuc-xu-huong.mts`
Expected: 15 dòng `OK` (mỗi bố cục 4 dòng chung + 1 dòng riêng), `Ket qua: 15 dat, 0 hong`, `Da xoa 3 catalogue tam`, `Da xoa tai khoan tam`, exit 0.
Nếu hỏng: đọc output; xác nhận đã dọn (`select count(*) from users where email like 'e2e-bocuc-%'` phải 0); lỗi ở script (locator) thì sửa script và chạy lại; lỗi ở sản phẩm thì sửa component (kèm test hỏng trước), commit riêng `fix(catalogue): …`, chạy lại Step 1 và E2E.

- [ ] **Step 4: Soát bằng mắt**

Dùng Read mở trong `$S\e2e-bo-cuc-local`: `xem-truoc-<khoá>-sang-than.png` và `xem-truoc-<khoá>-toi-than.png` cho cả ba khoá, và `trang-khach-chu-lon.png`. Tiêu chí, ghi từng mục vào báo cáo:
- Art Deco: khung kẻ đôi đủ bốn góc bậc thang, không lệch; khiên số ở giữa trên; huy hiệu tròn đè góc ảnh, không che chữ; nét quạt cân giữa; mã mẫu giãn chữ; thông số hai cột; trên tông tối hoạ tiết và chữ vẫn thấy rõ.
- Tiêu bản: lưới 3 cột đều, ảnh không khung, nhãn `Nº 001 · …` đọc được, vạch chấm dưới thẻ; không có ô trống lạ.
- Chữ lớn: chữ cỡ poster không tràn ra ngoài khung, dấu tiếng Việt không bị cắt, chữ không đè ảnh; ảnh và cột thông số cân nhau; tông tối đọc rõ.
- Không bố cục nào có chữ nằm đè lên ảnh; ảnh E2E có dữ liệu thật — chỉ xem, không gửi, không đăng.
Có lỗi trình bày: sửa component (và test nếu hành vi đổi), commit riêng `fix(catalogue): …`, chạy lại Step 1, Step 3, soát lại.

- [ ] **Step 5: Dừng máy chủ 3100.** Giữ `scripts/tmp-e2e-bo-cuc-xu-huong.mts` chưa commit cho Task 8.

---

### Task 7: Hướng dẫn — chữ và ảnh bước Bố cục

**Files:**
- Modify: `src/messages/huong-dan.vi.ts:145`, `:233`
- Modify: `src/messages/huong-dan.en.ts:144`, `:232`
- Modify: `scripts/chup-huong-dan.mts:464-472` (bước 7b)
- Modify (script sinh): `public/huong-dan/07-bo-cuc-mau.png`, `public/huong-dan/en/07-bo-cuc-mau.png`, `public/huong-dan/diem.json`, `public/huong-dan/en/diem.json` (và ảnh khác có khoá `diem.json` đổi)
- Temp (không commit): `scripts/tmp-xem-huong-dan.mts`

**Interfaces:**
- Consumes: Task 3–5 (bảng chọn có 11 thẻ bố cục).

- [ ] **Step 1: Chữ hướng dẫn tiếng Việt**

`src/messages/huong-dan.vi.ts`, thay:

```ts
      "Tám bố cục: Danh sách dọc (mặc định, dễ so sánh), Lưới ảnh (hợp nhiều mẫu), Lookbook và Triển lãm (ít mẫu, ảnh lớn), Khung cổ điển (dễ đọc thông số), Tạp chí (lướt nhanh), Bảng mẫu (khách sỉ, in gọn), Thư mời (mỗi mẫu một trang, cho khách VIP và đồ cưới).",
```

bằng:

```ts
      "Mười một bố cục: Danh sách dọc (mặc định, dễ so sánh), Lưới ảnh (hợp nhiều mẫu), Lookbook và Triển lãm (ít mẫu, ảnh lớn), Khung cổ điển (dễ đọc thông số), Tạp chí (lướt nhanh), Bảng mẫu (khách sỉ, in gọn), Thư mời (mỗi mẫu một trang, cho khách VIP và đồ cưới), và ba kiểu xu hướng 2026: Khung Art Deco (nhẫn cưới, kim cương), Thẻ tiêu bản (nhiều mẫu một trang), Chữ lớn (ít mẫu, mở đầu ấn tượng).",
```

Thay:

```ts
      "Ảnh chính: ảnh được tích đầu tiên. Đây là ảnh lớn ở Lookbook, Triển lãm và Tạp chí; Khung cổ điển dùng hai ảnh đầu.",
```

bằng:

```ts
      "Ảnh chính: ảnh được tích đầu tiên. Đây là ảnh lớn ở Lookbook, Triển lãm, Tạp chí và Chữ lớn; Khung cổ điển dùng hai ảnh đầu, Khung Art Deco lấy ảnh thứ hai làm huy hiệu nhỏ.",
```

- [ ] **Step 2: Chữ hướng dẫn tiếng Anh**

`src/messages/huong-dan.en.ts`, thay:

```ts
      "Eight layouts: Vertical list (default, easy to compare), Image grid (many models), Lookbook and Gallery (few models, big pictures), Classic frame (easiest to read details), Magazine (quickest to skim), Line sheet (wholesale, prints tight), Invitation (one page per model, for VIP clients and bridal).",
```

bằng:

```ts
      "Eleven layouts: Vertical list (default, easy to compare), Image grid (many models), Lookbook and Gallery (few models, big pictures), Classic frame (easiest to read details), Magazine (quickest to skim), Line sheet (wholesale, prints tight), Invitation (one page per model, for VIP clients and bridal), plus three 2026 trends: Art Deco frame (bridal, diamonds), Specimen sheet (many models per page), Big type (few models, bold opening).",
```

Thay:

```ts
      "Main image: the first ticked image. It is the big picture in Lookbook, Gallery and Magazine; Classic frame uses the first two.",
```

bằng:

```ts
      "Main image: the first ticked image. It is the big picture in Lookbook, Gallery, Magazine and Big type; Classic frame uses the first two, and Art Deco frame shows the second one as a small medallion.",
```

- [ ] **Step 3: Script chụp — khung nhìn cao hơn ở bước 7b**

`scripts/chup-huong-dan.mts`, thay:

```ts
    // --- 7b. Bo cuc, tong mau, mau nhan ---
    await cuonToi(page, boCucKhoi, 40);
    await chup(luot, page, "07-bo-cuc-mau", [
      { o: kieu.getByText(dung(gd.bo_cuc_danh_sach)), huong: "duoi" },
      { o: khoi(page, dung(gd.tone_nhan)).locator("legend"), huong: "trai" },
      { o: kieu.getByText(dau(gd.tone_beige_mo_ta)), huong: "phai" },
      // O mau nhan CUOI: dat canh chu "Mau nhan" thi de len dong mo ta.
      { o: khoi(page, dung(gd.nhan_mau_nhan)).locator("label").last(), huong: "trai" },
    ], await khungTu(page, boCucKhoi, khoi(page, dung(gd.nhan_mau_nhan))));
```

bằng:

```ts
    // --- 7b. Bo cuc, tong mau, mau nhan ---
    // 15/09/2026: 11 bo cuc = them mot hang the, khung Bo cuc -> Mau nhan vuot 1600px. Khung
    // nhin cao tam thoi cho buoc nay roi tra ve 1600 de cac buoc sau chup y nhu cu.
    await page.setViewportSize({ width: RONG, height: 2100 });
    await cuonToi(page, boCucKhoi, 40);
    await chup(luot, page, "07-bo-cuc-mau", [
      { o: kieu.getByText(dung(gd.bo_cuc_danh_sach)), huong: "duoi" },
      { o: khoi(page, dung(gd.tone_nhan)).locator("legend"), huong: "trai" },
      { o: kieu.getByText(dau(gd.tone_beige_mo_ta)), huong: "phai" },
      // O mau nhan CUOI: dat canh chu "Mau nhan" thi de len dong mo ta.
      { o: khoi(page, dung(gd.nhan_mau_nhan)).locator("label").last(), huong: "trai" },
    ], await khungTu(page, boCucKhoi, khoi(page, dung(gd.nhan_mau_nhan))));
    await page.setViewportSize({ width: RONG, height: 1600 });
```

- [ ] **Step 4: Build, khởi động máy chủ, chụp hai bộ ảnh**

Dời `scripts/tmp-*.mts` ra `$S\tam\` (nếu có) trong lúc build rồi trả về. Dừng 3100; `npx tsc --noEmit` → không lỗi; `npm run build` → thành công; khởi động 3100, đợi `/login` 200.
Run (tiền cảnh, timeout 12 phút): `npm run huong-dan:anh`
Expected: 22 dòng `[vi] …png` + `[vi] diem.json`, 22 dòng `[en] …png` + `[en] diem.json`; không có `khong xoa duoc tai khoan tam`; không có `rơi ngoài ảnh`.

- [ ] **Step 5: Xem thay đổi**

Run: `git status --short public/huong-dan`; `git diff public/huong-dan/diem.json public/huong-dan/en/diem.json`. Ghi lại khoá nào trong `diem.json` đổi toạ độ.

- [ ] **Step 6: Khởi động lại máy chủ, soát trên trang Hướng dẫn**

Dừng rồi khởi động lại 3100 (trang đọc `diem.json` một lần lúc nạp). Tạo `scripts/tmp-xem-huong-dan.mts`:

```ts
/**
 * TAM — khong commit. Chup tung hinh (anh + mui ten) tren trang /admin/huong-dan de soat
 * mui ten va che du lieu. NN=en de xem ban tieng Anh. Tai khoan tam, xoa trong finally.
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium, type Browser } from "playwright";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

const GOC = process.env.GOC ?? "http://localhost:3100";
const RA = process.env.RA;
const NN = process.env.NN === "en" ? "en" : "vi";
if (!RA) throw new Error("Thieu bien RA");

const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const EMAIL = `e2e-xemhd-${randomBytes(4).toString("hex")}@ctyhp.vn`;
const MAT_KHAU = randomBytes(18).toString("base64url");
let idNguoi: string | null = null;
let trinhDuyet: Browser | null = null;

setTimeout(() => { console.log("HONG: qua 5 phut"); void trinhDuyet?.close().catch(() => {}); }, 5 * 60_000).unref();

try {
  await mkdir(RA, { recursive: true });
  const { data, error } = await supa.auth.admin.createUser({ email: EMAIL, password: MAT_KHAU, email_confirm: true });
  if (error) throw error;
  idNguoi = data.user.id;
  await sql`insert into users (id, email, full_name, role) values (${idNguoi}, ${EMAIL}, 'Xem hướng dẫn', 'admin')`;

  trinhDuyet = await chromium.launch();
  const ngu = await trinhDuyet.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  await ngu.addCookies([{ name: "ngon-ngu", value: NN, url: GOC }]);
  const trang = await ngu.newPage();
  await trang.goto(`${GOC}/login`, { waitUntil: "networkidle", timeout: 120_000 });
  await trang.getByRole("button", { name: NN === "en" ? /cannot sign in with google/i : /không đăng nhập được/i }).click();
  await trang.fill("#email", EMAIL);
  await trang.fill("#mat_khau", MAT_KHAU);
  await Promise.all([
    trang.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 90_000, waitUntil: "commit" }),
    trang.getByRole("button", { name: NN === "en" ? /^sign in$/i : /^đăng nhập$/i }).click(),
  ]);

  await trang.goto(`${GOC}/admin/huong-dan`, { waitUntil: "networkidle", timeout: 120_000 });
  const soHinh = await trang.locator("figure").count();
  const srcAnh = await trang.locator("figure img").evaluateAll((ds) => ds.map((d) => d.getAttribute("src") ?? ""));
  const soAnhEn = srcAnh.filter((s) => s.includes("/huong-dan/en/")).length;
  console.log(`[${NN}] hinh: ${soHinh}, anh tu thu muc en: ${soAnhEn}, buoc: ${await trang.locator("li[id^=buoc-]").count()}, cau hoi: ${await trang.locator("#hoi-dap dt").count()}, tieu de: ${await trang.locator("h1").first().innerText()}`);
  for (let i = 0; i < soHinh; i++) {
    const h = trang.locator("figure").nth(i);
    await h.scrollIntoViewIfNeeded();
    await h.locator("img").evaluate((img: HTMLImageElement) => img.decode().catch(() => {}));
    await trang.waitForTimeout(150);
    await h.screenshot({ path: join(RA, `hinh-${String(i + 1).padStart(2, "0")}.png`) });
  }
  console.log("xong");
} catch (e) {
  console.log("HONG: " + String(e).slice(0, 500));
  process.exitCode = 1;
} finally {
  if (trinhDuyet) await trinhDuyet.close().catch(() => {});
  if (idNguoi) {
    await sql`delete from users where id = ${idNguoi}`.catch(() => {});
    const { error } = await supa.auth.admin.deleteUser(idNguoi);
    console.log(error ? `!! CHUA XOA ${EMAIL}: ${error.message}` : "Da xoa tai khoan tam");
  }
  await sql.end({ timeout: 5 });
}
```

Run: `$env:NN="en"; $env:RA="$S\soat-en-bocuc"; npx tsx scripts/tmp-xem-huong-dan.mts` rồi `$env:NN="vi"; $env:RA="$S\soat-vi-bocuc"; npx tsx scripts/tmp-xem-huong-dan.mts`
Expected: `[en] hinh: 22, anh tu thu muc en: 22, buoc: 22, cau hoi: 12, tieu de: How to use it` và `[vi] hinh: 22, anh tu thu muc en: 0, buoc: 22, cau hoi: 12, tieu de: Hướng dẫn sử dụng`; mỗi lượt `Da xoa tai khoan tam`.

- [ ] **Step 7: Soát bằng mắt**

Mở bằng Read: `public/huong-dan/07-bo-cuc-mau.png`, `public/huong-dan/en/07-bo-cuc-mau.png`, và `hinh-08.png` của cả hai thư mục soát (hình 8 = ảnh `07-bo-cuc-mau`). Tiêu chí: đủ 11 thẻ bố cục (ba thẻ mới ở hàng cuối có hình minh hoạ và chữ đúng ngôn ngữ); thẻ Danh sách dọc đang chọn; hàng tông 13 ô, màu nhấn 7 ô; bốn ô số không đè chữ, không đè nhau, không bị cắt mép; ảnh không bị cắt cụt ở đáy. Lỗi vị trí ô số: đổi `huong` của mốc đó ở bước 7b, chụp lại (Step 4), khởi động lại, soát lại.

- [ ] **Step 8: Giữ đúng ảnh, dừng máy chủ, commit**

Với mỗi `.png` đổi trong `public/huong-dan/` và `public/huong-dan/en/`: `07-bo-cuc-mau.png` → giữ; ảnh khác có khoá `diem.json` cùng thư mục đổi toạ độ → giữ; còn lại → `git restore -- <đường dẫn>`. Dừng 3100.

```bash
git add src/messages/huong-dan.vi.ts src/messages/huong-dan.en.ts scripts/chup-huong-dan.mts
git add public/huong-dan/07-bo-cuc-mau.png public/huong-dan/en/07-bo-cuc-mau.png
git add public/huong-dan/diem.json public/huong-dan/en/diem.json
git add <từng .png khác được giữ, nếu có>
git diff --cached --name-status
git commit -F "$S\commit-msg.txt"
```

(Bỏ dòng `diem.json` nào không đổi. KHÔNG stage `scripts/tmp-*.mts`.)

Message:

```
docs(hướng dẫn): mười một bố cục — Khung Art Deco, Thẻ tiêu bản, Chữ lớn

- Bước Bố cục liệt kê ba kiểu xu hướng 2026; bước Ảnh chính nói Chữ lớn dùng ảnh
  chính, Art Deco lấy ảnh thứ hai làm huy hiệu.
- Chụp lại ảnh bước Bố cục (vi/en); script tạm dùng khung nhìn cao hơn ở bước này.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 8: Đẩy lên production và kiểm tra — CONTROLLER, HỎI ANH TRƯỚC KHI PUSH

- [ ] **Step 1: Cây sạch == HEAD**

Dời `scripts/tmp-*.mts` ra `$S\tam\`; `git status --short` → trống; `npx tsc --noEmit` → không lỗi; vitest cả bộ → 0 failed; trả script tạm về.

- [ ] **Step 2: Quét trước khi push**

Run: `git fetch origin; git log --oneline origin/main..HEAD` → commit spec, plan, Task 1, 2, 3, 4, 5, 7 (+ fix nếu có).
Run: `git diff origin/main..HEAD -- src tests scripts docs | Select-String -Pattern 'sb_secret|eyJ[A-Za-z0-9_-]{10,}|postgres(ql)?://|SUPABASE_SECRET_KEY\s*=|@gmail\.com|dieu@'` → chỉ khớp chính dòng mẫu lệnh này trong tệp plan. `git diff --name-only origin/main..HEAD | Select-String 'scripts/tmp-'` → trống.

- [ ] **Step 3: Hỏi anh cho push; push**

Chỉ khi anh đồng ý rõ ràng. Run (Bash): `curl -s --max-time 30 https://hpcatalogue.app/login | grep -o '/_next/static/[^"]*' | sort -u | md5sum` (ghi lại), rồi `git push origin main`.

- [ ] **Step 4: Đợi Vercel**

Run (Bash, nền, timeout 10 phút): lặp mỗi 10 giây tới khi dấu vân tay `/login` khác bước 3 VÀ `md5sum` của `https://hpcatalogue.app/huong-dan/07-bo-cuc-mau.png` trùng `public/huong-dan/07-bo-cuc-mau.png`; in giờ lúc đổi; kiểm thêm bản `en/`.

- [ ] **Step 5: E2E trên production**

Run (PowerShell, tiền cảnh, timeout 10 phút): `$env:GOC="https://hpcatalogue.app"; $env:RA="$S\e2e-bo-cuc-prod"; npx tsx scripts/tmp-e2e-bo-cuc-xu-huong.mts`
Expected: `Ket qua: 15 dat, 0 hong`, `Da xoa 3 catalogue tam`, `Da xoa tai khoan tam`. Xem `xem-truoc-art-deco-sang-than.png`, `xem-truoc-chu-lon-toi-than.png`, `trang-khach-tieu-ban.png`.

- [ ] **Step 6: Soát trang Hướng dẫn trên production**

Run: `$env:GOC="https://hpcatalogue.app"; $env:NN="en"; $env:RA="$S\soat-prod-en-bocuc"; npx tsx scripts/tmp-xem-huong-dan.mts`, rồi `NN="vi"`, `RA="$S\soat-prod-vi-bocuc"`. Expected: EN `hinh: 22, anh tu thu muc en: 22, buoc: 22`; VI `hinh: 22, anh tu thu muc en: 0, buoc: 22`; mỗi lượt `Da xoa tai khoan tam`. Xem `hinh-08.png` hai bộ.

- [ ] **Step 7: Dọn dẹp**

Xoá `scripts/tmp-e2e-bo-cuc-xu-huong.mts`, `scripts/tmp-xem-huong-dan.mts`. `git status --short` → trống.

- [ ] **Step 8: Cập nhật memory** (`C:\Users\pit010\.claude\projects\C--Users-pit010-QUICKBOOK-WEBAPP\memory\`)

Thêm vào cuối `catalogue-chia-se-khach.md` (thay `<sha>` bằng `git rev-parse --short HEAD`, `<n>` bằng số dòng OK của E2E production):

```markdown
## Ba bố cục xu hướng 2026 (15/09/2026) — LIVE `<sha>`, E2E production <n>/<n>

Anh yêu cầu "3 mẫu template thật trending", có tìm trên mạng. Chọn và đã kiểm nguồn: Khung
Art Deco (Pinterest Predicts 2026 "Neodeco", Le Vian), Thẻ tiêu bản (It's Nice That "The visual
index", Kittl "Trinket design"), Chữ lớn (Fontfabric "Typographic Maximalism"). Bỏ: Sổ tay sưu
tầm (bằng chứng mạnh nhất nhưng dễ lệch sang trọng), Lưới Bento (chủ yếu blog SEO). Anh chọn
KHÔNG thêm chủ đề sẵn cho ba bố cục.

- Phần dùng chung của bố cục nằm ở `bo-cuc-chung.tsx`; bố cục mới ở `bo-cuc-xu-huong.tsx`, KHÔNG
  import từ `bo-cuc.tsx` (bo-cuc.tsx import ngược lại). Tách tệp đã chứng minh bằng snapshot
  markup tám bố cục cũ trước/sau.
- Chữ lớn lấy Loại SP → Chất liệu → Mã mẫu (`chuLonCuaMau`) — không in to thông số sale đã ẩn.
  Không chữ nào đè ảnh (bẫy tương phản tông tối).
- Component bố cục test được trong Vitest node: `renderToStaticMarkup` + `vi.mock("@/messages/dung-chu")`
  (AnhTai gọi useChu, module thật kéo server action); tệp test phải là `.test.ts`.
```

Thêm vào cuối `catalogue-anh-huong-dan.md`:

```markdown
## Bước Bố cục 11 thẻ (15/09/2026)

Khung Bố cục → Màu nhấn vượt 1600px khi có 11 bố cục: script đặt khung nhìn 2100px riêng cho bước
7b rồi trả về 1600 — đừng bỏ dòng trả về, không thì mọi ảnh sau đổi kích thước. Ảnh `07-bo-cuc-mau`
là hình 8 trên trang.
```
