# Chủ đề sẵn + tông, màu nhấn, bố cục mới — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm hàng Chủ đề (10 chủ đề bấm một lần đặt bố cục + tông + màu nhấn), 5 tông nền, 3 màu nhấn kèm sắc sáng cho nền tối, 2 bố cục (Bảng mẫu, Thư mời), và cập nhật trang Hướng dẫn — theo spec `docs/superpowers/specs/2026-09-12-catalogue-chu-de-design.md`.

**Architecture:** Mọi lựa chọn là danh sách hằng trong `src/modules/catalogue-share/giao-dien.model.ts` (chỉ thêm vào cuối); tông là khối biến CSS `.tone-*` trong `globals.css`; màu nhấn đi qua ba biến `--nhan-*` gắn bằng `style`, còn lớp `.mau-nhan` trong CSS chọn sắc theo tông và theo màn hình / bản in. Chủ đề là lối tắt giao diện, không lưu xuống bản ghi. Bố cục là component trong `src/app/catalogue/[slug]/bo-cuc.tsx`, dùng chung cho trang khách và Xem trước.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, TypeScript 5, Vitest 4, Playwright (tsx), Drizzle/postgres, Supabase.

## Global Constraints

- Repo: `C:\Users\pit010\catalogue-quote-system`, nhánh `main`, push chỉ bằng tài khoản quocviet-IT (remote đã gắn sẵn). Repo CÔNG KHAI: stage TỪNG FILE, không bao giờ `git add -A`/`git add .`; không commit email nhân viên thật, khoá, slug catalogue thật.
- `BO_CUC`, `TONE`, `NHAN`, `LOI_KEU_GOI`… chỉ THÊM VÀO CUỐI; `GIAO_DIEN_MAC_DINH` không đổi (danh-sach / beige / hong); `docGiaoDien` không bao giờ ném lỗi. Không migration, không đổi cột DB.
- Giá trị màu dùng ĐÚNG như bảng trong spec mục 3.2 và 3.3 (không làm tròn, không tự chỉnh).
- Ngưỡng tương phản: body/muted ≥ 4.5:1 và ink ≥ 7:1 trên foundation + card của mọi tông; chữ trắng trên `dam` ≥ 4.5:1; `nhat` trên foundation + card của mọi tông SÁNG ≥ 3:1; `sang` trên foundation + card của mọi tông TỐI ≥ 4.5:1.
- Tông tối: `toi`, `reu`, `do-ruou`, `than-chi`, `xanh-dem`. Bản in luôn ép nền sáng và dùng sắc `nhat`. Sắc sáng áp cả cho catalogue ĐÃ GỬI dùng tông tối (anh đã chốt).
- Chủ đề KHÔNG lưu xuống bản ghi; không chủ đề nào có bộ ba trùng mặc định.
- Bảng mẫu / Thư mời chỉ dùng các trường sẵn có của `MucCatalogue`; không thêm trường cho khách (giá, SKU, SO, MO).
- Mọi chữ trên giao diện nằm trong `src/messages/vi.ts` + `en.ts` (kiểu `BoChu` ép đủ khoá). Chữ Hướng dẫn nằm trong `src/messages/huong-dan.vi.ts` + `.en.ts`; số phần tử `chu` của mỗi bước = số mốc trong `scripts/chup-huong-dan.mts`.
- Chú thích trong code viết KHÔNG DẤU (theo lối cả repo); chữ hiện trên giao diện có dấu.
- Commit message tiếng Việt, ghi ra tệp UTF-8 rồi `git commit -F <tệp>`, dòng cuối: `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Chạy test: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run <đường dẫn>` (không cắt bớt output). Type-check: `npx tsc --noEmit`. Lint: `npx eslint`.
- `scripts/*.mts` nằm trong phạm vi tsc: import `../src/...` KHÔNG ghi đuôi `.ts`. Script tạm tên `scripts/tmp-*.mts`, không bao giờ commit, xoá khi xong; chạy tsc/lint khi chưa có script tạm.
- Máy chủ cục bộ: cổng 3100, khởi động detached bằng PowerShell (`Start-Process cmd /c "npx next start -p 3100 > <scratchpad>\server-3100.log 2>&1"`), dừng bằng `Get-NetTCPConnection -LocalPort 3100 -State Listen | % { Stop-Process -Id $_.OwningProcess -Force }`. PHẢI dừng trước `npm run build` (EPERM). Máy chủ cục bộ dùng chung DB production.
- Script Playwright: tài khoản admin tạm + catalogue tạm XOÁ trong `finally`; có hẹn giờ `setTimeout(() => browser.close(), N).unref()`; callback truyền vào `evaluate()` phải là hàm KHÔNG TÊN và chỉ nhận dữ liệu trần (bẫy `__name`).
- Mỗi lần sửa một tệp chỉ một thao tác Edit/lượt; sửa lần lượt.
- Push là bước riêng ở Task 7, sau khi mọi kiểm tra đạt.

---

## Cấu trúc tệp

| Tệp | Việc |
|---|---|
| `src/modules/catalogue-share/giao-dien.model.ts` | Thêm giá trị bố cục/tông/màu nhấn, `TONE_TOI`, sắc `sang`, `NHAN_GOI_Y`, `NHOM_CHU_DE`, `CHU_DE`, `chuDeDangChon` |
| `src/app/globals.css` | 5 khối tông, khối in cho tông tối, lớp `.mau-nhan` |
| `src/app/catalogue/[slug]/bo-cuc.tsx` | `LOP_TONE`, `bienMauNhan`, `data-bo-cuc` trên gốc mỗi bố cục, `BangMau`, `ThuMoi` |
| `src/app/catalogue/[slug]/page.tsx` | thêm lớp `mau-nhan` |
| `src/app/catalogue/tao/xem-truoc.tsx` | thêm lớp `mau-nhan` |
| `src/app/catalogue/tao/chon-giao-dien.tsx` | nhãn + ô màu cho tông/màu nhấn/bố cục mới, hình minh hoạ 2 bố cục, fieldset Chủ đề |
| `src/messages/vi.ts`, `src/messages/en.ts` | chữ mới |
| `src/messages/huong-dan.vi.ts`, `huong-dan.en.ts` | bước `chu_de` mới, sửa `bo_cuc_mau`, `gioi_thieu` |
| `src/app/admin/huong-dan/page.tsx` | thêm bước `07-chu-de` |
| `scripts/chup-huong-dan.mts` | chụp `07-chu-de`, chụp lại `07-bo-cuc-mau` |
| `public/huong-dan/**` | ảnh + `diem.json` chụp lại |
| `tests/app/doc-mau-css.ts` (mới) | helper đọc bảng màu từ CSS, dùng chung |
| `tests/app/tone-tuong-phan.test.ts` | dùng helper |
| `tests/app/mau-nhan-tuong-phan.test.ts` (mới) | tương phản màu nhấn + đối chiếu `TONE_TOI` với CSS |
| `tests/modules/catalogue-share/giao-dien.model.test.ts` | test giá trị mới, chủ đề |
| `tests/modules/catalogue-share/goi-y-nhan.test.ts` | gợi ý màu nhấn cho 5 tông mới |

---

### Task 1: Sắc nhấn chọn theo tông (sửa chữ màu nhấn trên nền tối)

**Files:**
- Create: `tests/app/doc-mau-css.ts`
- Create: `tests/app/mau-nhan-tuong-phan.test.ts`
- Modify: `tests/app/tone-tuong-phan.test.ts` (thay toàn bộ)
- Modify: `tests/modules/catalogue-share/giao-dien.model.test.ts:343-352`
- Modify: `src/modules/catalogue-share/giao-dien.model.ts:45-59`
- Modify: `src/app/catalogue/[slug]/bo-cuc.tsx:53-66`
- Modify: `src/app/globals.css` (sau khối `@media print` kết thúc ở dòng 201)
- Modify: `src/app/catalogue/[slug]/page.tsx:104`
- Modify: `src/app/catalogue/tao/xem-truoc.tsx:134`

**Interfaces:**
- Produces: `MAU_NHAN: Record<Nhan, { nhat: string; dam: string; sang: string }>`; `TONE_TOI: readonly Tone[]`; `bienMauNhan(nhan: Nhan): React.CSSProperties` trả `--nhan-nhat`, `--nhan-dam`, `--nhan-sang`; lớp CSS `mau-nhan`. Helper test: `CSS`, `VUNG_IN`, `trongVungIn(vt)`, `bangMau(tone)`, `doSang(hex)`, `tuongPhan(a, b)`.

- [ ] **Step 1: Tạo helper đọc bảng màu `tests/app/doc-mau-css.ts`**

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Doc bang mau cua cac tong THANG tu globals.css — dung chung cho test tuong phan cua
 * tong va cua mau nhan, de hai test khong tu giu hai ban sao cua mot bang mau.
 */
export const CSS = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");

export function docBien(nguon: string): Record<string, string> {
  const ra: Record<string, string> = {};
  for (const m of nguon.matchAll(/--color-hp-([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)) ra[m[1]] = m[2];
  return ra;
}

const batDauTheme = CSS.indexOf("@theme");
export const GOC = docBien(CSS.slice(batDauTheme, CSS.indexOf("}", batDauTheme)));

/**
 * Khoang [bat dau, ket thuc) cua moi khoi @media print. Bang mau ben trong la cua BAN IN,
 * khong phai cua man hinh — dem nham vao la kiem sai tong.
 *
 * Dem ngoac chu khong cat theo thu tu trong tep: mot tong co the dat khoi in rieng ngay
 * canh dinh nghia cua no (nhu tong hoa van).
 */
export function vungIn(css: string): [number, number][] {
  const ra: [number, number][] = [];
  let i = css.indexOf("@media print");
  while (i !== -1) {
    let sau = 0;
    let j = css.indexOf("{", i);
    for (; j < css.length; j++) {
      if (css[j] === "{") sau++;
      else if (css[j] === "}" && --sau === 0) break;
    }
    ra.push([i, j]);
    i = css.indexOf("@media print", j);
  }
  return ra;
}

export const VUNG_IN = vungIn(CSS);
export const trongVungIn = (vt: number) => VUNG_IN.some(([a, b]) => vt >= a && vt < b);

/** Bang mau cua mot tong = bien goc cua @theme, ghi de boi cac khoi .tone-<ten> ngoai phan in. */
export function bangMau(tone: string): Record<string, string> {
  if (tone === "beige") return GOC;
  const ra = { ...GOC };
  let thay = false;
  for (const m of CSS.matchAll(new RegExp(`\\.tone-${tone}\\s*\\{([^}]*)\\}`, "g"))) {
    if (trongVungIn(m.index ?? 0)) continue;
    thay = true;
    Object.assign(ra, docBien(m[1]));
  }
  if (!thay) throw new Error(`globals.css khong co khoi .tone-${tone}`);
  return ra;
}

export function doSang(hex: string): number {
  const kenh = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = kenh.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function tuongPhan(a: string, b: string): number {
  const [x, y] = [doSang(a), doSang(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
```

- [ ] **Step 2: Thay toàn bộ `tests/app/tone-tuong-phan.test.ts` để dùng helper**

```ts
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TONE } from "@/modules/catalogue-share/giao-dien.model";
import { CSS, bangMau, tuongPhan } from "./doc-mau-css";

/**
 * Moi tong mau cua trang khach xem phai DOC DUOC.
 *
 * Mau chu xam cua he thiet ke (#8A8178) tung rot AA tren nen kem ma khong ai hay.
 * Test nay doc THANG globals.css, nen them mot tong moi voi mau chu qua nhat la do
 * ngay, khong phai doi ai do nhin ra tren man hinh.
 */
describe("tuong phan chu cua tung tong mau", () => {
  for (const tone of TONE) {
    it(`${tone}: chu than bai va chu phu dat AA, chu dam dat AAA, tren nen lan tren the`, () => {
      const b = bangMau(tone);
      for (const nen of ["foundation", "card"] as const) {
        for (const chu of ["body", "muted"] as const) {
          const tl = tuongPhan(b[chu], b[nen]);
          expect(tl, `${tone}: ${chu} tren ${nen} chi ${tl.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
        }
        const dam = tuongPhan(b.ink, b[nen]);
        expect(dam, `${tone}: ink tren ${nen} chi ${dam.toFixed(2)}:1`).toBeGreaterThanOrEqual(7);
      }
    });
  }

  it("tong hoa van tro toi mot tep hoa van co that trong public/", () => {
    const m = /\.tone-hoa-van\s*\{[^}]*url\("([^"]+)"\)/.exec(CSS);
    expect(m, "khoi .tone-hoa-van khong co background-image").not.toBeNull();
    expect(existsSync(join(process.cwd(), "public", m![1]))).toBe(true);
  });
});
```

- [ ] **Step 3: Tạo `tests/app/mau-nhan-tuong-phan.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { MAU_NHAN, NHAN, TONE, TONE_TOI } from "@/modules/catalogue-share/giao-dien.model";
import { CSS, VUNG_IN, bangMau, doSang, trongVungIn, tuongPhan } from "./doc-mau-css";

/**
 * Mau nhan phai DOC DUOC tren moi tong: sac nhat tren nen sang, sac sang tren nen toi,
 * sac dam cho nut chu trang.
 *
 * Truoc 12/09/2026 bienMauNhan gan thang --color-hp-pink bang style, ma bien gan truc
 * tiep thang moi lop CSS — tong toi dung chung sac nhat, Man chin tren Xanh reu chi
 * 2.89:1. Gio CSS chon sac qua lop .mau-nhan; test doi chieu danh sach tong toi trong
 * model voi bo chon trong CSS de hai noi khong lech nhau.
 */
const laToi = (tone: string) => (TONE_TOI as readonly string[]).includes(tone);

describe("tuong phan cua mau nhan", () => {
  for (const nhan of NHAN) {
    it(`${nhan}: chu trang tren sac dam dat AA`, () => {
      const tl = tuongPhan("#FFFFFF", MAU_NHAN[nhan].dam);
      expect(tl, `${nhan}: trang tren dam chi ${tl.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    });

    it(`${nhan}: sac nhat tren tong sang >= 3:1, sac sang tren tong toi >= 4.5:1`, () => {
      for (const tone of TONE) {
        const b = bangMau(tone);
        const sac = laToi(tone) ? MAU_NHAN[nhan].sang : MAU_NHAN[nhan].nhat;
        const can = laToi(tone) ? 4.5 : 3;
        for (const nen of ["foundation", "card"] as const) {
          const tl = tuongPhan(sac, b[nen]);
          expect(tl, `${nhan} tren ${tone}/${nen} chi ${tl.toFixed(2)}:1`).toBeGreaterThanOrEqual(can);
        }
      }
    });
  }

  it("TONE_TOI dung la cac tong co nen toi trong CSS", () => {
    for (const tone of TONE) {
      const nen = bangMau(tone).foundation;
      expect(laToi(tone), `${tone}: nen ${nen}`).toBe(doSang(nen) < 0.2);
    }
  });

  it("bo chon .mau-nhan:is(...) o man hinh VA o ban in liet ke dung TONE_TOI", () => {
    const ds = [...CSS.matchAll(/\.mau-nhan:is\(([^)]*)\)/g)].map((m) => ({
      vt: m.index ?? 0,
      tone: [...m[1].matchAll(/\.tone-([a-z-]+)/g)].map((x) => x[1]).sort(),
    }));
    const mongDoi = [...TONE_TOI].sort();
    expect(ds.filter((x) => !trongVungIn(x.vt)).map((x) => x.tone)).toEqual([mongDoi]);
    expect(ds.filter((x) => trongVungIn(x.vt)).map((x) => x.tone)).toEqual([mongDoi]);
  });

  it("ban in ep MOI tong toi ve nen trang", () => {
    const trongIn = VUNG_IN.map(([a, b]) => CSS.slice(a, b)).join("\n");
    const khoi = [...trongIn.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
    for (const tone of TONE_TOI) {
      const co = khoi.some((m) => m[1].includes(`.tone-${tone}`) && /--color-hp-foundation:\s*#FFFFFF/i.test(m[2]));
      expect(co, `ban in chua ep .tone-${tone} ve nen trang`).toBe(true);
    }
  });
});
```

- [ ] **Step 4: Thêm test sắc sáng vào `tests/modules/catalogue-share/giao-dien.model.test.ts`**

Thay khối (dòng 343-352):

```ts
  it("mỗi màu nhấn có đủ hai sắc, và sắc đậm khác sắc nhạt", () => {
    // Sắc đậm dành riêng cho nút có chữ trắng; dùng chung một sắc là chữ trắng
    // trên hồng thương hiệu, chỉ đạt 3.81:1.
    for (const k of NHAN) {
      const m = MAU_NHAN[k];
      expect(m.nhat).toMatch(/^#[0-9A-F]{6}$/i);
      expect(m.dam).toMatch(/^#[0-9A-F]{6}$/i);
      expect(m.dam).not.toBe(m.nhat);
    }
  });
```

bằng:

```ts
  it("mỗi màu nhấn có đủ ba sắc, và ba sắc khác nhau", () => {
    // Sắc đậm dành riêng cho nút có chữ trắng; dùng chung một sắc là chữ trắng
    // trên hồng thương hiệu, chỉ đạt 3.81:1. Sắc sáng để vẽ chữ trên nền tối.
    for (const k of NHAN) {
      const m = MAU_NHAN[k];
      expect(m.nhat).toMatch(/^#[0-9A-F]{6}$/i);
      expect(m.dam).toMatch(/^#[0-9A-F]{6}$/i);
      expect(m.sang).toMatch(/^#[0-9A-F]{6}$/i);
      expect(new Set([m.nhat, m.dam, m.sang]).size).toBe(3);
    }
  });

  it("bốn màu nhấn cũ giữ đúng hai sắc cũ — catalogue tông sáng đã gửi không đổi", () => {
    expect(MAU_NHAN.hong).toMatchObject({ nhat: "#E91D79", dam: "#C4165F" });
    expect(MAU_NHAN.dong).toMatchObject({ nhat: "#A96A00", dam: "#8A5600" });
    expect(MAU_NHAN.luc).toMatchObject({ nhat: "#00806B", dam: "#006956" });
    expect(MAU_NHAN.man).toMatchObject({ nhat: "#A0439B", dam: "#873781" });
  });
```

- [ ] **Step 5: Chạy test, xác nhận ĐỎ**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/app tests/modules/catalogue-share/giao-dien.model.test.ts`
Expected: FAIL — `mau-nhan-tuong-phan.test.ts` hỏng (`TONE_TOI` undefined / không có bộ chọn `.mau-nhan:is`), model test hỏng ở `m.sang`. `tone-tuong-phan.test.ts` vẫn ĐẠT.

- [ ] **Step 6: Sửa `giao-dien.model.ts` — sắc `sang` và `TONE_TOI`**

Thay:

```ts
/**
 * Moi mau nhan co HAI sac.
 *
 * `nhat` de ve chu va duong ke tren nen; `dam` danh rieng cho nut co chu trang.
 * Hong thuong hieu chi dat 3.81:1 tren nen kem — du cho mot dong chu, khong du
 * cho chu trang tren nut.
 */
export const MAU_NHAN: Record<Nhan, { nhat: string; dam: string }> = {
  // Hong dung DUNG hai token dang co: catalogue khong chon gi phai ra y het
  // hom nay, khong lech mot chut nao.
  hong: { nhat: "#E91D79", dam: "#C4165F" },
  dong: { nhat: "#A96A00", dam: "#8A5600" },
  luc:  { nhat: "#00806B", dam: "#006956" },
  man:  { nhat: "#A0439B", dam: "#873781" },
};
```

bằng:

```ts
/**
 * Moi mau nhan co BA sac.
 *
 * `nhat` de ve chu va duong ke tren nen SANG; `dam` danh rieng cho nut co chu trang;
 * `sang` (oklch L .72 / C .15, them 12/09/2026) de ve chu tren nen TOI — sac nhat tren
 * nen toi chi con 2.89–4.15:1. Hong thuong hieu chi dat 3.81:1 tren nen kem — du cho
 * mot dong chu, khong du cho chu trang tren nut.
 */
export const MAU_NHAN: Record<Nhan, { nhat: string; dam: string; sang: string }> = {
  // Hong dung DUNG hai token dang co: catalogue khong chon gi phai ra y het
  // hom nay, khong lech mot chut nao.
  hong: { nhat: "#E91D79", dam: "#C4165F", sang: "#EF799D" },
  dong: { nhat: "#A96A00", dam: "#8A5600", sang: "#E0911B" },
  luc:  { nhat: "#00806B", dam: "#006956", sang: "#07BFA1" },
  man:  { nhat: "#A0439B", dam: "#873781", sang: "#D87FD1" },
};

/**
 * Cac tong NEN TOI. Tren cac tong nay chu mau nhan dung sac `sang`, va ban in ep ve nen
 * sang. Phai khop bo chon `.mau-nhan:is(...)` va khoi in trong globals.css — test
 * tests/app/mau-nhan-tuong-phan.test.ts doc thang CSS de doi chieu.
 */
export const TONE_TOI: readonly Tone[] = ["toi", "reu"];
```

- [ ] **Step 7: Sửa `bienMauNhan` trong `src/app/catalogue/[slug]/bo-cuc.tsx`**

Thay:

```ts
/**
 * Mau nhan cua catalogue, dat bang cach GHI DE hai bien mau hong.
 *
 * Nho vay moi cho dang dung `text-hp-pink` hay `bg-hp-pink-strong` deu doi theo
 * ma khong phai sua tung noi — va catalogue khong chon gi van ra dung hong
 * thuong hieu, vi mac dinh la "hong".
 */
export function bienMauNhan(nhan: Nhan): React.CSSProperties {
  const m = MAU_NHAN[nhan] ?? MAU_NHAN.hong;
  return {
    "--color-hp-pink": m.nhat,
    "--color-hp-pink-strong": m.dam,
  } as React.CSSProperties;
}
```

bằng:

```ts
/**
 * Mau nhan cua catalogue: gan BA sac cua mau nhan thanh bien --nhan-*.
 *
 * Lop `mau-nhan` trong globals.css chon sac cho --color-hp-pink / --color-hp-pink-strong:
 * nhat tren nen sang, sang tren nen toi, dam cho nut chu trang; ban in luon ve nhat.
 * Khong gan thang --color-hp-pink o day nua — bien gan bang style thang moi lop CSS,
 * nen truoc 12/09/2026 tong toi khong doi duoc sac. Phan tu nhan style nay PHAI co
 * lop `mau-nhan`.
 */
export function bienMauNhan(nhan: Nhan): React.CSSProperties {
  const m = MAU_NHAN[nhan] ?? MAU_NHAN.hong;
  return {
    "--nhan-nhat": m.nhat,
    "--nhan-dam": m.dam,
    "--nhan-sang": m.sang,
  } as React.CSSProperties;
}
```

- [ ] **Step 8: Thêm lớp `.mau-nhan` vào `src/app/globals.css`**

Thay:

```css
  /* Trang bia dung rieng mot to giay. */
  .bia-catalogue {
    break-after: page;
  }
}
```

bằng:

```css
  /* Trang bia dung rieng mot to giay. */
  .bia-catalogue {
    break-after: page;
  }
}

/*
 * Mau nhan cua catalogue (12/09/2026).
 *
 * bienMauNhan() chi gan ba bien --nhan-nhat / --nhan-dam / --nhan-sang len phan tu
 * ngoai cung; CSS o day quyet dinh dung sac nao. Truoc day ham do gan thang
 * --color-hp-pink bang style — bien gan truc tiep thang moi lop, nen tong toi khong
 * doi duoc sang sac sang hon va Man chin tren Xanh reu chi con 2.89:1.
 *
 * Dat SAU cac khoi .tone-*: cung do uu tien thi khoi viet sau thang. Danh sach tong toi
 * phai khop TONE_TOI trong giao-dien.model.ts (co test doi chieu).
 */
.mau-nhan {
  --color-hp-pink:        var(--nhan-nhat);
  --color-hp-pink-strong: var(--nhan-dam);
}

/* Nen toi: chu mau nhan dung sac sang. Nut chu trang van dung sac dam o tren. */
.mau-nhan:is(.tone-toi, .tone-reu) {
  --color-hp-pink:        var(--nhan-sang);
}

@media print {
  /* Ban in cua tong toi la nen trang — sac sang tren giay trang lai kho doc. */
  .mau-nhan:is(.tone-toi, .tone-reu) {
    --color-hp-pink:        var(--nhan-nhat);
  }
}
```

- [ ] **Step 9: Gắn lớp `mau-nhan` ở trang khách và Xem trước**

Trong `src/app/catalogue/[slug]/page.tsx` thay:

```tsx
      <div className={`min-h-screen ${LOP_TONE[g.tone]}`} style={bienMauNhan(g.nhan)}>
```

bằng:

```tsx
      <div className={`mau-nhan min-h-screen ${LOP_TONE[g.tone]}`} style={bienMauNhan(g.nhan)}>
```

Trong `src/app/catalogue/tao/xem-truoc.tsx` thay:

```tsx
      <div className={`flex-1 overflow-y-auto ${LOP_TONE[gia.tone]}`} style={bienMauNhan(gia.nhan)}>
```

bằng:

```tsx
      <div className={`mau-nhan flex-1 overflow-y-auto ${LOP_TONE[gia.tone]}`} style={bienMauNhan(gia.nhan)}>
```

- [ ] **Step 10: Chạy test + type-check, xác nhận XANH**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/app tests/modules/catalogue-share`
Expected: PASS toàn bộ.
Run: `npx tsc --noEmit`
Expected: không lỗi.

- [ ] **Step 11: Commit**

```bash
git add tests/app/doc-mau-css.ts tests/app/mau-nhan-tuong-phan.test.ts tests/app/tone-tuong-phan.test.ts tests/modules/catalogue-share/giao-dien.model.test.ts src/modules/catalogue-share/giao-dien.model.ts "src/app/catalogue/[slug]/bo-cuc.tsx" src/app/globals.css "src/app/catalogue/[slug]/page.tsx" src/app/catalogue/tao/xem-truoc.tsx
git commit -F <tệp message>
```

Message:

```
fix(catalogue): chữ màu nhấn trên nền tối dùng sắc sáng hơn cho dễ đọc

bienMauNhan gắn thẳng --color-hp-pink bằng style, mà biến gắn trực tiếp thắng mọi
lớp CSS: tông Nền tối / Xanh rêu dùng chung sắc nhấn của nền sáng (Mận chín trên
Xanh rêu chỉ 2.89:1), và khối .tone-toi đổi hồng sáng hơn không có tác dụng.

- Mỗi màu nhấn có thêm sắc sáng (oklch L .72 C .15); TONE_TOI khai trong model.
- bienMauNhan chỉ gắn --nhan-nhat/dam/sang; lớp .mau-nhan trong CSS chọn sắc theo
  tông, bản in luôn về sắc thường.
- Test mới đọc thẳng globals.css: tương phản màu nhấn trên mọi tông, và danh sách
  tông tối trong CSS khớp TONE_TOI. Anh chốt áp cho cả catalogue tối đã gửi.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 2: Năm tông nền và ba màu nhấn mới

**Files:**
- Modify: `tests/modules/catalogue-share/giao-dien.model.test.ts` (import + test mới + tên test cũ)
- Modify: `tests/modules/catalogue-share/goi-y-nhan.test.ts`
- Modify: `src/modules/catalogue-share/giao-dien.model.ts` (`TONE`, `TONE_TOI`, `NHAN`, `MAU_NHAN`, `NHAN_GOI_Y`)
- Modify: `src/app/globals.css`
- Modify: `src/app/catalogue/[slug]/bo-cuc.tsx` (`LOP_TONE`)
- Modify: `src/app/catalogue/tao/chon-giao-dien.tsx` (`nhanTone`, `nhanMauNhan`, `O_MAU`)
- Modify: `src/messages/vi.ts`, `src/messages/en.ts`

**Interfaces:**
- Consumes: `MAU_NHAN` 3 sắc, `TONE_TOI`, lớp `.mau-nhan` (Task 1).
- Produces: `Tone` thêm `"do-ruou" | "than-chi" | "xanh-dem" | "oai-huong" | "suong-bien"`; `Nhan` thêm `"ruby" | "luc-bao" | "sapphire"`; khoá chữ `tone_<khoa>`, `tone_<khoa>_mo_ta`, `nhan_ruby`, `nhan_luc_bao`, `nhan_sapphire`.

- [ ] **Step 1: Test model — import `TONE_TOI`, đổi tên test cũ, thêm khối test mới**

Trong import đầu `giao-dien.model.test.ts`, thay `  TONE,` bằng:

```ts
  TONE,
  TONE_TOI,
```

Thay `  it("nhận cả tám nền và bốn màu nhấn", () => {` bằng `  it("nhận mọi nền và mọi màu nhấn", () => {`.

Thêm vào CUỐI tệp:

```ts
describe("năm tông và ba màu nhấn mới (12/09/2026)", () => {
  it("chỉ thêm vào cuối — thứ tự cũ giữ nguyên", () => {
    expect(TONE).toEqual([
      "beige", "trang", "toi", "reu", "hoa-van", "champagne", "bach-kim", "hong-phan",
      "do-ruou", "than-chi", "xanh-dem", "oai-huong", "suong-bien",
    ]);
    expect(NHAN).toEqual(["hong", "dong", "luc", "man", "ruby", "luc-bao", "sapphire"]);
  });

  it("ba màu nhấn mới đúng giá trị đã đo", () => {
    expect(MAU_NHAN.ruby).toEqual({ nhat: "#D33A3C", dam: "#B02A2D", sang: "#F47B74" });
    expect(MAU_NHAN["luc-bao"]).toEqual({ nhat: "#009342", dam: "#007835", sang: "#53BE70" });
    expect(MAU_NHAN.sapphire).toEqual({ nhat: "#2275E8", dam: "#145EC1", sang: "#68A5FF" });
  });

  it("tông tối là đúng năm tông", () => {
    expect([...TONE_TOI].sort()).toEqual(["do-ruou", "reu", "than-chi", "toi", "xanh-dem"]);
  });

  it("docGiaoDien nhận tông và màu nhấn mới", () => {
    expect(docGiaoDien({ tone: "xanh-dem", nhan: "sapphire" })).toMatchObject({
      tone: "xanh-dem",
      nhan: "sapphire",
    });
  });
});
```

- [ ] **Step 2: Test gợi ý màu nhấn — thêm vào `goi-y-nhan.test.ts` trước dòng `});` cuối tệp**

```ts
  it("năm tông 12/09/2026 gợi ý đúng màu nhấn của chủ đề dùng tông đó", () => {
    expect(NHAN_GOI_Y["do-ruou"]).toBe("hong");
    expect(NHAN_GOI_Y["than-chi"]).toBe("sapphire");
    expect(NHAN_GOI_Y["xanh-dem"]).toBe("dong");
    expect(NHAN_GOI_Y["oai-huong"]).toBe("man");
    expect(NHAN_GOI_Y["suong-bien"]).toBe("luc");
  });
```

- [ ] **Step 3: Chạy test, xác nhận ĐỎ**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/modules/catalogue-share tests/app`
Expected: FAIL ở 4 test mới của model và test gợi ý mới; `tone-tuong-phan` / `mau-nhan-tuong-phan` vẫn ĐẠT.

- [ ] **Step 4: Sửa model**

Thay:

```ts
export const TONE = [
  "beige", "trang", "toi", "reu",
  "hoa-van", "champagne", "bach-kim", "hong-phan",
] as const;
```

bằng:

```ts
export const TONE = [
  "beige", "trang", "toi", "reu",
  "hoa-van", "champagne", "bach-kim", "hong-phan",
  // Nam tong 12/09/2026 cho hang Chu de (dip, nhom hang, khach).
  "do-ruou", "than-chi", "xanh-dem", "oai-huong", "suong-bien",
] as const;
```

Thay:

```ts
 * La mot DANH SACH DONG chu khong phai o chon mau tu do: bon mau nay cung do
 * sang va do tuoi trong oklch (L .58 / C .19), chi khac sac, nen ghep voi nen
 * nao cung khong choi. Mo cho chon mau bat ky la som muon cung co mot catalogue
 * gui khach voi chu vang chanh tren nen kem.
 */
export const NHAN = ["hong", "dong", "luc", "man"] as const;
```

bằng:

```ts
 * La mot DANH SACH DONG chu khong phai o chon mau tu do: cac mau nay cung do
 * sang va do tuoi trong oklch (L .58 / C toi da .19 trong gamut), chi khac sac, nen
 * ghep voi nen nao cung khong choi. Mo cho chon mau bat ky la som muon cung co mot
 * catalogue gui khach voi chu vang chanh tren nen kem. Ba mau cuoi them 12/09/2026,
 * lap ba khoang trong 25°, 150°, 258° cua vong mau.
 */
export const NHAN = ["hong", "dong", "luc", "man", "ruby", "luc-bao", "sapphire"] as const;
```

Thay:

```ts
  man:  { nhat: "#A0439B", dam: "#873781", sang: "#D87FD1" },
};
```

bằng:

```ts
  man:  { nhat: "#A0439B", dam: "#873781", sang: "#D87FD1" },
  ruby: { nhat: "#D33A3C", dam: "#B02A2D", sang: "#F47B74" },
  "luc-bao": { nhat: "#009342", dam: "#007835", sang: "#53BE70" },
  sapphire: { nhat: "#2275E8", dam: "#145EC1", sang: "#68A5FF" },
};
```

Thay `export const TONE_TOI: readonly Tone[] = ["toi", "reu"];` bằng:

```ts
export const TONE_TOI: readonly Tone[] = ["toi", "reu", "do-ruou", "than-chi", "xanh-dem"];
```

Thay:

```ts
  "hong-phan": "hong",
};
```

(khối `NHAN_GOI_Y`) bằng:

```ts
  "hong-phan": "hong",
  // Tong 12/09/2026: dung mau nhan cua chu de dung tong do.
  "do-ruou": "hong",
  "than-chi": "sapphire",
  "xanh-dem": "dong",
  "oai-huong": "man",
  "suong-bien": "luc",
};
```

- [ ] **Step 5: Sửa `globals.css` — bốn chỗ**

(a) Thay:

```css
.tone-bach-kim,
.tone-hong-phan {
  background-color: var(--color-hp-foundation);
}
```

bằng:

```css
.tone-bach-kim,
.tone-hong-phan,
.tone-do-ruou,
.tone-than-chi,
.tone-xanh-dem,
.tone-oai-huong,
.tone-suong-bien {
  background-color: var(--color-hp-foundation);
}
```

(b) Thay:

```css
  --color-hp-pink:        #E8559A;
  --color-hp-pink-strong: #F08BBB;
}
```

bằng:

```css
  --color-hp-pink:        #E8559A;
  --color-hp-pink-strong: #F08BBB;
}

/* Do ruou (12/09/2026) — tong toi am, cho Valentine va qua tang nguoi thuong. */
.tone-do-ruou {
  --color-hp-foundation:  #2A1418;
  --color-hp-card:        #331A1F;
  --color-hp-inset:       #3D2126;
  --color-hp-ink:         #F6ECEA;
  --color-hp-body:        #E2D1CF;
  --color-hp-muted:       #B39A98;
  --color-hp-rule:        #4A2C31;
}

/* Than chi — xam than lanh, cho trang suc nam. */
.tone-than-chi {
  --color-hp-foundation:  #1B1E22;
  --color-hp-card:        #23272C;
  --color-hp-inset:       #2B3036;
  --color-hp-ink:         #EEF1F4;
  --color-hp-body:        #D0D5DB;
  --color-hp-muted:       #99A1AA;
  --color-hp-rule:        #363C43;
}

/* Xanh dem — xanh dem sau, cho khach VIP. */
.tone-xanh-dem {
  --color-hp-foundation:  #141B2B;
  --color-hp-card:        #1B2336;
  --color-hp-inset:       #232C41;
  --color-hp-ink:         #EEF1F7;
  --color-hp-body:        #CFD6E3;
  --color-hp-muted:       #98A2B6;
  --color-hp-rule:        #2E3850;
}

/* Oai huong — tim nhat diu dang, cho Ngay cua Me. */
.tone-oai-huong {
  --color-hp-foundation:  #EFE9F6;
  --color-hp-card:        #F9F6FC;
  --color-hp-inset:       #E4DCEE;
  --color-hp-ink:         #25202D;
  --color-hp-body:        #423B4C;
  --color-hp-muted:       #62596E;
  --color-hp-rule:        #D9CFE6;
}

/* Suong bien — xanh suong nhat, cho ngoc trai. */
.tone-suong-bien {
  --color-hp-foundation:  #E6F0EE;
  --color-hp-card:        #F5FAF9;
  --color-hp-inset:       #D9E7E4;
  --color-hp-ink:         #1A2624;
  --color-hp-body:        #344543;
  --color-hp-muted:       #536563;
  --color-hp-rule:        #C9DBD7;
}
```

(c) Thay:

```css
  .tone-toi,
  .tone-reu {
    --color-hp-foundation:  #FFFFFF;
```

bằng:

```css
  .tone-toi,
  .tone-reu,
  .tone-do-ruou,
  .tone-than-chi,
  .tone-xanh-dem {
    --color-hp-foundation:  #FFFFFF;
```

(d) Thay MỌI chỗ (2 chỗ, Edit `replace_all`) `.mau-nhan:is(.tone-toi, .tone-reu)` bằng:

```css
.mau-nhan:is(.tone-toi, .tone-reu, .tone-do-ruou, .tone-than-chi, .tone-xanh-dem)
```

- [ ] **Step 6: `LOP_TONE` trong `bo-cuc.tsx`**

Thay:

```ts
  "hong-phan": "tone-hong-phan",
};
```

bằng:

```ts
  "hong-phan": "tone-hong-phan",
  "do-ruou": "tone-do-ruou",
  "than-chi": "tone-than-chi",
  "xanh-dem": "tone-xanh-dem",
  "oai-huong": "tone-oai-huong",
  "suong-bien": "tone-suong-bien",
};
```

- [ ] **Step 7: `chon-giao-dien.tsx` — nhãn và ô màu**

Thay:

```ts
    "hong-phan": { ten: m.tone_hong_phan, moTa: m.tone_hong_phan_mo_ta },
  };
```

bằng:

```ts
    "hong-phan": { ten: m.tone_hong_phan, moTa: m.tone_hong_phan_mo_ta },
    "do-ruou": { ten: m.tone_do_ruou, moTa: m.tone_do_ruou_mo_ta },
    "than-chi": { ten: m.tone_than_chi, moTa: m.tone_than_chi_mo_ta },
    "xanh-dem": { ten: m.tone_xanh_dem, moTa: m.tone_xanh_dem_mo_ta },
    "oai-huong": { ten: m.tone_oai_huong, moTa: m.tone_oai_huong_mo_ta },
    "suong-bien": { ten: m.tone_suong_bien, moTa: m.tone_suong_bien_mo_ta },
  };
```

Thay:

```ts
    man: t.mau_giao_dien.nhan_man,
  };
```

bằng:

```ts
    man: t.mau_giao_dien.nhan_man,
    ruby: t.mau_giao_dien.nhan_ruby,
    "luc-bao": t.mau_giao_dien.nhan_luc_bao,
    sapphire: t.mau_giao_dien.nhan_sapphire,
  };
```

Thay:

```ts
  "hong-phan": { nen: "#F8EDEC", muc: "#2E2325" },
};
```

bằng:

```ts
  "hong-phan": { nen: "#F8EDEC", muc: "#2E2325" },
  "do-ruou": { nen: "#2A1418", muc: "#F6ECEA" },
  "than-chi": { nen: "#1B1E22", muc: "#EEF1F4" },
  "xanh-dem": { nen: "#141B2B", muc: "#EEF1F7" },
  "oai-huong": { nen: "#EFE9F6", muc: "#25202D" },
  "suong-bien": { nen: "#E6F0EE", muc: "#1A2624" },
};
```

- [ ] **Step 8: Chữ `vi.ts`**

Thay dòng `    nhan_mau_mo_ta: "Bốn màu cùng độ sáng và độ tươi, chỉ khác sắc — ghép với nền nào cũng không chỏi.",` bằng:

```ts
    nhan_mau_mo_ta: "Bảy màu cùng độ sáng và độ tươi, chỉ khác sắc — ghép với nền nào cũng không chỏi; trên nền tối tự dùng sắc sáng hơn.",
```

Thay dòng `    nhan_man: "Mận chín",` bằng:

```ts
    nhan_man: "Mận chín",
    nhan_ruby: "Đỏ ruby",
    nhan_luc_bao: "Xanh lục bảo",
    nhan_sapphire: "Xanh sapphire",
```

Thay dòng `    tone_hong_phan: "Hồng phấn",` bằng:

```ts
    tone_hong_phan: "Hồng phấn",
    tone_do_ruou: "Đỏ rượu",
    tone_than_chi: "Than chì",
    tone_xanh_dem: "Xanh đêm",
    tone_oai_huong: "Oải hương",
    tone_suong_bien: "Sương biển",
```

Thay dòng `    tone_hong_phan_mo_ta: "Hồng phấn nhẹ nhàng. Hợp bộ sưu tập nữ tính, trẻ trung.",` bằng:

```ts
    tone_hong_phan_mo_ta: "Hồng phấn nhẹ nhàng. Hợp bộ sưu tập nữ tính, trẻ trung.",
    tone_do_ruou_mo_ta: "Đỏ rượu trầm và ấm. Hợp Valentine, nhẫn đôi, quà tặng người thương.",
    tone_than_chi_mo_ta: "Xám than lạnh, mạnh mẽ. Hợp trang sức nam.",
    tone_xanh_dem_mo_ta: "Xanh đêm sâu, sang trọng. Hợp khách VIP, trang sức cao cấp.",
    tone_oai_huong_mo_ta: "Tím oải hương nhạt, dịu dàng. Hợp Ngày của Mẹ, quà tặng nữ.",
    tone_suong_bien_mo_ta: "Xanh sương biển nhạt, trong trẻo. Hợp ngọc trai.",
```

- [ ] **Step 9: Chữ `en.ts`**

Thay dòng `    nhan_mau_mo_ta: "Four colours at the same lightness and saturation, differing only in hue — none of them clash with any background.",` bằng:

```ts
    nhan_mau_mo_ta: "Seven colours at the same lightness and saturation, differing only in hue — none of them clash with any background; on dark backgrounds a lighter shade is used.",
```

Thay dòng `    nhan_man: "Plum",` bằng:

```ts
    nhan_man: "Plum",
    nhan_ruby: "Ruby red",
    nhan_luc_bao: "Emerald",
    nhan_sapphire: "Sapphire blue",
```

Thay dòng `    tone_hong_phan: "Blush",` bằng:

```ts
    tone_hong_phan: "Blush",
    tone_do_ruou: "Wine red",
    tone_than_chi: "Graphite",
    tone_xanh_dem: "Midnight blue",
    tone_oai_huong: "Lavender",
    tone_suong_bien: "Sea mist",
```

Thay dòng `    tone_hong_phan_mo_ta: "A soft blush. Suits feminine, youthful collections.",` bằng:

```ts
    tone_hong_phan_mo_ta: "A soft blush. Suits feminine, youthful collections.",
    tone_do_ruou_mo_ta: "Deep, warm wine red. Suits Valentine's, couple rings, gifts for a loved one.",
    tone_than_chi_mo_ta: "Cool charcoal grey, strong and clean. Suits men's jewellery.",
    tone_xanh_dem_mo_ta: "Deep midnight blue, understated luxury. Suits VIP clients and fine jewellery.",
    tone_oai_huong_mo_ta: "Soft lavender. Suits Mother's Day and gifts for her.",
    tone_suong_bien_mo_ta: "Pale sea mist, clear and fresh. Suits pearls.",
```

- [ ] **Step 10: Chạy test + type-check, xác nhận XANH**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/app tests/modules/catalogue-share`
Expected: PASS — gồm `tone-tuong-phan` cho 13 tông và `mau-nhan-tuong-phan` cho 7 màu × 13 tông.
Run: `npx tsc --noEmit`
Expected: không lỗi.

- [ ] **Step 11: Commit**

```bash
git add tests/modules/catalogue-share/giao-dien.model.test.ts tests/modules/catalogue-share/goi-y-nhan.test.ts src/modules/catalogue-share/giao-dien.model.ts src/app/globals.css "src/app/catalogue/[slug]/bo-cuc.tsx" src/app/catalogue/tao/chon-giao-dien.tsx src/messages/vi.ts src/messages/en.ts
git commit -F <tệp message>
```

Message:

```
feat(catalogue): năm tông nền và ba màu nhấn mới

- Tông: Đỏ rượu, Than chì, Xanh đêm (tối), Oải hương, Sương biển (sáng). Chữ đạt
  AA/AAA trên nền và thẻ; ba tông tối in ra nền sáng; chọn tông là đổi màu nhấn gợi ý.
- Màu nhấn: Đỏ ruby, Xanh lục bảo, Xanh sapphire — cùng độ sáng và độ tươi với bốn
  màu cũ, mỗi màu có sắc sáng cho nền tối.
- Chỉ thêm vào cuối danh sách: catalogue đã gửi không đổi.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 3: Hai bố cục mới — Bảng mẫu và Thư mời

**Files:**
- Modify: `tests/modules/catalogue-share/giao-dien.model.test.ts`
- Modify: `src/modules/catalogue-share/giao-dien.model.ts:15-18`
- Modify: `src/app/catalogue/[slug]/bo-cuc.tsx` (gốc 6 bố cục, thêm `BangMau`, `ThuMoi`, `BANG`)
- Modify: `src/app/catalogue/tao/chon-giao-dien.tsx` (`nhanBoCuc`, `HinhBoCuc`)
- Modify: `src/messages/vi.ts`, `src/messages/en.ts`

**Interfaces:**
- Consumes: `thongSo`, `Anh`, `MaMau`, `GioiThieu`, `ThongSoDong`, `mocAnh`, `DoiSo` có sẵn trong `bo-cuc.tsx`.
- Produces: `BoCuc` thêm `"bang-mau" | "thu-moi"`; thuộc tính `data-bo-cuc="<khoá>"` trên `<ul>` gốc của mọi bố cục (mốc cho E2E); khoá chữ `mau_giao_dien.bo_cuc_bang_mau(_mo_ta)`, `bo_cuc_thu_moi(_mo_ta)`, `chia_se.bang_mau_so_anh` (`{n}`), `chia_se.thu_moi_danh_cho` (`{ten}`).

- [ ] **Step 1: Test model**

Thay `  it("nhận cả sáu bố cục", () => {` bằng `  it("nhận mọi bố cục", () => {`.

Thêm vào CUỐI tệp:

```ts
describe("hai bố cục mới (12/09/2026)", () => {
  it("chỉ thêm vào cuối — thứ tự cũ giữ nguyên", () => {
    expect(BO_CUC).toEqual([
      "danh-sach", "luoi", "lookbook", "trien-lam", "khung-co-dien", "tap-chi",
      "bang-mau", "thu-moi",
    ]);
  });

  it("docGiaoDien nhận Bảng mẫu và Thư mời", () => {
    expect(docGiaoDien({ boCuc: "bang-mau" }).boCuc).toBe("bang-mau");
    expect(docGiaoDien({ boCuc: "thu-moi" }).boCuc).toBe("thu-moi");
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận ĐỎ**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/modules/catalogue-share/giao-dien.model.test.ts`
Expected: FAIL ở 2 test mới.

- [ ] **Step 3: Model**

Thay:

```ts
export const BO_CUC = [
  "danh-sach", "luoi", "lookbook",
  "trien-lam", "khung-co-dien", "tap-chi",
] as const;
```

bằng:

```ts
export const BO_CUC = [
  "danh-sach", "luoi", "lookbook",
  "trien-lam", "khung-co-dien", "tap-chi",
  // 12/09/2026: Bang mau cho khach si, Thu moi cho khach VIP va do cuoi.
  "bang-mau", "thu-moi",
] as const;
```

- [ ] **Step 4: Chữ `vi.ts`**

Thay dòng `    bo_cuc_tap_chi_mo_ta: "Ảnh một bên, chữ bên kia, so le từng mẫu. Lướt nhanh nhất.",` bằng:

```ts
    bo_cuc_tap_chi_mo_ta: "Ảnh một bên, chữ bên kia, so le từng mẫu. Lướt nhanh nhất.",
    bo_cuc_bang_mau: "Bảng mẫu",
    bo_cuc_bang_mau_mo_ta: "Mỗi mẫu một hàng gọn: ảnh nhỏ cạnh thông số. Hợp khách sỉ, gửi nhiều mẫu, in gọn.",
    bo_cuc_thu_moi: "Thư mời",
    bo_cuc_thu_moi_mo_ta: "Mỗi mẫu một trang riêng, căn giữa, có dòng “Dành riêng cho” tên khách. Hợp khách VIP, đồ cưới.",
```

Thay dòng `    khach_gom: "{n} mẫu",` bằng:

```ts
    khach_gom: "{n} mẫu",
    // Bo cuc Bang mau / Thu moi (12/09/2026). {n} = so anh, {ten} = ten khach tren trang bia.
    bang_mau_so_anh: "{n} ảnh",
    thu_moi_danh_cho: "Dành riêng cho {ten}",
```

- [ ] **Step 5: Chữ `en.ts`**

Thay dòng `    bo_cuc_tap_chi_mo_ta: "Image one side, text the other, alternating. The quickest to skim.",` bằng:

```ts
    bo_cuc_tap_chi_mo_ta: "Image one side, text the other, alternating. The quickest to skim.",
    bo_cuc_bang_mau: "Line sheet",
    bo_cuc_bang_mau_mo_ta: "One compact row per model: a small picture beside its details. Suits wholesale buyers and long lists; prints tight.",
    bo_cuc_thu_moi: "Invitation",
    bo_cuc_thu_moi_mo_ta: "Each model on its own page, centred, with a “Specially for” line using the client's name. Suits VIP clients and bridal.",
```

Thay dòng `    khach_gom: "{n} models",` bằng:

```ts
    khach_gom: "{n} models",
    bang_mau_so_anh: "{n} images",
    thu_moi_danh_cho: "Specially for {ten}",
```

- [ ] **Step 6: `data-bo-cuc` trên gốc sáu bố cục cũ trong `bo-cuc.tsx`** (sáu Edit, lần lượt)

1. Thay
```tsx
function DanhSach({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul className="space-y-16">
```
bằng
```tsx
function DanhSach({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul data-bo-cuc="danh-sach" className="space-y-16">
```

2. Thay `    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">` bằng `    <ul data-bo-cuc="luoi" className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">`

3. Thay `    <ul className="space-y-24 print:space-y-0">` bằng `    <ul data-bo-cuc="lookbook" className="space-y-24 print:space-y-0">`

4. Thay `    <ul className="space-y-20 print:space-y-0">` bằng `    <ul data-bo-cuc="trien-lam" className="space-y-20 print:space-y-0">`

5. Thay
```tsx
function KhungCoDien({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul className="space-y-8">
```
bằng
```tsx
function KhungCoDien({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul data-bo-cuc="khung-co-dien" className="space-y-8">
```

6. Thay
```tsx
function TapChi({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul className="space-y-10">
```
bằng
```tsx
function TapChi({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul data-bo-cuc="tap-chi" className="space-y-10">
```

- [ ] **Step 7: Thêm `BangMau`, `ThuMoi` và đăng ký vào `BANG`**

Thay:

```tsx
const BANG: Record<BoCuc, (p: DoiSo) => React.ReactElement> = {
  "danh-sach": DanhSach,
  luoi: Luoi,
  lookbook: Lookbook,
  "trien-lam": TrienLam,
  "khung-co-dien": KhungCoDien,
  "tap-chi": TapChi,
};
```

bằng:

```tsx
/**
 * Bo cuc 7 — bang mau (line sheet, 12/09/2026).
 *
 * Cho KHACH SI va danh sach dai: moi mau mot hang gon, anh chinh nho canh thong so, in
 * duoc nhieu mau mot trang. Chi hien anh CHINH: bam vao la mo khung phong to va luot
 * duoc moi anh — khung do tim anh theo fileId trong mang anh phang, khong can o cho
 * cac anh con lai.
 */
function BangMau({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul data-bo-cuc="bang-mau" className="border-t border-hp-rule">
      {muc.map((m, i) => {
        const [chinh] = m.anh;
        const ct = thongSo(m, g, t);
        return (
          <li
            key={`${m.maMau ?? "x"}-${i}`}
            className="grid break-inside-avoid grid-cols-[120px_1fr] gap-4 border-b border-hp-rule py-4
                       sm:grid-cols-[180px_1fr_auto] sm:gap-6"
          >
            <div>
              {chinh ? (
                <Anh m={m} fileId={chinh.fileId} ten={chinh.ten} rong={600}
                     tyLe="aspect-[4/3]" uuTien={moc[i] === 0} />
              ) : (
                <div aria-hidden className="aspect-[4/3] bg-hp-plate" />
              )}
              {m.anh.length > 1 && (
                <span className="mt-1.5 block text-[11px] tabular-nums text-hp-muted">
                  {t.chia_se.bang_mau_so_anh.replace("{n}", String(m.anh.length))}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <MaMau m={m} t={t} />
              {ct.length > 0 && (
                <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                  {ct.map(([nhan, v]) => (
                    <div key={nhan}>
                      <dt className="text-[10px] uppercase tracking-[0.14em] text-hp-muted">{nhan}</dt>
                      <dd className="mt-0.5 text-sm text-hp-body">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <GioiThieu m={m} lop="mt-2" />
            </div>

            <span className="hidden text-[11px] tabular-nums text-hp-muted sm:block">
              {String(i + 1).padStart(2, "0")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Bo cuc 8 — thu moi (12/09/2026).
 *
 * Cho KHACH VIP va DO CUOI: moi mau mot trang rieng, can giua nhu mot tam thiep — dong
 * "Danh rieng cho <ten khach>" lay tu trang bia, anh chinh trong khung ke mong, ma mau
 * chu tieu de. Khac Khung co dien (xep lien nhau, ke doi, hai anh canh nhau) va Lookbook
 * (anh tran be ngang, bang thong so): o day moi mau chiem mot man hinh, mot to giay.
 */
function ThuMoi({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  const tenKhach = g.bia?.tenKhach ?? "";
  return (
    <ul data-bo-cuc="thu-moi">
      {muc.map((m, i) => {
        const [chinh, ...phu] = m.anh;
        return (
          <li
            key={`${m.maMau ?? "x"}-${i}`}
            className="flex min-h-[85vh] break-inside-avoid flex-col items-center justify-center gap-5
                       border-t border-hp-rule py-14 text-center first:border-t-0
                       print:min-h-0 print:break-after-page"
          >
            {tenKhach && (
              <span className="text-[11px] uppercase tracking-[0.18em] text-hp-muted">
                {t.chia_se.thu_moi_danh_cho.replace("{ten}", tenKhach)}
              </span>
            )}
            <span className="text-[11px] tabular-nums text-hp-muted">
              {String(i + 1).padStart(2, "0")} / {String(muc.length).padStart(2, "0")}
            </span>

            {chinh && (
              <div className="w-full max-w-xl border border-hp-rule p-3">
                <Anh m={m} fileId={chinh.fileId} ten={chinh.ten} rong={1600}
                     tyLe="aspect-[4/3]" uuTien={moc[i] === 0} />
              </div>
            )}

            <span className="font-title text-[30px] leading-none tracking-[0.06em] text-hp-ink">
              {m.maMau ?? t.catalogue_sheet.chua_co_ma_mau}
            </span>

            {/* Duong trang tri ngan: vach – hat thoi mau nhan – vach. */}
            <div aria-hidden className="flex w-24 items-center gap-2">
              <span className="h-px flex-grow bg-hp-rule" />
              <span className="h-1.5 w-1.5 rotate-45 bg-hp-pink" />
              <span className="h-px flex-grow bg-hp-rule" />
            </div>

            <ThongSoDong ds={thongSo(m, g, t)} />
            <GioiThieu m={m} lop="mx-auto" />

            {phu.length > 0 && (
              <ul className="mt-2 grid w-full max-w-xl grid-cols-4 gap-2">
                {phu.map((a) => (
                  <li key={a.fileId}>
                    <Anh m={m} fileId={a.fileId} ten={a.ten} rong={500}
                         tyLe="aspect-[4/3]" uuTien={false} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const BANG: Record<BoCuc, (p: DoiSo) => React.ReactElement> = {
  "danh-sach": DanhSach,
  luoi: Luoi,
  lookbook: Lookbook,
  "trien-lam": TrienLam,
  "khung-co-dien": KhungCoDien,
  "tap-chi": TapChi,
  "bang-mau": BangMau,
  "thu-moi": ThuMoi,
};
```

- [ ] **Step 8: `chon-giao-dien.tsx` — nhãn và hình minh hoạ**

Thay:

```ts
    "tap-chi": {
      ten: t.mau_giao_dien.bo_cuc_tap_chi,
      moTa: t.mau_giao_dien.bo_cuc_tap_chi_mo_ta,
    },
  };
```

bằng:

```ts
    "tap-chi": {
      ten: t.mau_giao_dien.bo_cuc_tap_chi,
      moTa: t.mau_giao_dien.bo_cuc_tap_chi_mo_ta,
    },
    "bang-mau": {
      ten: t.mau_giao_dien.bo_cuc_bang_mau,
      moTa: t.mau_giao_dien.bo_cuc_bang_mau_mo_ta,
    },
    "thu-moi": {
      ten: t.mau_giao_dien.bo_cuc_thu_moi,
      moTa: t.mau_giao_dien.bo_cuc_thu_moi_mo_ta,
    },
  };
```

Thay:

```tsx
  const o = "bg-hp-rule";
  if (kieu === "trien-lam") {
```

bằng:

```tsx
  const o = "bg-hp-rule";
  if (kieu === "bang-mau") {
    return (
      <div aria-hidden className="mx-auto max-w-[150px] divide-y divide-hp-rule border-y border-hp-rule">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5">
            <div className={`${o} aspect-[4/3] w-9 shrink-0`} />
            <div className="flex flex-grow flex-col gap-1">
              <div className="h-1.5 w-1/2 bg-hp-ink/40" />
              <div className="h-1 w-full bg-hp-rule" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (kieu === "thu-moi") {
    return (
      <div aria-hidden className="mx-auto flex max-w-[150px] flex-col items-center gap-1.5">
        <div className="h-1 w-1/3 bg-hp-rule" />
        <div className="w-4/5 border border-hp-rule p-1">
          <div className={`${o} aspect-[4/3]`} />
        </div>
        <div className="h-1.5 w-1/3 bg-hp-ink/40" />
        <div className="h-1 w-1/2 bg-hp-rule" />
      </div>
    );
  }
  if (kieu === "trien-lam") {
```

- [ ] **Step 9: Chạy test + type-check + lint**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/modules/catalogue-share tests/app`
Expected: PASS.
Run: `npx tsc --noEmit` → không lỗi. Run: `npx eslint "src/app/catalogue/[slug]/bo-cuc.tsx" src/app/catalogue/tao/chon-giao-dien.tsx` → 0 lỗi.

- [ ] **Step 10: Commit**

```bash
git add tests/modules/catalogue-share/giao-dien.model.test.ts src/modules/catalogue-share/giao-dien.model.ts "src/app/catalogue/[slug]/bo-cuc.tsx" src/app/catalogue/tao/chon-giao-dien.tsx src/messages/vi.ts src/messages/en.ts
git commit -F <tệp message>
```

Message:

```
feat(catalogue): hai bố cục mới — Bảng mẫu cho khách sỉ, Thư mời cho khách VIP

- Bảng mẫu: mỗi mẫu một hàng gọn, ảnh chính nhỏ cạnh thông số, in nhiều mẫu mỗi
  trang; bấm ảnh vẫn lướt được mọi ảnh.
- Thư mời: mỗi mẫu một trang căn giữa, dòng "Dành riêng cho" tên khách lấy từ trang
  bìa, bản in mỗi mẫu một tờ.
- Gốc mỗi bố cục có data-bo-cuc để kiểm tra tự động. Chỉ dùng các trường sẵn có —
  không thêm thông tin nào cho khách.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 4: Hàng Chủ đề

**Files:**
- Modify: `tests/modules/catalogue-share/giao-dien.model.test.ts`
- Modify: `src/modules/catalogue-share/giao-dien.model.ts` (sau khối `NHAN_GOI_Y`)
- Modify: `src/app/catalogue/tao/chon-giao-dien.tsx`
- Modify: `src/messages/vi.ts`, `src/messages/en.ts`

**Interfaces:**
- Consumes: `BoCuc`, `Tone`, `Nhan` đủ giá trị mới (Task 2, 3); `O_MAU`, `MAU_NHAN`, `TONE_TOI`.
- Produces: `NHOM_CHU_DE`, `type NhomChuDe`, `CHU_DE`, `type ChuDe`, `type KhoaChuDe`, `chuDeDangChon(g: Pick<GiaoDienCatalogue, "boCuc" | "tone" | "nhan">): KhoaChuDe | null`; radio `name="chu_de"` với `value=<khoá>`; khoá chữ `mau_giao_dien.chu_de_nhan`, `chu_de_mo_ta`, `chu_de_nhom_dip`, `chu_de_nhom_nhom_hang`, `chu_de_nhom_khach`, `chu_de_<khoá có "_">` và `chu_de_<khoá có "_">_mo_ta`.

- [ ] **Step 1: Test model**

Thêm vào import đầu tệp (sau `  TONE_TOI,`):

```ts
  CHU_DE,
  NHOM_CHU_DE,
  chuDeDangChon,
```

Thêm vào CUỐI tệp:

```ts
describe("chủ đề sẵn (12/09/2026)", () => {
  it("đúng như thiết kế đã duyệt", () => {
    expect(CHU_DE.map((c) => [c.khoa, c.nhom, c.boCuc, c.tone, c.nhan])).toEqual([
      ["valentine", "dip", "lookbook", "do-ruou", "hong"],
      ["ngay-cua-me", "dip", "trien-lam", "oai-huong", "man"],
      ["giang-sinh", "dip", "khung-co-dien", "reu", "ruby"],
      ["nam", "nhom-hang", "tap-chi", "than-chi", "sapphire"],
      ["cuoi", "nhom-hang", "thu-moi", "trang", "dong"],
      ["ngoc-trai", "nhom-hang", "lookbook", "suong-bien", "luc"],
      ["khach-my", "khach", "trien-lam", "trang", "sapphire"],
      ["viet-kieu", "khach", "danh-sach", "beige", "ruby"],
      ["khach-si", "khach", "bang-mau", "trang", "hong"],
      ["vip", "khach", "thu-moi", "xanh-dem", "dong"],
    ]);
  });

  it("mọi giá trị hợp lệ và nhóm nào cũng có chủ đề", () => {
    for (const nhom of NHOM_CHU_DE) expect(CHU_DE.some((c) => c.nhom === nhom)).toBe(true);
    for (const c of CHU_DE) {
      expect(NHOM_CHU_DE).toContain(c.nhom);
      expect(BO_CUC).toContain(c.boCuc);
      expect(TONE).toContain(c.tone);
      expect(NHAN).toContain(c.nhan);
    }
  });

  it("khoá không trùng, bộ ba bố cục + tông + màu nhấn không trùng", () => {
    expect(new Set(CHU_DE.map((c) => c.khoa)).size).toBe(CHU_DE.length);
    expect(new Set(CHU_DE.map((c) => `${c.boCuc}|${c.tone}|${c.nhan}`)).size).toBe(CHU_DE.length);
  });

  it("không chủ đề nào trùng mặc định — catalogue không chọn gì không hiện như đang chọn chủ đề", () => {
    expect(chuDeDangChon(GIAO_DIEN_MAC_DINH)).toBeNull();
  });

  it("chuDeDangChon khớp đủ ba chiều; lệch một chiều là null", () => {
    expect(chuDeDangChon({ boCuc: "thu-moi", tone: "xanh-dem", nhan: "dong" })).toBe("vip");
    expect(chuDeDangChon({ boCuc: "thu-moi", tone: "trang", nhan: "dong" })).toBe("cuoi");
    expect(chuDeDangChon({ boCuc: "thu-moi", tone: "xanh-dem", nhan: "hong" })).toBeNull();
    expect(chuDeDangChon({ boCuc: "lookbook", tone: "xanh-dem", nhan: "dong" })).toBeNull();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận ĐỎ**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/modules/catalogue-share/giao-dien.model.test.ts`
Expected: FAIL (`CHU_DE` undefined).

- [ ] **Step 3: Model — thêm sau khối `NHAN_GOI_Y` (sau dòng `};` kết thúc khối đó)**

Thay:

```ts
  "suong-bien": "luc",
};
```

bằng:

```ts
  "suong-bien": "luc",
};

/** Nhom cua hang Chu de tren man hinh tao catalogue. */
export const NHOM_CHU_DE = ["dip", "nhom-hang", "khach"] as const;
export type NhomChuDe = (typeof NHOM_CHU_DE)[number];

type DinhNghiaChuDe = { khoa: string; nhom: NhomChuDe; boCuc: BoCuc; tone: Tone; nhan: Nhan };

/**
 * Chu de san (12/09/2026) — LOI TAT: bam mot lan dat bo cuc + tong + mau nhan hop nhau
 * cho mot dip, mot nhom hang hay mot kieu khach. KHONG luu xuong ban ghi: chu de "dang
 * chon" suy ra bang chuDeDangChon, nen doi hay bo chu de khong dong gi toi catalogue
 * da gui.
 *
 * Bo ba cua cac chu de khac nhau va KHONG trung mac dinh (danh-sach, beige, hong) — trung
 * thi catalogue khong chon gi se hien nhu dang chon mot chu de. Co test khoa lai.
 */
export const CHU_DE = [
  { khoa: "valentine", nhom: "dip", boCuc: "lookbook", tone: "do-ruou", nhan: "hong" },
  { khoa: "ngay-cua-me", nhom: "dip", boCuc: "trien-lam", tone: "oai-huong", nhan: "man" },
  { khoa: "giang-sinh", nhom: "dip", boCuc: "khung-co-dien", tone: "reu", nhan: "ruby" },
  { khoa: "nam", nhom: "nhom-hang", boCuc: "tap-chi", tone: "than-chi", nhan: "sapphire" },
  { khoa: "cuoi", nhom: "nhom-hang", boCuc: "thu-moi", tone: "trang", nhan: "dong" },
  { khoa: "ngoc-trai", nhom: "nhom-hang", boCuc: "lookbook", tone: "suong-bien", nhan: "luc" },
  { khoa: "khach-my", nhom: "khach", boCuc: "trien-lam", tone: "trang", nhan: "sapphire" },
  { khoa: "viet-kieu", nhom: "khach", boCuc: "danh-sach", tone: "beige", nhan: "ruby" },
  { khoa: "khach-si", nhom: "khach", boCuc: "bang-mau", tone: "trang", nhan: "hong" },
  { khoa: "vip", nhom: "khach", boCuc: "thu-moi", tone: "xanh-dem", nhan: "dong" },
] as const satisfies readonly DinhNghiaChuDe[];

export type ChuDe = (typeof CHU_DE)[number];
export type KhoaChuDe = ChuDe["khoa"];

/** Chu de khop DU ca bo cuc, tong va mau nhan dang chon; lech mot chieu thi null. */
export function chuDeDangChon(g: Pick<GiaoDienCatalogue, "boCuc" | "tone" | "nhan">): KhoaChuDe | null {
  const c = CHU_DE.find((x) => x.boCuc === g.boCuc && x.tone === g.tone && x.nhan === g.nhan);
  return c ? c.khoa : null;
}
```

- [ ] **Step 4: Chữ `vi.ts` — thêm sau dòng `    mo_ta: "Khách mở link sẽ thấy đúng kiểu anh chọn ở đây.",`**

Thay dòng đó bằng:

```ts
    mo_ta: "Khách mở link sẽ thấy đúng kiểu anh chọn ở đây.",

    // Chu de san (12/09/2026). Khoa = CHU_DE[].khoa, doi "-" thanh "_".
    chu_de_nhan: "Chủ đề",
    chu_de_mo_ta: "Bấm một chủ đề để đặt sẵn bố cục, tông và màu nhấn hợp nhau — vẫn chỉnh tay được bên dưới.",
    chu_de_nhom_dip: "Theo dịp",
    chu_de_nhom_nhom_hang: "Theo nhóm hàng",
    chu_de_nhom_khach: "Theo khách",
    chu_de_valentine: "Valentine",
    chu_de_valentine_mo_ta: "Đỏ rượu, ảnh lớn kiểu Lookbook. Nhẫn đôi, quà người thương.",
    chu_de_ngay_cua_me: "Ngày của Mẹ",
    chu_de_ngay_cua_me_mo_ta: "Oải hương dịu dàng, ảnh tràn kiểu Triển lãm.",
    chu_de_giang_sinh: "Giáng sinh & cuối năm",
    chu_de_giang_sinh_mo_ta: "Xanh rêu với đỏ ruby, khung cổ điển như tấm thiếp.",
    chu_de_nam: "Trang sức nam",
    chu_de_nam_mo_ta: "Than chì với xanh sapphire, bố cục Tạp chí mạnh mẽ.",
    chu_de_cuoi: "Đồ cưới",
    chu_de_cuoi_mo_ta: "Trắng với vàng đồng, mỗi mẫu một trang như thiếp mời.",
    chu_de_ngoc_trai: "Ngọc trai",
    chu_de_ngoc_trai_mo_ta: "Sương biển với xanh cổ vịt, ảnh lớn kiểu Lookbook.",
    chu_de_khach_my: "Khách Mỹ",
    chu_de_khach_my_mo_ta: "Trắng tối giản, ảnh tràn, nhấn xanh sapphire.",
    chu_de_viet_kieu: "Khách Việt kiều",
    chu_de_viet_kieu_mo_ta: "Nền kem quen thuộc, đỏ ruby, thông số rõ để so sánh.",
    chu_de_khach_si: "Khách sỉ / tiệm khác",
    chu_de_khach_si_mo_ta: "Bảng mẫu gọn: nhiều mẫu mỗi trang, in gọn.",
    chu_de_vip: "Khách VIP",
    chu_de_vip_mo_ta: "Xanh đêm với vàng đồng, mỗi mẫu một trang, có tên khách.",
```

- [ ] **Step 5: Chữ `en.ts` — thay dòng `    mo_ta: "Your customer sees the catalogue exactly the way you set it here.",` bằng**

```ts
    mo_ta: "Your customer sees the catalogue exactly the way you set it here.",

    chu_de_nhan: "Theme",
    chu_de_mo_ta: "Pick a theme to set a matching layout, colour and accent in one go — you can still adjust them below.",
    chu_de_nhom_dip: "By occasion",
    chu_de_nhom_nhom_hang: "By product",
    chu_de_nhom_khach: "By client",
    chu_de_valentine: "Valentine's Day",
    chu_de_valentine_mo_ta: "Wine red with big Lookbook pictures. Couple rings, gifts for a loved one.",
    chu_de_ngay_cua_me: "Mother's Day",
    chu_de_ngay_cua_me_mo_ta: "Soft lavender with full-width Gallery pictures.",
    chu_de_giang_sinh: "Christmas & holidays",
    chu_de_giang_sinh_mo_ta: "Moss green with ruby red in a Classic frame, like a greeting card.",
    chu_de_nam: "Men's jewellery",
    chu_de_nam_mo_ta: "Graphite with sapphire blue in a bold Magazine layout.",
    chu_de_cuoi: "Bridal",
    chu_de_cuoi_mo_ta: "White with antique gold, each model on its own page like an invitation.",
    chu_de_ngoc_trai: "Pearls",
    chu_de_ngoc_trai_mo_ta: "Sea mist with teal, big Lookbook pictures.",
    chu_de_khach_my: "US clients",
    chu_de_khach_my_mo_ta: "Minimal white, full-width pictures, sapphire accent.",
    chu_de_viet_kieu: "Vietnamese clients",
    chu_de_viet_kieu_mo_ta: "Familiar cream with ruby red and clear details to compare.",
    chu_de_khach_si: "Wholesale buyers",
    chu_de_khach_si_mo_ta: "Compact Line sheet: many models per page, prints tight.",
    chu_de_vip: "VIP clients",
    chu_de_vip_mo_ta: "Midnight blue with antique gold, one page per model with the client's name.",
```

- [ ] **Step 6: `chon-giao-dien.tsx` — import** (thay khối import model)

Thay:

```ts
import {
  BO_CUC, CACH_NHAN, DAI_DIEN_THOAI, DAI_LOI_CHAO, DAI_LOI_KEU_GOI, DAI_TEN_KHACH, DAI_TEN_SALE,
  LOI_KEU_GOI, MAU_NHAN, NHAN, NHAN_GOI_Y, THONG_SO, TONE, cauKeuGoi, coKhoiLienHe, goiYCachNhan,
  type BoCuc, type CachNhan, type GiaoDienCatalogue, type LienHe, type Nhan, type ThongSo,
  type Tone,
} from "@/modules/catalogue-share/giao-dien.model";
```

bằng:

```ts
import {
  BO_CUC, CACH_NHAN, CHU_DE, DAI_DIEN_THOAI, DAI_LOI_CHAO, DAI_LOI_KEU_GOI, DAI_TEN_KHACH,
  DAI_TEN_SALE, LOI_KEU_GOI, MAU_NHAN, NHAN, NHAN_GOI_Y, NHOM_CHU_DE, THONG_SO, TONE, TONE_TOI,
  cauKeuGoi, chuDeDangChon, coKhoiLienHe, goiYCachNhan,
  type BoCuc, type CachNhan, type GiaoDienCatalogue, type KhoaChuDe, type LienHe, type Nhan,
  type NhomChuDe, type ThongSo, type Tone,
} from "@/modules/catalogue-share/giao-dien.model";
```

- [ ] **Step 7: `chon-giao-dien.tsx` — hàm nhãn chủ đề** (thêm ngay trước `function nhanMauNhan`)

Thay:

```ts
function nhanMauNhan(t: BoChu): Record<Nhan, string> {
```

bằng:

```ts
function nhanChuDe(t: BoChu): Record<KhoaChuDe, { ten: string; moTa: string }> {
  const m = t.mau_giao_dien;
  return {
    valentine: { ten: m.chu_de_valentine, moTa: m.chu_de_valentine_mo_ta },
    "ngay-cua-me": { ten: m.chu_de_ngay_cua_me, moTa: m.chu_de_ngay_cua_me_mo_ta },
    "giang-sinh": { ten: m.chu_de_giang_sinh, moTa: m.chu_de_giang_sinh_mo_ta },
    nam: { ten: m.chu_de_nam, moTa: m.chu_de_nam_mo_ta },
    cuoi: { ten: m.chu_de_cuoi, moTa: m.chu_de_cuoi_mo_ta },
    "ngoc-trai": { ten: m.chu_de_ngoc_trai, moTa: m.chu_de_ngoc_trai_mo_ta },
    "khach-my": { ten: m.chu_de_khach_my, moTa: m.chu_de_khach_my_mo_ta },
    "viet-kieu": { ten: m.chu_de_viet_kieu, moTa: m.chu_de_viet_kieu_mo_ta },
    "khach-si": { ten: m.chu_de_khach_si, moTa: m.chu_de_khach_si_mo_ta },
    vip: { ten: m.chu_de_vip, moTa: m.chu_de_vip_mo_ta },
  };
}

function nhanNhomChuDe(t: BoChu): Record<NhomChuDe, string> {
  return {
    dip: t.mau_giao_dien.chu_de_nhom_dip,
    "nhom-hang": t.mau_giao_dien.chu_de_nhom_nhom_hang,
    khach: t.mau_giao_dien.chu_de_nhom_khach,
  };
}

function nhanMauNhan(t: BoChu): Record<Nhan, string> {
```

- [ ] **Step 8: `chon-giao-dien.tsx` — biến trong component**

Thay:

```ts
  const t = useChu();
  const boCuc = nhanBoCuc(t);
```

bằng:

```ts
  const t = useChu();
  const chuDe = nhanChuDe(t);
  const nhomChuDe = nhanNhomChuDe(t);
  const chuDeChon = chuDeDangChon(gia);
  const boCuc = nhanBoCuc(t);
```

- [ ] **Step 9: `chon-giao-dien.tsx` — fieldset Chủ đề trước Bố cục**

Thay:

```tsx
      {/* --- Bo cuc --- */}
      <fieldset className="mt-7">
```

bằng:

```tsx
      {/* --- Chu de --- (12/09/2026) Loi tat dat bo cuc + tong + mau nhan hop nhau. Khong
          luu xuong ban ghi: o nao khop ca ba gia tri dang chon thi o do duoc chon. */}
      <fieldset className="mt-7">
        <legend className={NHAN_NHOM}>{t.mau_giao_dien.chu_de_nhan}</legend>
        <p className="mt-1 text-xs text-hp-muted">{t.mau_giao_dien.chu_de_mo_ta}</p>
        <div className="mt-3 grid gap-5 sm:grid-cols-3">
          {NHOM_CHU_DE.map((nhom) => (
            <div key={nhom}>
              <span className="text-xs text-hp-muted">{nhomChuDe[nhom]}</span>
              <div className="mt-2 grid gap-2">
                {CHU_DE.filter((c) => c.nhom === nhom).map((c) => (
                  <label
                    key={c.khoa}
                    className={
                      "flex cursor-pointer items-start gap-3 border px-3 py-2.5 " +
                      "transition-colors duration-150 " +
                      (chuDeChon === c.khoa
                        ? "border-hp-ink bg-hp-inset"
                        : "border-hp-rule hover:border-hp-ink")
                    }
                  >
                    <input
                      type="radio"
                      name="chu_de"
                      value={c.khoa}
                      checked={chuDeChon === c.khoa}
                      onChange={() => dat({ boCuc: c.boCuc, tone: c.tone, nhan: c.nhan })}
                      className="sr-only"
                    />
                    {/* O mau: nen cua tong + cham mau nhan, dung sac khach se thay (nen toi
                        thi sac sang). */}
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-hp-rule"
                      style={{ background: O_MAU[c.tone].nen }}
                    >
                      <span
                        className="h-2 w-2"
                        style={{
                          background: TONE_TOI.includes(c.tone) ? MAU_NHAN[c.nhan].sang : MAU_NHAN[c.nhan].nhat,
                        }}
                      />
                    </span>
                    <span>
                      <span className="block text-sm text-hp-ink">{chuDe[c.khoa].ten}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-hp-muted">
                        {chuDe[c.khoa].moTa}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      {/* --- Bo cuc --- */}
      <fieldset className="mt-7">
```

- [ ] **Step 10: Chạy test + type-check + lint**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/modules/catalogue-share tests/app`
Expected: PASS. Run: `npx tsc --noEmit` → không lỗi. Run: `npx eslint src/app/catalogue/tao/chon-giao-dien.tsx src/modules/catalogue-share/giao-dien.model.ts` → 0 lỗi.

- [ ] **Step 11: Commit**

```bash
git add tests/modules/catalogue-share/giao-dien.model.test.ts src/modules/catalogue-share/giao-dien.model.ts src/app/catalogue/tao/chon-giao-dien.tsx src/messages/vi.ts src/messages/en.ts
git commit -F <tệp message>
```

Message:

```
feat(catalogue): hàng Chủ đề — 10 chủ đề theo dịp, nhóm hàng và khách

Bấm một chủ đề là đặt bố cục, tông và màu nhấn hợp nhau: Valentine, Ngày của Mẹ,
Giáng sinh & cuối năm; Trang sức nam, Đồ cưới, Ngọc trai; Khách Mỹ, Khách Việt kiều,
Khách sỉ, Khách VIP. Chủ đề là lối tắt, không lưu xuống bản ghi — chỉnh tay một chiều
thì không còn chủ đề nào được chọn; không chọn chủ đề nào thì như trước.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 5: Trang Hướng dẫn — bước Chủ đề mới, chụp lại ảnh

**Files:**
- Modify: `src/messages/huong-dan.vi.ts`, `src/messages/huong-dan.en.ts`
- Modify: `src/app/admin/huong-dan/page.tsx:67-68`
- Modify: `scripts/chup-huong-dan.mts:437-447`
- Regenerate: `public/huong-dan/*.png`, `public/huong-dan/diem.json`, `public/huong-dan/en/*.png`, `public/huong-dan/en/diem.json`
- Temp (không commit): `scripts/tmp-xem-huong-dan.mts`

**Interfaces:**
- Consumes: khoá chữ `mau_giao_dien.chu_de_nhan`, `chu_de_nhom_dip`, `chu_de_valentine`, `bo_cuc_nhan`, `bo_cuc_danh_sach`, `tone_beige`, `nhan_hong` (Task 2–4).
- Produces: bước hướng dẫn `huong_dan.chu_de` (3 `chu`, 2 `meo`), ảnh `07-chu-de`.

- [ ] **Step 1: `huong-dan.vi.ts` — bước mới** (thêm sau khối `ten_link`)

Thay:

```ts
      "Tạo xong vẫn đổi được tên link, và link cũ đã gửi khách vẫn mở được.",
    ],
  },

  bo_cuc_mau: {
```

bằng:

```ts
      "Tạo xong vẫn đổi được tên link, và link cũ đã gửi khách vẫn mở được.",
    ],
  },

  chu_de: {
    ten: "Chọn nhanh một chủ đề",
    mo_ta: "Hàng Chủ đề ở đầu khung Kiểu trình bày đặt sẵn bố cục, tông màu và màu nhấn hợp nhau cho một dịp, một nhóm hàng hay một kiểu khách. Không bắt buộc.",
    chu: [
      "Chủ đề chia ba nhóm: theo dịp, theo nhóm hàng và theo khách.",
      "Bấm một chủ đề là bố cục, tông màu và màu nhấn bên dưới đổi theo ngay — ô đang chọn có viền đậm.",
      "Chỉnh tay bố cục, tông hay màu nhấn thì không còn chủ đề nào được chọn; catalogue theo đúng lựa chọn của anh.",
    ],
    meo: [
      "Chủ đề chỉ là lối tắt: không chọn chủ đề nào thì catalogue vẫn như trước.",
      "Chủ đề Khách VIP và Đồ cưới dùng bố cục Thư mời — điền tên khách ở Trang bìa để mỗi trang có dòng “Dành riêng cho” tên khách.",
    ],
  },

  bo_cuc_mau: {
```

- [ ] **Step 2: `huong-dan.vi.ts` — sửa `bo_cuc_mau`**

Thay:

```ts
      "Sáu bố cục: Danh sách dọc (mặc định, dễ so sánh), Lưới ảnh (hợp nhiều mẫu), Lookbook và Triển lãm (ít mẫu, ảnh lớn), Khung cổ điển (dễ đọc thông số), Tạp chí (lướt nhanh).",
      "Tám tông màu nền. Chọn Hoa văn hồng hoặc Hồng phấn thì màu nhấn chuyển sang Hồng thương hiệu, Champagne sang Vàng đồng, Bạch kim sang Xanh cổ vịt — vẫn đổi lại được.",
      "Dòng gợi ý cho biết tông đang chọn hợp với nhóm sản phẩm nào.",
      "Màu nhấn: màu của logo HUNG PHAT, số thứ tự và nút Gọi trên trang khách.",
    ],
```

bằng:

```ts
      "Tám bố cục: Danh sách dọc (mặc định, dễ so sánh), Lưới ảnh (hợp nhiều mẫu), Lookbook và Triển lãm (ít mẫu, ảnh lớn), Khung cổ điển (dễ đọc thông số), Tạp chí (lướt nhanh), Bảng mẫu (khách sỉ, in gọn), Thư mời (mỗi mẫu một trang, cho khách VIP và đồ cưới).",
      "Mười ba tông màu nền. Nhiều tông tự chuyển màu nhấn cho hợp — ví dụ Champagne sang Vàng đồng, Than chì sang Xanh sapphire — vẫn đổi lại được.",
      "Dòng gợi ý cho biết tông đang chọn hợp với nhóm sản phẩm nào.",
      "Màu nhấn: màu của logo HUNG PHAT, số thứ tự và nút Gọi trên trang khách. Trên nền tối, chữ màu nhấn tự sáng hơn cho dễ đọc.",
    ],
```

- [ ] **Step 3: `huong-dan.vi.ts` — mẹo bản in và mẹo giới thiệu**

Thay dòng `      "Bản in PDF luôn dùng nền sáng cho dễ in, dù đang chọn Nền tối hay Xanh rêu.",` bằng:

```ts
      "Bản in PDF luôn dùng nền sáng cho dễ in, dù đang chọn tông tối (Nền tối, Xanh rêu, Đỏ rượu, Than chì, Xanh đêm).",
```

Thay dòng `      "Lời giới thiệu hiện ngay dưới thông số của mẫu ở cả sáu bố cục; ở Lưới ảnh nó nằm dưới ảnh đầu tiên của mẫu.",` bằng:

```ts
      "Lời giới thiệu hiện ngay dưới thông số của mẫu ở mọi bố cục; ở Lưới ảnh nó nằm dưới ảnh đầu tiên của mẫu.",
```

- [ ] **Step 4: `huong-dan.en.ts` — bước mới** (thêm sau khối `ten_link`)

Thay:

```ts
      "You can still rename the link after creating it, and the old link you sent keeps working.",
    ],
  },

  bo_cuc_mau: {
```

bằng:

```ts
      "You can still rename the link after creating it, and the old link you sent keeps working.",
    ],
  },

  chu_de: {
    ten: "Pick a theme",
    mo_ta: "The Theme row at the top of the Presentation box sets a matching layout, colour and accent for an occasion, a product group or a kind of client. Optional.",
    chu: [
      "Themes come in three groups: by occasion, by product and by client.",
      "Pick a theme and the layout, colour and accent below change to match — the chosen one gets a dark border.",
      "Change the layout, colour or accent by hand and no theme stays selected; the catalogue follows exactly what you chose.",
    ],
    meo: [
      "A theme is only a shortcut: pick none and the catalogue works as before.",
      "VIP clients and Bridal use the Invitation layout — fill in the customer name under Cover page so every page gets a “Specially for” line.",
    ],
  },

  bo_cuc_mau: {
```

- [ ] **Step 5: `huong-dan.en.ts` — sửa `bo_cuc_mau`, mẹo in, mẹo giới thiệu**

Thay:

```ts
      "Six layouts: Vertical list (default, easy to compare), Image grid (many models), Lookbook and Gallery (few models, big pictures), Classic frame (easiest to read details), Magazine (quickest to skim).",
      "Eight background colours. Pink toile or Blush switches the accent to Brand pink, Champagne to Antique gold, Platinum to Teal — you can still change it back.",
      "The hint line says which kind of jewellery the chosen colour suits.",
      "Accent colour: the colour of the HUNG PHAT logo, the numbers and the Call button on the customer page.",
    ],
```

bằng:

```ts
      "Eight layouts: Vertical list (default, easy to compare), Image grid (many models), Lookbook and Gallery (few models, big pictures), Classic frame (easiest to read details), Magazine (quickest to skim), Line sheet (wholesale, prints tight), Invitation (one page per model, for VIP clients and bridal).",
      "Thirteen background colours. Many switch the accent to match — Champagne to Antique gold, Graphite to Sapphire blue, for example — and you can still change it back.",
      "The hint line says which kind of jewellery the chosen colour suits.",
      "Accent colour: the colour of the HUNG PHAT logo, the numbers and the Call button on the customer page. On dark backgrounds the accent text turns lighter so it stays easy to read.",
    ],
```

Thay dòng `      "The PDF always prints on a light background, even with Dark or Deep green chosen.",` bằng:

```ts
      "The PDF always prints on a light background, even with a dark colour chosen (Dark, Deep green, Wine red, Graphite, Midnight blue).",
```

Thay dòng `      "The text appears right under the model's details in all six layouts; in Image grid it sits under the model's first picture.",` bằng:

```ts
      "The text appears right under the model's details in every layout; in Image grid it sits under the model's first picture.",
```

- [ ] **Step 6: `src/app/admin/huong-dan/page.tsx` — thêm bước**

Thay:

```ts
        { anh: "06-ten-link", nd: h.ten_link },
        { anh: "07-bo-cuc-mau", nd: h.bo_cuc_mau },
```

bằng:

```ts
        { anh: "06-ten-link", nd: h.ten_link },
        { anh: "07-chu-de", nd: h.chu_de },
        { anh: "07-bo-cuc-mau", nd: h.bo_cuc_mau },
```

- [ ] **Step 7: `scripts/chup-huong-dan.mts` — chụp bước Chủ đề, chụp lại bố cục**

Thay:

```ts
    // --- 7. Bo cuc, tong mau, mau nhan ---
    await page.setViewportSize({ width: RONG, height: 1400 });
    const kieu = page.locator("section").filter({ has: page.getByRole("heading", { name: dung(gd.tieu_de) }) }).first();
    await cuonToi(page, kieu, 40);
    await chup(luot, page, "07-bo-cuc-mau", [
      { o: kieu.getByText(dung(gd.bo_cuc_danh_sach)), huong: "duoi" },
      { o: khoi(page, dung(gd.tone_nhan)).locator("legend"), huong: "trai" },
      { o: kieu.getByText(dau(gd.tone_beige_mo_ta)), huong: "phai" },
      // O mau nhan CUOI: dat canh chu "Mau nhan" thi de len dong mo ta.
      { o: khoi(page, dung(gd.nhan_mau_nhan)).locator("label").last(), huong: "trai" },
    ], await khungTu(page, kieu, khoi(page, dung(gd.nhan_mau_nhan))));
```

bằng:

```ts
    // --- 7. Chu de --- (khung Kieu trinh bay cao ~1700px nen tach thanh hai anh)
    await page.setViewportSize({ width: RONG, height: 1600 });
    const kieu = page.locator("section").filter({ has: page.getByRole("heading", { name: dung(gd.tieu_de) }) }).first();
    const chuDe = khoi(page, dung(gd.chu_de_nhan));
    const boCucKhoi = khoi(page, dung(gd.bo_cuc_nhan));
    await cuonToi(page, kieu, 40);
    await chuDe.getByText(dung(gd.chu_de_valentine)).click();
    await page.waitForTimeout(300);
    await chup(luot, page, "07-chu-de", [
      { o: chuDe.getByText(dung(gd.chu_de_nhom_dip)), huong: "trai" },
      // O so ben TRAI o dang chon (ra le khung): ben phai la o chu de ke tiep.
      { o: chuDe.locator("label").filter({ has: page.locator("input:checked") }), huong: "phai" },
      { o: boCucKhoi.locator("legend"), huong: "trai" },
    ], await khungTu(page, kieu, boCucKhoi.locator("legend"), 24, 60));
    // Tra ve mac dinh: cac buoc sau (xem truoc, trang khach) chup bo cuc Danh sach doc,
    // tong Be co dien, mau nhan Hong thuong hieu.
    await kieu.getByText(dung(gd.bo_cuc_danh_sach)).click();
    await kieu.getByText(dung(gd.tone_beige)).click();
    await kieu.getByText(dung(gd.nhan_hong)).click();
    await page.waitForTimeout(300);

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

- [ ] **Step 8: Type-check, build, khởi động máy chủ, chụp hai bộ ảnh**

Run: `npx tsc --noEmit` → không lỗi.
Dừng máy chủ 3100 nếu đang chạy, rồi `npm run build` → build thành công.
Khởi động máy chủ detached (PowerShell) ở cổng 3100, đợi `/login` trả 200.
Run (nền, timeout 10 phút): `npm run huong-dan:anh`
Expected: in 22 dòng `[vi] …png` + `[vi] diem.json`, 22 dòng `[en] …` + `[en] diem.json`, dòng cuối `Xong.`; không có "khong xoa duoc tai khoan tam".
Nếu hỏng ở một mốc: đọc lỗi, sửa locator/`huong`, chạy lại.

- [ ] **Step 9: Khởi động lại máy chủ (trang đọc `diem.json` một lần lúc nạp) rồi tạo script soát tạm `scripts/tmp-xem-huong-dan.mts`**

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
  await trang.screenshot({ path: join(RA, "00-muc-luc.png") });
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

Run (PowerShell): `$env:NN="en"; $env:RA="<scratchpad>\soat-en-chude"; npx tsx scripts/tmp-xem-huong-dan.mts` rồi `$env:NN="vi"; $env:RA="<scratchpad>\soat-vi-chude"; npx tsx scripts/tmp-xem-huong-dan.mts`
Expected: `[en] hinh: 22, anh tu thu muc en: 22, buoc: 22, cau hoi: 12, tieu de: How to use it` và `[vi] hinh: 22, anh tu thu muc en: 0, buoc: 22, cau hoi: 12, tieu de: Hướng dẫn sử dụng`, mỗi lượt `Da xoa tai khoan tam`.

- [ ] **Step 10: Soát bằng mắt**

Mở `hinh-07.png` (Chủ đề) và `hinh-08.png` (Bố cục/màu) của CẢ HAI thư mục, và lướt các hình 09–16. Tiêu chí: ảnh là màn hình đúng ngôn ngữ; ô số không đè chữ, không đè nhau, không bị cắt mép; ô chủ đề Valentine có viền đậm ở ảnh 07; hàng tông có 13 ô, màu nhấn 7 ô ở ảnh 08; ảnh 14/16 vẫn là bố cục Danh sách dọc tông Be. Có lỗi thì đổi `huong`/mốc trong script, chụp lại (Step 8), khởi động lại máy chủ, soát lại.

- [ ] **Step 11: Dừng máy chủ, commit (KHÔNG stage `scripts/tmp-xem-huong-dan.mts`)**

Run: `git status --short` — liệt kê từng tệp ảnh đã đổi; stage đúng từng đường dẫn.

```bash
git add src/messages/huong-dan.vi.ts src/messages/huong-dan.en.ts src/app/admin/huong-dan/page.tsx scripts/chup-huong-dan.mts public/huong-dan/diem.json public/huong-dan/en/diem.json
git add public/huong-dan/07-chu-de.png public/huong-dan/en/07-chu-de.png
git add <từng tệp .png khác mà git status báo M, trong public/huong-dan/ và public/huong-dan/en/>
git diff --cached --name-status
git commit -F <tệp message>
```

Message:

```
docs(hướng dẫn): bước Chọn nhanh một chủ đề, cập nhật bố cục và tông mới

- Bước mới "Chọn nhanh một chủ đề" (ảnh 07-chu-de, vi/en) trước bước bố cục; tách
  riêng vì khung Kiểu trình bày giờ cao quá khung chụp.
- Bước bố cục: tám bố cục, mười ba tông, màu nhấn tự sáng trên nền tối, bản in liệt
  kê năm tông tối. Bước giới thiệu: "mọi bố cục".
- Chụp lại hai bộ ảnh; script bấm chủ đề Valentine để chụp rồi trả về mặc định cho
  các bước sau.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 6: Kiểm tra tổng và E2E cục bộ

**Files:**
- Temp (không commit): `scripts/tmp-e2e-chu-de.mts`

- [ ] **Step 1: Kiểm tra toàn bộ khi chưa có script tạm nào**

Xoá `scripts/tmp-xem-huong-dan.mts` nếu còn. Dừng máy chủ 3100.
Run: `npx tsc --noEmit` → không lỗi.
Run: `npx eslint` → 0 errors (cảnh báo cũ ở `products.service.ts`, `tests/lib/env.test.ts` là có sẵn).
Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run` → `Test Files … passed`, 0 failed (đọc TOÀN BỘ output).
Run: `npm run build` → thành công.
Khởi động máy chủ 3100 detached, đợi `/login` 200.

- [ ] **Step 2: Tạo `scripts/tmp-e2e-chu-de.mts`**

```ts
/**
 * TAM — khong commit. E2E cho hang Chu de, 5 tong, 3 mau nhan, sac sang nen toi, Bang mau
 * va Thu moi. Chay: GOC=<goc> RA=<thu muc anh> npx tsx scripts/tmp-e2e-chu-de.mts
 * Tai khoan admin tam + catalogue tam XOA trong finally; hen gio 6 phut.
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
import { CHU_DE, MAU_NHAN } from "../src/modules/catalogue-share/giao-dien.model";

const GOC = process.env.GOC ?? "http://localhost:3100";
const RA = process.env.RA;
if (!RA) throw new Error("Thieu bien RA");

const t = boChu("vi");
const gd = t.mau_giao_dien;
const ch = t.chia_se;
const thoat = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const co = (s: string) => new RegExp(thoat(s.trim()), "i");
const dung = (s: string) => new RegExp(`^${thoat(s.trim())}$`, "i");
const tenChuDe = (khoa: string) => (gd as Record<string, string>)[`chu_de_${khoa.replace(/-/g, "_")}`];

const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const EMAIL = `e2e-chude-${randomBytes(4).toString("hex")}@ctyhp.vn`;
const MAT_KHAU = randomBytes(18).toString("base64url");
let idNguoi: string | null = null;
let trinhDuyet: Browser | null = null;
let dat = 0;
let hong = 0;

function kiem(ten: string, ok: boolean, chiTiet = ""): void {
  if (ok) { dat++; console.log(`  OK   ${ten}`); } else { hong++; console.log(`  HONG ${ten} ${chiTiet}`); }
}

async function giaTriChon(page: Page, ten: string): Promise<string | null> {
  const o = page.locator(`input[name="${ten}"]:checked`);
  return (await o.count()) === 0 ? null : o.first().getAttribute("value");
}

async function sacNhan(page: Page): Promise<string> {
  return page.locator(".mau-nhan").first()
    .evaluate((el) => getComputedStyle(el).getPropertyValue("--color-hp-pink").trim().toUpperCase());
}

setTimeout(() => {
  console.log("HONG: qua 6 phut, dong trinh duyet de finally don dep");
  void trinhDuyet?.close().catch(() => {});
}, 6 * 60_000).unref();

try {
  await mkdir(RA, { recursive: true });
  const { data, error } = await supa.auth.admin.createUser({ email: EMAIL, password: MAT_KHAU, email_confirm: true });
  if (error) throw error;
  idNguoi = data.user.id;
  await sql`insert into users (id, email, full_name, role) values (${idNguoi}, ${EMAIL}, 'E2E chủ đề', 'admin')`;

  trinhDuyet = await chromium.launch();
  const ngu = await trinhDuyet.newContext({ viewport: { width: 1440, height: 900 } });
  await ngu.addCookies([{ name: "ngon-ngu", value: "vi", url: GOC }]);
  const page = await ngu.newPage();
  page.setDefaultTimeout(45_000);

  // Dang nhap bang mat khau
  await page.goto(`${GOC}/login`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.getByRole("button", { name: co(t.dang_nhap.khong_vao_duoc) }).click();
  await page.fill("#email", EMAIL);
  await page.fill("#mat_khau", MAT_KHAU);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 90_000, waitUntil: "commit" }),
    page.getByRole("button", { name: dung(t.dang_nhap.nut) }).click(),
  ]);

  // Chon hai mau co anh roi sang trang tao
  await page.goto(`${GOC}/admin/catalogue-sheet`, { waitUntil: "networkidle", timeout: 120_000 });
  const oTich = page.locator("tbody tr").filter({ has: page.locator("img") }).locator('input[type="checkbox"]');
  await oTich.first().waitFor();
  for (let i = 0; i < 2; i++) await oTich.nth(i).check();
  await page.goto(`${GOC}/catalogue/tao`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.locator("[data-anh]").first().waitFor({ timeout: 90_000 });

  // 1. Moi chu de dat dung ba gia tri
  const chuDeKhoi = page.locator("fieldset").filter({ has: page.locator("legend", { hasText: dung(gd.chu_de_nhan) }) }).first();
  kiem("hang Chu de co 10 o", (await chuDeKhoi.locator('input[name="chu_de"]').count()) === 10);
  kiem("mac dinh khong chu de nao duoc chon", (await giaTriChon(page, "chu_de")) === null);
  for (const c of CHU_DE) {
    await chuDeKhoi.getByText(dung(tenChuDe(c.khoa))).click();
    await page.waitForTimeout(150);
    const bc = await giaTriChon(page, "bo_cuc");
    const tn = await giaTriChon(page, "tone");
    const mn = await giaTriChon(page, "mau_nhan");
    const cd = await giaTriChon(page, "chu_de");
    kiem(`chu de ${c.khoa} -> ${c.boCuc} / ${c.tone} / ${c.nhan}`,
      bc === c.boCuc && tn === c.tone && mn === c.nhan && cd === c.khoa, `(thay ${bc} / ${tn} / ${mn} / ${cd})`);
  }

  // 2. Chinh tay mot chieu thi khong con chu de
  await page.locator("label").filter({ has: page.locator('input[name="tone"][value="beige"]') }).click();
  await page.waitForTimeout(150);
  kiem("chinh tay tong -> khong con chu de nao duoc chon", (await giaTriChon(page, "chu_de")) === null);

  // 3. Xem truoc Bang mau
  const hop = page.getByRole("dialog", { name: co(ch.xem_truoc) });
  const dongXemTruoc = async () => {
    await hop.getByRole("button", { name: dung(t.catalogue_sheet.dong_ngan) }).click();
    await hop.waitFor({ state: "hidden" });
  };
  await chuDeKhoi.getByText(dung(tenChuDe("khach-si"))).click();
  await page.getByRole("button", { name: dung(ch.xem_truoc) }).first().click();
  await hop.locator('[data-bo-cuc="bang-mau"]').waitFor({ timeout: 30_000 });
  kiem("Xem truoc Bang mau: moi mau mot hang", (await hop.locator('[data-bo-cuc="bang-mau"] > li').count()) === 2);
  kiem("Xem truoc Bang mau: tong trang, sac nhat cua hong",
    (await hop.locator(".mau-nhan.tone-trang").count()) === 1 && (await sacNhan(page)) === MAU_NHAN.hong.nhat,
    `(thay ${await sacNhan(page)})`);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(RA, "xem-truoc-bang-mau.png") });
  await dongXemTruoc();

  // 4. Chu de VIP + ten khach: Thu moi, nen toi dung sac sang
  await chuDeKhoi.getByText(dung(tenChuDe("vip"))).click();
  const bia = page.locator("fieldset").filter({ has: page.locator("legend", { hasText: dung(gd.bia_nhan) }) }).first();
  await bia.getByPlaceholder(gd.bia_ten_khach_goi_y).fill("Chị Thử");
  const dongDanhCho = ch.thu_moi_danh_cho.replace("{ten}", "Chị Thử");
  await page.getByRole("button", { name: dung(ch.xem_truoc) }).first().click();
  await hop.locator('[data-bo-cuc="thu-moi"]').waitFor({ timeout: 30_000 });
  kiem("Xem truoc Thu moi: moi mau mot trang", (await hop.locator('[data-bo-cuc="thu-moi"] > li').count()) === 2);
  kiem("Xem truoc Thu moi: dong Danh rieng cho o moi mau", (await hop.getByText(dongDanhCho, { exact: true }).count()) === 2);
  kiem("Xem truoc Xanh dem: sac SANG cua Vang dong", (await sacNhan(page)) === MAU_NHAN.dong.sang, `(thay ${await sacNhan(page)})`);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(RA, "xem-truoc-thu-moi.png") });
  await dongXemTruoc();

  // 5. Tao link, mo trang khach
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole("button", { name: co(ch.nut_tao) }).click();
  await page.getByRole("button", { name: co(ch.chep_link) }).waitFor({ state: "visible", timeout: 90_000 });
  const link = (await page.locator("p.break-all").first().textContent())?.trim() ?? "";
  kiem("tao duoc link", link.includes("/catalogue/"), link);

  const khach = await ngu.newPage();
  await khach.goto(link, { waitUntil: "networkidle", timeout: 120_000 });
  kiem("trang khach: .mau-nhan.tone-xanh-dem", (await khach.locator(".mau-nhan.tone-xanh-dem").count()) === 1);
  kiem("trang khach: bo cuc Thu moi", (await khach.locator('[data-bo-cuc="thu-moi"]').count()) === 1);
  kiem("trang khach: dong Danh rieng cho", (await khach.getByText(dongDanhCho, { exact: true }).count()) === 2);
  const sacManHinh = await sacNhan(khach);
  kiem("trang khach man hinh: sac sang", sacManHinh === MAU_NHAN.dong.sang, `(thay ${sacManHinh})`);
  await khach.emulateMedia({ media: "print" });
  const sacIn = await sacNhan(khach);
  kiem("trang khach ban in: sac nhat", sacIn === MAU_NHAN.dong.nhat, `(thay ${sacIn})`);
  await khach.emulateMedia({ media: "screen" });
  await khach.waitForTimeout(1500);
  await khach.screenshot({ path: join(RA, "trang-khach-vip.png") });
  await khach.close();

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

Run (PowerShell, nền, timeout 8 phút): `$env:GOC="http://localhost:3100"; $env:RA="<scratchpad>\e2e-chu-de-local"; npx tsx scripts/tmp-e2e-chu-de.mts`
Expected: 24 dòng `OK` (10 chủ đề + 14 kiểm tra khác), `Ket qua: 24 dat, 0 hong`, `Da xoa 1 catalogue tam`, `Da xoa tai khoan tam`, exit 0.
Nếu treo/hỏng: đọc output, xác nhận tài khoản + catalogue tạm đã xoá (`select count(*) from users where email like 'e2e-chude-%'` phải 0), sửa rồi chạy lại.

- [ ] **Step 4: Soát ảnh E2E bằng mắt**

Mở `xem-truoc-bang-mau.png`, `xem-truoc-thu-moi.png`, `trang-khach-vip.png`. Tiêu chí: Bảng mẫu — mỗi hàng ảnh bên trái, mã mẫu + thông số bên phải, số thứ tự sát phải, không chữ tràn; Thư mời — căn giữa, dòng "DÀNH RIÊNG CHO CHỊ THỬ", ảnh trong khung mảnh, mã mẫu to, hạt thoi màu vàng sáng trên nền xanh đêm, chữ đọc rõ. Có lỗi trình bày: sửa `bo-cuc.tsx`, chạy lại Task 6 Step 1 (tsc/lint/vitest/build — nhớ tạm dời script tmp ra ngoài `scripts/` hoặc xoá rồi tạo lại), commit riêng `fix(catalogue): …`, chạy lại E2E.

- [ ] **Step 5: Dừng máy chủ 3100.**

---

### Task 7: Đẩy lên production và kiểm tra trên bản thật

- [ ] **Step 1: Bản sao sạch của HEAD**

```powershell
$repo = "C:\Users\pit010\catalogue-quote-system"
$wt = "<scratchpad>\wt-kiem-chu-de"
git -C $repo worktree add --detach $wt HEAD
New-Item -ItemType Junction -Path "$wt\node_modules" -Target "$repo\node_modules" | Out-Null
Set-Location $wt
npx tsc --noEmit; "TSC_WT_EXIT=$LASTEXITCODE"
node --env-file="$repo\.env.local" node_modules/vitest/vitest.mjs run; "VITEST_WT_EXIT=$LASTEXITCODE"
Set-Location $repo
cmd /c rmdir "$wt\node_modules"
git -C $repo worktree remove --force $wt
```

Expected: `TSC_WT_EXIT=0`, vitest 0 failed, `VITEST_WT_EXIT=0`; worktree đã gỡ, `node_modules` gốc còn nguyên. (`rmdir` chỉ gỡ junction, KHÔNG dùng `Remove-Item -Recurse` lên junction.)

- [ ] **Step 2: Quét trước khi push**

Run: `git fetch origin; git status --short; git log --oneline origin/main..HEAD`
Expected: chỉ còn `?? scripts/tmp-e2e-chu-de.mts`; các commit Task 1–5 (+ fix nếu có) và commit spec/plan.
Run: `git diff origin/main..HEAD -- src tests scripts docs | Select-String -Pattern 'sb_secret|eyJ[A-Za-z0-9_-]{10,}|postgres(ql)?://|SUPABASE_SECRET_KEY\s*=|@gmail\.com|dieu@'`
Expected: không có dòng nào.

- [ ] **Step 3: Ghi dấu vân tay bản live, push**

Run (Bash): `curl -s --max-time 30 https://hpcatalogue.app/login | grep -o '/_next/static/[^"]*' | sort -u | md5sum`
Run: `git push origin main` → `<cũ>..<mới>  main -> main`.

- [ ] **Step 4: Đợi Vercel triển khai**

Run (Bash, nền, timeout 10 phút): lặp mỗi 10s tới khi `curl -s -o /dev/null -w '%{http_code}' https://hpcatalogue.app/huong-dan/07-chu-de.png` ra `200` VÀ dấu vân tay `/login` khác bước 3; in giờ lúc đổi.
Rồi đối chiếu: `curl` tải `https://hpcatalogue.app/huong-dan/07-chu-de.png` và `https://hpcatalogue.app/huong-dan/en/diem.json`, so `md5sum` với tệp trong repo — phải trùng.

- [ ] **Step 5: E2E trên production**

Run (PowerShell, nền, timeout 8 phút): `$env:GOC="https://hpcatalogue.app"; $env:RA="<scratchpad>\e2e-chu-de-prod"; npx tsx scripts/tmp-e2e-chu-de.mts`
Expected: `Ket qua: 24 dat, 0 hong`, `Da xoa 1 catalogue tam`, `Da xoa tai khoan tam`. Soát 3 ảnh như Task 6 Step 4.

- [ ] **Step 6: Soát trang Hướng dẫn trên production**

Tạo lại `scripts/tmp-xem-huong-dan.mts` (nội dung Task 5 Step 9). Run: `$env:GOC="https://hpcatalogue.app"; $env:NN="en"; $env:RA="<scratchpad>\soat-prod-en-chude"; npx tsx scripts/tmp-xem-huong-dan.mts`, rồi `NN="vi"`, `RA="<scratchpad>\soat-prod-vi-chude"`.
Expected: EN `hinh: 22, anh tu thu muc en: 22, buoc: 22`; VI `hinh: 22, anh tu thu muc en: 0, buoc: 22`; mỗi lượt `Da xoa tai khoan tam`. Xem `hinh-07.png` hai bộ.

- [ ] **Step 7: Dọn dẹp**

Xoá `scripts/tmp-e2e-chu-de.mts` và `scripts/tmp-xem-huong-dan.mts`. Run: `git status --short` → sạch.

- [ ] **Step 8: Cập nhật memory** (thư mục `C:\Users\pit010\.claude\projects\C--Users-pit010-QUICKBOOK-WEBAPP\memory\`)

Thêm vào cuối `catalogue-chia-se-khach.md` (thay `<sha>` bằng `git rev-parse --short HEAD`, `<n>` bằng số dòng OK của E2E production):

```markdown
## Chủ đề sẵn + 5 tông + 3 màu nhấn + Bảng mẫu / Thư mời (12/09/2026) — LIVE `<sha>`, E2E production <n>/<n>

Góp ý "thêm Theme theo nhóm sản phẩm hoặc phong cách". Anh chọn hướng theo dịp
(Valentine, Ngày của Mẹ, Giáng sinh & cuối năm — KHÔNG Tết), nhóm hàng (nam, cưới,
ngọc trai), khách (Mỹ, Việt kiều, sỉ, VIP), cách A "chủ đề sẵn", không hoạ tiết theo dịp.

- Hàng Chủ đề là LỐI TẮT: không lưu khoá chủ đề, `chuDeDangChon` suy ra từ bộ ba bố
  cục/tông/màu nhấn. Không bộ nào trùng mặc định (có test).
- **Bẫy đã sửa:** `bienMauNhan` từng gắn thẳng `--color-hp-pink` bằng `style` — biến gắn
  trực tiếp thắng mọi class, nên `.tone-toi { --color-hp-pink }` chết từ lâu mà không ai
  biết; Mận chín trên Xanh rêu 2.89:1. Giờ style chỉ gắn `--nhan-nhat/dam/sang`, lớp
  `.mau-nhan` + `TONE_TOI` chọn sắc, bản in về `nhat`. Anh chốt áp cả catalogue tối đã gửi.
- Bảng mẫu chỉ hiện ảnh chính (khung phóng to tìm theo fileId, vẫn lướt đủ ảnh). Thư
  mời lấy tên khách từ `bia.tenKhach`. `data-bo-cuc` trên gốc mỗi bố cục là mốc E2E.
- Spec `docs/superpowers/specs/2026-09-12-catalogue-chu-de-design.md`, plan cùng tên ở `plans/`.
```

Trong `catalogue-anh-huong-dan.md` thêm cuối tệp:

```markdown
## Bước Chủ đề (12/09/2026) — 22 bước

Bước "Chọn nhanh một chủ đề" (ảnh `07-chu-de`) tách riêng khỏi bước bố cục: khung Kiểu
trình bày cao ~1700px, gộp một ảnh thì vượt khung chụp. Script bấm Valentine để chụp rồi
TRẢ VỀ Danh sách dọc / Be cổ điển / Hồng thương hiệu — bước 14 và 16 chụp đúng bố cục đó.
```

Trong `MEMORY.md`, thay dòng `[Ảnh hướng dẫn có mũi tên]` bằng:

```markdown
- [Ảnh hướng dẫn có mũi tên](catalogue-anh-huong-dan.md) — 22 bước, HAI bộ ảnh (vi + en/, mỗi bộ một diem.json); chụp lại bằng npm run huong-dan:anh, soát BẰNG MẮT cả hai bộ trên trang (ô số theo px khung 768), ảnh phải commit; bẫy `__name` trong evaluate
```

- [ ] **Step 9: Báo cáo anh (tiếng Việt)** — commit đã lên, giờ Vercel xong, kết quả E2E production, ảnh chụp trang khách VIP và Bảng mẫu (gửi bằng SendUserFile), việc còn treo (góp ý 09:22 vẫn "mới" trong Hộp góp ý nếu anh chưa đánh dấu).
