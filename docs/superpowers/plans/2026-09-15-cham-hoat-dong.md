# Chấm màu hoạt động trên trang Tài khoản — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ghi lần cuối nhân viên dùng hệ thống (`users.last_seen_at`, tối đa 10 phút một lần) và hiện chấm xanh / vàng / xám kèm dòng chú giải trên trang Tài khoản — theo spec `docs/superpowers/specs/2026-09-15-cham-hoat-dong-design.md`.

**Architecture:** Quy tắc (ngưỡng ghi, gộp mốc, xếp mức, ghi-khi-cần) là hàm thuần trong `src/modules/nguoi-dung/nguoi-dung.model.ts`. Cửa gác `getSessionUser` đọc thêm `last_seen_at` trong câu SELECT sẵn có và chạy một câu UPDATE tuần tự khi mốc cũ từ 10 phút. `danhSachNguoiDung()` tính mức ở máy chủ với một mốc `bayGio`; bảng tài khoản (client component) chỉ hiển thị chấm và dòng chú giải.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, TypeScript 5, Vitest 4, Drizzle ORM 0.45 + drizzle-kit 0.31, postgres.js, Supabase, Playwright (tsx).

## Global Constraints

- Repo: `C:\Users\pit010\catalogue-quote-system`, nhánh `main`, push chỉ bằng tài khoản quocviet-IT (remote đã gắn sẵn). Repo CÔNG KHAI: stage TỪNG FILE, không bao giờ `git add -A`/`git add .`; không commit email nhân viên thật, khoá, slug catalogue thật.
- KHÔNG subagent nào chạy `npm run db:migrate`, `drizzle-kit push`, hay lệnh ghi vào bảng thật (ngoài tài khoản tạm do chính script tạo rồi xoá). Migration production là Task 4, controller làm SAU KHI anh cho phép.
- Thứ tự bắt buộc: migration (Task 4) TRƯỚC khi bất kỳ máy chủ nào chạy code mới (Task 5, 6) và TRƯỚC push (Task 7). Code mới liệt kê `users.last_seen_at` trong mọi câu Drizzle chạm bảng `users` (cửa gác, callback Google, danh sách/tạo tài khoản) — cột chưa có thì mọi trang có đăng nhập lỗi 500. Máy chủ cục bộ dùng chung DB production.
- Hằng và quy tắc (đúng giá trị): `PHUT_GIUA_HAI_LAN_GHI = 10`; `MucHoatDong = "trong-ngay" | "trong-tuan" | "lau"`; `MUC_HOAT_DONG = ["trong-ngay", "trong-tuan", "lau"]`; ghi khi mốc `null` hoặc `bayGio − lanCuoi ≥ 10 phút` (mốc tương lai → không ghi); mức: `null` → `lau`, hiệu `< 24 giờ` → `trong-ngay` (mốc tương lai cũng vậy), `< 7 ngày` → `trong-tuan`, còn lại → `lau`; mốc hiển thị = mốc muộn hơn giữa `last_seen_at` và `last_sign_in_at`.
- Cột: `users.last_seen_at timestamptz NULL`, schema `lastSeenAt: timestamp("last_seen_at", { withTimezone: true })`; migration `0008_users_last_seen_at.sql` chỉ có đúng câu `ALTER TABLE "users" ADD COLUMN "last_seen_at" timestamp with time zone;`.
- Ghi hoạt động: trong `getSessionUser`, `await` tuần tự ngay sau câu SELECT, trước khi hàm trả về; KHÔNG `after()`, KHÔNG ở `proxy.ts`; không ghi cho tài khoản bị khoá; UPDATE lỗi chỉ `console.error("[hoat-dong] khong ghi duoc lan cuoi hoat dong:", loi)`; điều kiện 10 phút lặp lại trong WHERE bằng `now()` của DB.
- Màu (đúng giá trị): `--color-hp-hoat-dong-ngay: #3F7D4E`, `--color-hp-hoat-dong-tuan: #A8741A`, `--color-hp-hoat-dong-lau: #8F877F`; mỗi màu ≥ 3:1 trên `card` và `foundation` của `@theme`. Không dùng hồng.
- Chữ (đúng từng chữ), nhóm `nguoi_dung`: `hoat_dong_trong_ngay` = "Hoạt động trong 24h" / "Active in the last 24h"; `hoat_dong_trong_tuan` = "Hoạt động trong 7 ngày" / "Active in the last 7 days"; `hoat_dong_lau` = "Lâu không đăng nhập" / "Not signed in for a while"; `chu_giai_hoat_dong` = "Chú giải màu hoạt động" / "Activity colour key".
- DOM: chấm `span[data-muc-hoat-dong]` (aria-hidden, `title` = nhãn) + `span.sr-only` (nhãn) + `span[data-email]` (email) + thẻ "(bạn)" trong ô đầu mỗi hàng; dòng chú giải `ul[aria-label=chu_giai_hoat_dong]` ba `li` theo thứ tự `MUC_HOAT_DONG`, đặt ngay trên bảng tài khoản.
- Mọi chữ trên giao diện nằm trong `src/messages/vi.ts` + `en.ts` (kiểu `BoChu` ép đủ khoá); chữ Hướng dẫn trong `src/messages/huong-dan.vi.ts` + `.en.ts`. Chú thích trong code viết KHÔNG DẤU (lối cả repo); chữ hiện trên giao diện có dấu.
- Scratchpad: `$S = "C:\Users\pit010\AppData\Local\Temp\claude\C--Users-pit010-QUICKBOOK-WEBAPP--claude-worktrees-strange-dirac-fe8335\89331c5e-4e2b-46fc-9bff-e8a5a7b42926\scratchpad"`.
- Commit message tiếng Việt, ghi ra tệp UTF-8 `$S\commit-msg.txt` bằng Write rồi `git commit -F "$S\commit-msg.txt"`, dòng cuối: `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Chạy test: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run <đường dẫn>` (bỏ đường dẫn = cả bộ; KHÔNG cắt bớt output, đọc dòng `Tests` và `Test Files`). Type-check: `npx tsc --noEmit`. Lint: `npx eslint` (cảnh báo cũ ở `products.service.ts`, `tests/lib/env.test.ts` là có sẵn; phải 0 errors).
- `scripts/*.mts` nằm trong phạm vi tsc: import `../src/...` KHÔNG ghi đuôi `.ts`. Script tạm tên `scripts/tmp-*.mts`, không bao giờ commit; khi chạy tsc/eslint/vitest tổng thì tạm dời chúng ra `$S\tam\`.
- Máy chủ cục bộ: cổng 3100, khởi động detached bằng PowerShell `Start-Process cmd -ArgumentList '/c', "npx next start -p 3100 > `"$S\server-3100.log`" 2>&1" -WorkingDirectory C:\Users\pit010\catalogue-quote-system -WindowStyle Hidden`, đợi `curl.exe -s -o NUL -w "%{http_code}" http://localhost:3100/login` ra `200` (trong PowerShell 5.1 `curl` là bí danh của Invoke-WebRequest — phải ghi `curl.exe`); dừng bằng `Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | % { Stop-Process -Id $_.OwningProcess -Force }`. PHẢI dừng trước `npm run build` (EPERM).
- Script Playwright: mọi tài khoản tạm XOÁ trong `finally`; có hẹn giờ `setTimeout(() => trinhDuyet?.close(), N).unref()`; callback truyền vào `evaluate()`/`evaluateAll()` phải là hàm KHÔNG TÊN và chỉ nhận dữ liệu trần (bẫy `__name`).
- Ảnh hướng dẫn trong `public/` là CÔNG KHAI: chỉ email/họ tên minh hoạ. Ảnh chụp E2E (có email thật) chỉ nằm trong `$S`, không commit, không đăng.
- Mỗi lần sửa một tệp chỉ một thao tác Edit/lượt; sửa lần lượt.

---

## Cấu trúc tệp

| Tệp | Việc |
|---|---|
| `src/modules/nguoi-dung/nguoi-dung.model.ts` | `PHUT_GIUA_HAI_LAN_GHI`, `MucHoatDong`, `MUC_HOAT_DONG`, `nenGhiHoatDong`, `gopLanCuoiVao`, `mucHoatDong`, `ghiHoatDongNeuCan` |
| `tests/modules/nguoi-dung/nguoi-dung.model.test.ts` | test bốn hàm trên |
| `src/db/schema.ts` | cột `lastSeenAt` |
| `src/db/migrations/0008_users_last_seen_at.sql` (+ `meta/0008_snapshot.json`, `meta/_journal.json`) | migration do drizzle-kit sinh |
| `src/auth/guard.ts` | đọc `last_seen_at`, ghi khi cần |
| `src/modules/nguoi-dung/nguoi-dung.service.ts` | `NguoiDungHang.lanCuoiVao`, `NguoiDungHang.mucHoatDong` |
| `src/app/globals.css` | ba biến màu |
| `tests/app/hoat-dong-tuong-phan.test.ts` (mới) | tương phản ba màu, đối chiếu biến CSS với `MUC_HOAT_DONG` |
| `src/messages/vi.ts`, `src/messages/en.ts` | bốn khoá chữ |
| `src/app/admin/nguoi-dung/bang-tai-khoan.tsx` | chấm, chữ ẩn, `data-email`, dòng chú giải |
| `src/messages/huong-dan.vi.ts`, `huong-dan.en.ts` | mẹo thứ ba của bước Tài khoản |
| `scripts/chup-huong-dan.mts` | che email qua `[data-email]` |
| `public/huong-dan/21-tai-khoan.png`, `en/21-tai-khoan.png`, `diem.json` ×2 | chụp lại |

---

### Task 1: Quy tắc hoạt động — hàm thuần

**Files:**
- Modify: `src/modules/nguoi-dung/nguoi-dung.model.ts` (thêm cuối tệp, sau `suyRaCachDangNhap`)
- Modify: `tests/modules/nguoi-dung/nguoi-dung.model.test.ts:1-8` (import) và thêm cuối tệp

**Interfaces:**
- Produces:
  ```ts
  export const PHUT_GIUA_HAI_LAN_GHI = 10;
  export type MucHoatDong = "trong-ngay" | "trong-tuan" | "lau";
  export const MUC_HOAT_DONG: readonly MucHoatDong[];
  export function nenGhiHoatDong(lanCuoi: Date | null, bayGio: Date): boolean;
  export function gopLanCuoiVao(hoatDong: Date | null, dangNhap: Date | null): Date | null;
  export function mucHoatDong(lanCuoi: Date | null, bayGio: Date): MucHoatDong;
  export async function ghiHoatDongNeuCan(
    hoSo: { id: string; isActive: boolean; lanCuoiHoatDong: Date | null },
    bayGio: Date,
    ghi: (id: string) => Promise<unknown>,
  ): Promise<void>;
  ```

- [ ] **Step 1: Sửa import của tệp test**

Thay:

```ts
import { describe, expect, it } from "vitest";
import {
  DAI_MAT_KHAU_TOI_THIEU,
  kiemTraMatKhau,
  kiemTraSuaDoi,
  kiemTraTaoTaiKhoan,
  suyRaCachDangNhap,
} from "@/modules/nguoi-dung/nguoi-dung.model";
```

bằng:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DAI_MAT_KHAU_TOI_THIEU,
  MUC_HOAT_DONG,
  PHUT_GIUA_HAI_LAN_GHI,
  ghiHoatDongNeuCan,
  gopLanCuoiVao,
  kiemTraMatKhau,
  kiemTraSuaDoi,
  kiemTraTaoTaiKhoan,
  mucHoatDong,
  nenGhiHoatDong,
  suyRaCachDangNhap,
} from "@/modules/nguoi-dung/nguoi-dung.model";
```

- [ ] **Step 2: Thêm test vào CUỐI tệp test**

```ts
// ─────────────────────────────────────────────── cham hoat dong (trang Tai khoan)

const BAY_GIO = new Date("2026-09-15T10:00:00Z");
const PHUT = 60_000;
const GIO = 60 * PHUT;
const NGAY = 24 * GIO;
/** Moc cach BAY_GIO mot khoang (ms). So am la moc o tuong lai. */
const truoc = (ms: number) => new Date(BAY_GIO.getTime() - ms);

describe("nenGhiHoatDong", () => {
  it("chua co moc thi ghi", () => {
    expect(nenGhiHoatDong(null, BAY_GIO)).toBe(true);
  });

  it("chua du 10 phut thi khong ghi", () => {
    expect(nenGhiHoatDong(truoc(10 * PHUT - 1000), BAY_GIO)).toBe(false);
  });

  it("du 10 phut thi ghi", () => {
    expect(PHUT_GIUA_HAI_LAN_GHI).toBe(10);
    expect(nenGhiHoatDong(truoc(10 * PHUT), BAY_GIO)).toBe(true);
  });

  it("moc o tuong lai (lech dong ho) thi khong ghi", () => {
    expect(nenGhiHoatDong(truoc(-5 * PHUT), BAY_GIO)).toBe(false);
  });
});

describe("gopLanCuoiVao", () => {
  const som = truoc(3 * NGAY);
  const muon = truoc(2 * GIO);

  it("lay moc muon hon, du ben nao muon", () => {
    expect(gopLanCuoiVao(muon, som)).toEqual(muon);
    expect(gopLanCuoiVao(som, muon)).toEqual(muon);
  });

  it("mot ben trong thi lay ben kia", () => {
    expect(gopLanCuoiVao(null, som)).toEqual(som);
    expect(gopLanCuoiVao(som, null)).toEqual(som);
  });

  it("ca hai trong thi null", () => {
    expect(gopLanCuoiVao(null, null)).toBeNull();
  });
});

describe("mucHoatDong", () => {
  it("chua vao lan nao thi lau", () => {
    expect(mucHoatDong(null, BAY_GIO)).toBe("lau");
  });

  it("duoi 24 gio la trong-ngay", () => {
    expect(mucHoatDong(truoc(PHUT), BAY_GIO)).toBe("trong-ngay");
    expect(mucHoatDong(truoc(23 * GIO + 59 * PHUT), BAY_GIO)).toBe("trong-ngay");
  });

  it("dung 24 gio da sang trong-tuan", () => {
    expect(mucHoatDong(truoc(NGAY), BAY_GIO)).toBe("trong-tuan");
    expect(mucHoatDong(truoc(6 * NGAY + 23 * GIO), BAY_GIO)).toBe("trong-tuan");
  });

  it("dung 7 ngay tro len la lau", () => {
    expect(mucHoatDong(truoc(7 * NGAY), BAY_GIO)).toBe("lau");
    expect(mucHoatDong(truoc(30 * NGAY), BAY_GIO)).toBe("lau");
  });

  it("moc o tuong lai tinh la trong-ngay", () => {
    expect(mucHoatDong(truoc(-2 * PHUT), BAY_GIO)).toBe("trong-ngay");
  });

  it("MUC_HOAT_DONG theo thu tu chu giai: xanh, vang, xam", () => {
    expect(MUC_HOAT_DONG).toEqual(["trong-ngay", "trong-tuan", "lau"]);
  });
});

describe("ghiHoatDongNeuCan", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const hoSo = { id: "u1", isActive: true, lanCuoiHoatDong: null as Date | null };

  it("ghi khi tai khoan dang mo va moc da cu", async () => {
    const ghi = vi.fn().mockResolvedValue(undefined);
    await ghiHoatDongNeuCan({ ...hoSo, lanCuoiHoatDong: truoc(11 * PHUT) }, BAY_GIO, ghi);
    expect(ghi).toHaveBeenCalledTimes(1);
    expect(ghi).toHaveBeenCalledWith("u1");
  });

  it("khong ghi khi moc con moi", async () => {
    const ghi = vi.fn().mockResolvedValue(undefined);
    await ghiHoatDongNeuCan({ ...hoSo, lanCuoiHoatDong: truoc(PHUT) }, BAY_GIO, ghi);
    expect(ghi).not.toHaveBeenCalled();
  });

  it("khong ghi cho tai khoan bi khoa", async () => {
    const ghi = vi.fn().mockResolvedValue(undefined);
    await ghiHoatDongNeuCan({ ...hoSo, isActive: false }, BAY_GIO, ghi);
    expect(ghi).not.toHaveBeenCalled();
  });

  it("ghi loi thi chi log, khong nem ra ngoai", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const ghi = vi.fn().mockRejectedValue(new Error("pooler het cho"));
    await expect(ghiHoatDongNeuCan(hoSo, BAY_GIO, ghi)).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận hỏng**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/modules/nguoi-dung/nguoi-dung.model.test.ts`
Expected: FAIL — các test mới báo `nenGhiHoatDong is not a function` (và tương tự), test cũ vẫn đạt.

- [ ] **Step 4: Thêm cài đặt vào CUỐI `src/modules/nguoi-dung/nguoi-dung.model.ts`**

```ts
// ─────────────────────────────────────────────────────── cham hoat dong

/**
 * Khoang cach toi thieu giua hai lan ghi users.last_seen_at cho cung mot nguoi.
 *
 * Moi yeu cau co dang nhap deu di qua getSessionUser; ghi o MOI yeu cau la them
 * mot cau UPDATE tren ket noi duy nhat (db/client.ts giu max: 1). Cham chi phan
 * biet 24 gio / 7 ngay nen sai so 10 phut khong doi mau cua ai.
 */
export const PHUT_GIUA_HAI_LAN_GHI = 10;

const MOT_PHUT = 60_000;
const MOT_NGAY = 24 * 60 * MOT_PHUT;

/** Muc hoat dong hien bang cham mau o trang Tai khoan. */
export type MucHoatDong = "trong-ngay" | "trong-tuan" | "lau";

/** Thu tu cua dong chu giai: xanh, vang, xam. */
export const MUC_HOAT_DONG: readonly MucHoatDong[] = ["trong-ngay", "trong-tuan", "lau"];

/**
 * Da den luc ghi lai lan cuoi hoat dong chua.
 *
 * Moc nam o TUONG LAI (dong ho may chu ung dung va co so du lieu lech nhau) thi
 * coi nhu con moi — lan mo trang sau se ghi.
 */
export function nenGhiHoatDong(lanCuoi: Date | null, bayGio: Date): boolean {
  if (lanCuoi === null) return true;
  return bayGio.getTime() - lanCuoi.getTime() >= PHUT_GIUA_HAI_LAN_GHI * MOT_PHUT;
}

/**
 * Moc "lan cuoi vao" cua mot tai khoan: muon hon giua lan cuoi dung he thong
 * (users.last_seen_at) va lan cuoi dang nhap (Supabase Auth).
 *
 * Dang nhap cung la hoat dong. Quan trong nhat la ngay sau khi them cot: moi
 * last_seen_at con trong, khong gop thi ai cung hien cham xam cho toi lan mo trang
 * ke tiep.
 */
export function gopLanCuoiVao(hoatDong: Date | null, dangNhap: Date | null): Date | null {
  if (hoatDong === null) return dangNhap;
  if (dangNhap === null) return hoatDong;
  return hoatDong.getTime() >= dangNhap.getTime() ? hoatDong : dangNhap;
}

/**
 * Xep muc: duoi 24 gio, duoi 7 ngay, con lai. Moc o tuong lai tinh la trong ngay.
 * Chua vao lan nao cung la "lau" — cot Lan cuoi vao ghi ro "Chua vao lan nao".
 */
export function mucHoatDong(lanCuoi: Date | null, bayGio: Date): MucHoatDong {
  if (lanCuoi === null) return "lau";
  const hieu = bayGio.getTime() - lanCuoi.getTime();
  if (hieu < MOT_NGAY) return "trong-ngay";
  if (hieu < 7 * MOT_NGAY) return "trong-tuan";
  return "lau";
}

/**
 * Ghi lan cuoi hoat dong khi can — cau noi giua cua gac va cau UPDATE.
 *
 * `ghi` la ham chay UPDATE that (o auth/guard.ts); truyen vao de quy tac o day
 * kiem duoc ma khong can co so du lieu. Tai khoan bi khoa khong ghi: ho bi cua gac
 * chan, khong phai dang dung.
 *
 * Loi ghi CHI LOG. Ghi hoat dong la viec phu — khong duoc vi no ma mot nguoi dang
 * lam viec bi day ra ngoai.
 */
export async function ghiHoatDongNeuCan(
  hoSo: { id: string; isActive: boolean; lanCuoiHoatDong: Date | null },
  bayGio: Date,
  ghi: (id: string) => Promise<unknown>,
): Promise<void> {
  if (!hoSo.isActive || !nenGhiHoatDong(hoSo.lanCuoiHoatDong, bayGio)) return;
  try {
    await ghi(hoSo.id);
  } catch (loi) {
    console.error("[hoat-dong] khong ghi duoc lan cuoi hoat dong:", loi);
  }
}
```

- [ ] **Step 5: Chạy test, xác nhận đạt**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/modules/nguoi-dung/nguoi-dung.model.test.ts`
Expected: PASS, 0 failed (17 test mới + test cũ).

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: không lỗi.

- [ ] **Step 7: Commit**

```bash
git add src/modules/nguoi-dung/nguoi-dung.model.ts tests/modules/nguoi-dung/nguoi-dung.model.test.ts
git diff --cached --name-status
git commit -F "$S\commit-msg.txt"
```

Message:

```
feat(tài khoản): quy tắc chấm hoạt động — ngưỡng ghi, gộp mốc, xếp mức

- Ghi lần cuối hoạt động khi mốc trống hoặc cũ từ 10 phút; tài khoản bị khoá không
  ghi; ghi lỗi chỉ log.
- Mốc hiển thị là mốc muộn hơn giữa hoạt động và đăng nhập.
- Ba mức: dưới 24 giờ, dưới 7 ngày, còn lại.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 2: Cột `last_seen_at`, ghi trong cửa gác, danh sách tài khoản

**Files:**
- Modify: `src/db/schema.ts:61-63`
- Create (drizzle-kit sinh): `src/db/migrations/0008_users_last_seen_at.sql`, `src/db/migrations/meta/0008_snapshot.json`
- Modify (drizzle-kit sinh): `src/db/migrations/meta/_journal.json`
- Modify: `src/auth/guard.ts:1-7`, `src/auth/guard.ts:57-79`
- Modify: `src/modules/nguoi-dung/nguoi-dung.service.ts:7`, `:26-37`, `:42-50`, `:74-86`
- Modify: `src/app/admin/nguoi-dung/bang-tai-khoan.tsx:230`

**Interfaces:**
- Consumes (Task 1): `PHUT_GIUA_HAI_LAN_GHI`, `ghiHoatDongNeuCan`, `gopLanCuoiVao`, `mucHoatDong`, `type MucHoatDong`.
- Produces: cột Drizzle `users.lastSeenAt` (`Date | null`); `NguoiDungHang` KHÔNG còn `lanCuoiDangNhap`, có `lanCuoiVao: Date | null` và `mucHoatDong: MucHoatDong`; `getSessionUser(): Promise<NguoiDung | null>` giữ nguyên chữ ký và kiểu `NguoiDung`.

Không chạy migration ở task này (xem Global Constraints).

- [ ] **Step 1: Thêm cột vào schema**

Trong `src/db/schema.ts`, thay:

```ts
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("users_email_idx").on(t.email)]);
```

bằng:

```ts
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  /**
   * Lan cuoi nguoi nay DUNG he thong — cho cham mau o trang Tai khoan.
   *
   * Khac lan cuoi dang nhap cua Supabase Auth: phien duoc proxy.ts gia han tren moi
   * yeu cau, nen nguoi dung hang ngay co the giu mot phien nhieu tuan ma khong dang
   * nhap lai. Ghi trong getSessionUser (auth/guard.ts) toi da 10 phut mot lan.
   * NULL: chua mo trang nao tu khi co cot nay.
   */
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
}, (t) => [uniqueIndex("users_email_idx").on(t.email)]);
```

- [ ] **Step 2: Sinh migration**

Run: `npm run db:generate -- --name users_last_seen_at`
Expected: báo đã tạo `src/db/migrations/0008_users_last_seen_at.sql`; `meta/0008_snapshot.json` mới; `meta/_journal.json` thêm mục `idx: 8`, `tag: "0008_users_last_seen_at"`.

Đọc tệp SQL vừa sinh. Nội dung PHẢI chỉ là một câu `ALTER TABLE "users" ADD COLUMN "last_seen_at" timestamp with time zone;`. Có bất kỳ câu nào khác → dừng, KHÔNG sửa tay snapshot, báo BLOCKED kèm nguyên văn SQL (schema đang lệch so với snapshot cũ).

- [ ] **Step 3: Ghi lại tệp SQL kèm chú thích (Write, thay toàn bộ)**

`src/db/migrations/0008_users_last_seen_at.sql`:

```sql
-- Lan cuoi nguoi nay DUNG he thong, cho cham mau o trang Tai khoan.
--
-- Ghi trong getSessionUser (auth/guard.ts) toi da 10 phut mot lan, khong phai moi
-- yeu cau. Cho phep NULL: nguoi chua mo trang nao tu khi co cot. Code cu khong doc
-- cot nay, nen chay migration TRUOC khi day code moi len la an toan — lam nguoc lai
-- thi moi trang co dang nhap loi 500.

ALTER TABLE "users" ADD COLUMN "last_seen_at" timestamp with time zone;
```

- [ ] **Step 4: `src/auth/guard.ts` — import**

Thay:

```ts
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, vaiTro } from "@/db/schema";
import type { MucQuyen } from "@/modules/nguoi-dung/nguoi-dung.model";
import { taoSupabaseServer } from "./supabase-server";
```

bằng:

```ts
import { cache } from "react";
import { redirect } from "next/navigation";
import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { users, vaiTro } from "@/db/schema";
import {
  PHUT_GIUA_HAI_LAN_GHI,
  ghiHoatDongNeuCan,
  type MucQuyen,
} from "@/modules/nguoi-dung/nguoi-dung.model";
import { taoSupabaseServer } from "./supabase-server";
```

- [ ] **Step 5: `src/auth/guard.ts` — đọc và ghi trong `getSessionUser`**

Thay (giữ nguyên khối chú thích phía trên hàm):

```ts
export const getSessionUser = cache(async (): Promise<NguoiDung | null> => {
  const supabase = await taoSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  // Noi bang vai_tro ngay tai day: muc quyen phai di cung ho so trong CUNG
  // mot luot doc, khong phai mot truy van thu hai co the that bai rieng va de
  // lai mot nguoi dung khong ai biet duoc phep lam gi.
  const [ho_so] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      mucQuyen: vaiTro.mucQuyen,
      isActive: users.isActive,
    })
    .from(users)
    .innerJoin(vaiTro, eq(vaiTro.ma, users.role))
    .where(eq(users.id, data.user.id))
    .limit(1);
  if (!ho_so) return null;
  return ho_so;
});
```

bằng:

```ts
export const getSessionUser = cache(async (): Promise<NguoiDung | null> => {
  const supabase = await taoSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  // Noi bang vai_tro ngay tai day: muc quyen phai di cung ho so trong CUNG
  // mot luot doc, khong phai mot truy van thu hai co the that bai rieng va de
  // lai mot nguoi dung khong ai biet duoc phep lam gi.
  const [ho_so] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      mucQuyen: vaiTro.mucQuyen,
      isActive: users.isActive,
      // Doc kem trong CUNG cau nay de biet co can ghi khong — khong ton them mot
      // luot truy van cho moi yeu cau.
      lanCuoiHoatDong: users.lastSeenAt,
    })
    .from(users)
    .innerJoin(vaiTro, eq(vaiTro.ma, users.role))
    .where(eq(users.id, data.user.id))
    .limit(1);
  if (!ho_so) return null;
  const { lanCuoiHoatDong, ...nguoiDung } = ho_so;
  /*
   * Ghi lan cuoi hoat dong cho cham mau o trang Tai khoan — toi da 10 phut mot lan.
   *
   * AWAIT tuan tu NGAY SAU cau doc, truoc khi tra ve: khung trang va trang cung doi
   * promise nay (cache), nen cau UPDATE khong chay song song voi truy van nao khac
   * cua yeu cau tren ket noi duy nhat.
   *
   * KHONG dua sang after(): no chay sau khi phan hoi da gui va dua vao waitUntil giu
   * ban ham song — dung loai ban ham bi dong bang giua cuoc noi chuyen voi Postgres
   * da de lai phien ket ClientRead ngay 10/09/2026. KHONG ghi o proxy.ts: tuyen do
   * chi gia han phien, khong cham co so du lieu.
   */
  await ghiHoatDongNeuCan({ ...nguoiDung, lanCuoiHoatDong }, new Date(), ghiLanCuoiHoatDong);
  return nguoiDung;
});

/**
 * Cau UPDATE that. Dieu kien 10 phut lap lai trong WHERE va tinh bang now() cua co
 * so du lieu: hai ban ham cung thay moc cu thi chi mot cau thuc su ghi.
 */
async function ghiLanCuoiHoatDong(id: string): Promise<void> {
  await db
    .update(users)
    .set({ lastSeenAt: sql`now()` })
    .where(
      and(
        eq(users.id, id),
        or(
          isNull(users.lastSeenAt),
          lt(users.lastSeenAt, sql`now() - make_interval(mins => ${PHUT_GIUA_HAI_LAN_GHI}::int)`),
        ),
      ),
    );
}
```

- [ ] **Step 6: `src/modules/nguoi-dung/nguoi-dung.service.ts` — import**

Thay:

```ts
import { suyRaCachDangNhap, type CachDangNhap } from "./nguoi-dung.model";
```

bằng:

```ts
import {
  gopLanCuoiVao,
  mucHoatDong,
  suyRaCachDangNhap,
  type CachDangNhap,
  type MucHoatDong,
} from "./nguoi-dung.model";
```

- [ ] **Step 7: `nguoi-dung.service.ts` — kiểu `NguoiDungHang`**

Thay:

```ts
  /** Suy ra tu Supabase Auth; null khi khong doc duoc phia Auth. */
  cachDangNhap: CachDangNhap | null;
  lanCuoiDangNhap: Date | null;
};
```

bằng:

```ts
  /** Suy ra tu Supabase Auth; null khi khong doc duoc phia Auth. */
  cachDangNhap: CachDangNhap | null;
  /**
   * Moc muon hon giua lan cuoi dung he thong (users.last_seen_at) va lan cuoi dang
   * nhap (Supabase Auth). null khi chua co ca hai.
   */
  lanCuoiVao: Date | null;
  /** Tinh san o may chu — bang tai khoan la client component, chi hien thi. */
  mucHoatDong: MucHoatDong;
};
```

- [ ] **Step 8: `nguoi-dung.service.ts` — chú thích của `danhSachNguoiDung`**

Thay:

```ts
 * Ghep hai nguon: bang `users` (vai tro, trang thai — do minh quan ly) va
 * Supabase Auth (cach dang nhap, lan cuoi vao — do Supabase quan ly). Bang
 * `users` la nguon THAT cua danh sach; Auth chi bo sung. Neu goi Auth hong thi
 * van hien du danh sach, chi thieu hai cot phu — mot man hinh quan tri khong
 * duoc trang chi vi mot loi phu.
```

bằng:

```ts
 * Ghep hai nguon: bang `users` (vai tro, trang thai, lan cuoi hoat dong — do minh
 * quan ly) va Supabase Auth (cach dang nhap, lan cuoi dang nhap — do Supabase quan
 * ly). Bang `users` la nguon THAT cua danh sach; Auth chi bo sung. Neu goi Auth
 * hong thi van hien du danh sach: cot cach dang nhap de trong, lan cuoi vao va cham
 * mau chi con dua vao lan cuoi hoat dong — mot man hinh quan tri khong duoc trang
 * chi vi mot loi phu.
```

- [ ] **Step 9: `nguoi-dung.service.ts` — ghép dòng**

Thay:

```ts
  return hoSo.map((h) => {
    const a = theoId.get(h.id);
    return {
      id: h.id,
      email: h.email,
      hoTen: h.fullName,
      vaiTro: h.role,
      dangHoatDong: h.isActive,
      taoLuc: h.createdAt,
      cachDangNhap: a ? suyRaCachDangNhap(a.providers) : null,
      lanCuoiDangNhap: a?.lanCuoi ? new Date(a.lanCuoi) : null,
    };
  });
```

bằng:

```ts
  // MOT moc bayGio cho ca danh sach, tinh o may chu: bang la client component, tinh
  // lai o trinh duyet thi luc dung o may chu va luc nap lai co the lech nhau mot muc.
  const bayGio = new Date();
  return hoSo.map((h) => {
    const a = theoId.get(h.id);
    const lanCuoiVao = gopLanCuoiVao(h.lastSeenAt, a?.lanCuoi ? new Date(a.lanCuoi) : null);
    return {
      id: h.id,
      email: h.email,
      hoTen: h.fullName,
      vaiTro: h.role,
      dangHoatDong: h.isActive,
      taoLuc: h.createdAt,
      cachDangNhap: a ? suyRaCachDangNhap(a.providers) : null,
      lanCuoiVao,
      mucHoatDong: mucHoatDong(lanCuoiVao, bayGio),
    };
  });
```

- [ ] **Step 10: `bang-tai-khoan.tsx` — cột Lần cuối vào đọc mốc mới**

Thay:

```tsx
                <td className={`${O} whitespace-nowrap tabular-nums`}>{ngay(u.lanCuoiDangNhap, nn, t)}</td>
```

bằng:

```tsx
                <td className={`${O} whitespace-nowrap tabular-nums`}>{ngay(u.lanCuoiVao, nn, t)}</td>
```

- [ ] **Step 11: Kiểm tra**

Run: `npx tsc --noEmit` → không lỗi.
Run: `npx eslint` → 0 errors.
Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run` → `Test Files … passed`, 0 failed (đọc toàn bộ output). Không test nào đọc bảng `users` qua Drizzle nên chạy được trước migration.

- [ ] **Step 12: Commit**

```bash
git add src/db/schema.ts src/db/migrations/0008_users_last_seen_at.sql src/db/migrations/meta/0008_snapshot.json src/db/migrations/meta/_journal.json
git add src/auth/guard.ts src/modules/nguoi-dung/nguoi-dung.service.ts src/app/admin/nguoi-dung/bang-tai-khoan.tsx
git diff --cached --name-status
git commit -F "$S\commit-msg.txt"
```

Expected `--name-status`: đúng 7 tệp (2 `A`, 5 `M`).

Message:

```
feat(tài khoản): ghi lần cuối hoạt động trong cửa gác

- Cột users.last_seen_at (migration 0008, chỉ thêm cột cho phép trống).
- getSessionUser đọc kèm cột trong câu SELECT sẵn có; mốc cũ từ 10 phút thì chạy một
  câu UPDATE tuần tự ngay sau đó. Không dùng after(), không ghi ở proxy.
- Danh sách tài khoản trả mốc lần cuối vào (muộn hơn giữa hoạt động và đăng nhập) và
  mức hoạt động tính sẵn ở máy chủ.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 3: Chấm màu và dòng chú giải trên bảng tài khoản

**Files:**
- Create: `tests/app/hoat-dong-tuong-phan.test.ts`
- Modify: `src/app/globals.css:11-12` (trong `@theme`)
- Modify: `src/messages/vi.ts:135`, `src/messages/en.ts:138`
- Modify: `src/app/admin/nguoi-dung/bang-tai-khoan.tsx`
- Modify: `src/messages/huong-dan.vi.ts:365`, `src/messages/huong-dan.en.ts:364`
- Modify: `scripts/chup-huong-dan.mts:707-716`

**Interfaces:**
- Consumes: `MUC_HOAT_DONG`, `type MucHoatDong` (Task 1); `NguoiDungHang.mucHoatDong`, `NguoiDungHang.lanCuoiVao` (Task 2); `GOC`, `tuongPhan` từ `tests/app/doc-mau-css.ts` (có sẵn).
- Produces: lớp Tailwind `bg-hp-hoat-dong-ngay|tuan|lau`; khoá chữ `nguoi_dung.hoat_dong_trong_ngay|hoat_dong_trong_tuan|hoat_dong_lau|chu_giai_hoat_dong`; hợp đồng DOM trong Global Constraints (Task 5, 6 dùng).

Không khởi động máy chủ để xem ở task này: cột `last_seen_at` chưa có trên DB (Task 4).

- [ ] **Step 1: Viết test tương phản (hỏng trước)**

`tests/app/hoat-dong-tuong-phan.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { MUC_HOAT_DONG, type MucHoatDong } from "@/modules/nguoi-dung/nguoi-dung.model";
import { GOC, tuongPhan } from "./doc-mau-css";

/**
 * Cham hoat dong o trang Tai khoan la thanh phan do hoa MANG THONG TIN: WCAG 1.4.11
 * doi >= 3:1 voi nen ngay canh — nen hang (card) va nen dong chu giai (foundation).
 *
 * Vang TUOI khong dat muc nay tren nen be, nen muc "trong 7 ngay" la vang ho phach.
 */
const BIEN: Record<MucHoatDong, string> = {
  "trong-ngay": "hoat-dong-ngay",
  "trong-tuan": "hoat-dong-tuan",
  lau: "hoat-dong-lau",
};

describe("tuong phan cua cham hoat dong", () => {
  it("@theme co dung mot bien mau cho moi muc, khong thua khong thieu", () => {
    const coTrongCss = Object.keys(GOC).filter((k) => k.startsWith("hoat-dong-")).sort();
    expect(coTrongCss).toEqual(MUC_HOAT_DONG.map((m) => BIEN[m]).sort());
  });

  for (const muc of MUC_HOAT_DONG) {
    it(`${muc}: >= 3:1 tren nen the va nen trang`, () => {
      const mau = GOC[BIEN[muc]];
      expect(mau, `globals.css thieu --color-hp-${BIEN[muc]}`).toBeDefined();
      for (const nen of ["card", "foundation"] as const) {
        const tl = tuongPhan(mau, GOC[nen]);
        expect(tl, `${muc} tren ${nen} chi ${tl.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
      }
    });
  }
});
```

- [ ] **Step 2: Chạy, xác nhận hỏng**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/app/hoat-dong-tuong-phan.test.ts`
Expected: FAIL 4 test — test đầu so `[]` với ba tên biến, ba test sau báo `globals.css thieu --color-hp-hoat-dong-…`.

- [ ] **Step 3: Thêm ba biến màu vào `@theme`**

Trong `src/app/globals.css`, thay:

```css
  --color-hp-pink:        #E91D79;
  --color-hp-pink-strong: #C4165F;
```

bằng:

```css
  --color-hp-pink:        #E91D79;
  --color-hp-pink-strong: #C4165F;

  /*
   * Cham hoat dong o trang Tai khoan: trong 24h, trong 7 ngay, lau hon. Moi mau
   * >= 3:1 tren nen the va nen trang (tests/app/hoat-dong-tuong-phan.test.ts).
   * Vang tuoi khong dat muc do tren nen be, nen dung vang ho phach.
   */
  --color-hp-hoat-dong-ngay: #3F7D4E;
  --color-hp-hoat-dong-tuan: #A8741A;
  --color-hp-hoat-dong-lau:  #8F877F;
```

- [ ] **Step 4: Chạy lại, xác nhận đạt**

Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run tests/app/hoat-dong-tuong-phan.test.ts tests/app/tone-tuong-phan.test.ts tests/app/mau-nhan-tuong-phan.test.ts`
Expected: PASS, 0 failed.

- [ ] **Step 5: Chữ tiếng Việt**

Trong `src/messages/vi.ts`, thay:

```ts
    la_ban: "(bạn)",
```

bằng:

```ts
    la_ban: "(bạn)",
    hoat_dong_trong_ngay: "Hoạt động trong 24h",
    hoat_dong_trong_tuan: "Hoạt động trong 7 ngày",
    hoat_dong_lau: "Lâu không đăng nhập",
    chu_giai_hoat_dong: "Chú giải màu hoạt động",
```

- [ ] **Step 6: Chữ tiếng Anh**

Trong `src/messages/en.ts`, thay:

```ts
    la_ban: "(you)",
```

bằng:

```ts
    la_ban: "(you)",
    hoat_dong_trong_ngay: "Active in the last 24h",
    hoat_dong_trong_tuan: "Active in the last 7 days",
    hoat_dong_lau: "Not signed in for a while",
    chu_giai_hoat_dong: "Activity colour key",
```

- [ ] **Step 7: `bang-tai-khoan.tsx` — import**

Thay:

```tsx
import {
  tenVaiTro,
  type CachDangNhap,
  type VaiTro,
} from "@/modules/nguoi-dung/nguoi-dung.model";
```

bằng:

```tsx
import {
  MUC_HOAT_DONG,
  tenVaiTro,
  type CachDangNhap,
  type MucHoatDong,
  type VaiTro,
} from "@/modules/nguoi-dung/nguoi-dung.model";
```

- [ ] **Step 8: `bang-tai-khoan.tsx` — hằng lớp của chấm**

Thay:

```tsx
const LOP_ICON = "h-4 w-4 shrink-0";
```

bằng:

```tsx
const LOP_ICON = "h-4 w-4 shrink-0";
/** Cham hoat dong — cung mot hinh o bang va o dong chu giai. */
const CHAM = "inline-block h-2 w-2 shrink-0 rounded-full";
/** Ten lop viet san day du: Tailwind chi sinh lop ma no doc thay nguyen van trong ma nguon. */
const LOP_CHAM: Record<MucHoatDong, string> = {
  "trong-ngay": "bg-hp-hoat-dong-ngay",
  "trong-tuan": "bg-hp-hoat-dong-tuan",
  lau: "bg-hp-hoat-dong-lau",
};
```

- [ ] **Step 9: `bang-tai-khoan.tsx` — nhãn của từng mức**

Thay:

```tsx
function loiThanhChu(t: BoChu): Record<string, string> {
```

bằng:

```tsx
function nhanHoatDong(t: BoChu): Record<MucHoatDong, string> {
  return {
    "trong-ngay": t.nguoi_dung.hoat_dong_trong_ngay,
    "trong-tuan": t.nguoi_dung.hoat_dong_trong_tuan,
    lau: t.nguoi_dung.hoat_dong_lau,
  };
}

function loiThanhChu(t: BoChu): Record<string, string> {
```

- [ ] **Step 10: `bang-tai-khoan.tsx` — dòng chú giải và bảng**

Thay TOÀN BỘ từ dòng `export function BangTaiKhoan({` tới hết tệp bằng:

```tsx
/**
 * Dong chu giai ngay tren bang: xanh, vang, xam theo thu tu MUC_HOAT_DONG.
 * aria-label dat ten cho danh sach de trinh doc man hinh doc ra day la chu giai mau.
 */
function ChuGiaiHoatDong() {
  const t = useChu();
  const nhan = nhanHoatDong(t);
  return (
    <ul
      aria-label={t.nguoi_dung.chu_giai_hoat_dong}
      className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-hp-muted"
    >
      {MUC_HOAT_DONG.map((m) => (
        <li key={m} className="inline-flex items-center gap-2">
          <span aria-hidden className={`${CHAM} ${LOP_CHAM[m]}`} />
          {nhan[m]}
        </li>
      ))}
    </ul>
  );
}

export function BangTaiKhoan({
  ds,
  idCuaToi,
  vaiTros,
}: {
  ds: NguoiDungHang[];
  idCuaToi: string;
  vaiTros: readonly VaiTro[];
}) {
  const t = useChu();
  const nn = useNgonNgu();
  const cach = nhanCach(t);
  const nhanMuc = nhanHoatDong(t);
  /** Ma vai tro -> ten hien. Ma la la thi hien nguyen ma, hon la hien trong khong. */
  const ten = (ma: string) => {
    const v = vaiTros.find((x) => x.ma === ma);
    return v ? tenVaiTro(v, nn === "en") : ma;
  };
  return (
    <>
      <ChuGiaiHoatDong />
      <div className="overflow-x-auto border border-hp-rule">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-hp-inset">
              <th className={O_TIEU_DE}>{t.nguoi_dung.cot_email}</th>
              <th className={O_TIEU_DE}>{t.nguoi_dung.cot_ho_ten}</th>
              <th className={O_TIEU_DE}>{t.nguoi_dung.cot_vai_tro}</th>
              <th className={O_TIEU_DE}>{t.nguoi_dung.cot_cach_vao}</th>
              <th className={O_TIEU_DE}>{t.nguoi_dung.cot_lan_cuoi}</th>
              <th className={O_TIEU_DE}>{t.nguoi_dung.cot_trang_thai}</th>
              <th className={O_TIEU_DE}>{t.nguoi_dung.cot_thao_tac}</th>
            </tr>
          </thead>
          <tbody>
            {ds.map((u) => {
              const laToi = u.id === idCuaToi;
              return (
                <tr key={u.id} className="bg-hp-card">
                  <td className={`${O} whitespace-nowrap text-hp-ink`}>
                    {/* Cham: mau cho mat, title khi re chuot, chu an cho trinh doc man hinh.
                        Ngay o cot Lan cuoi vao la kenh thu hai — thong tin khong chi nam o mau. */}
                    <span
                      aria-hidden
                      title={nhanMuc[u.mucHoatDong]}
                      data-muc-hoat-dong={u.mucHoatDong}
                      className={`${CHAM} ${LOP_CHAM[u.mucHoatDong]} mr-2 align-middle`}
                    />
                    <span className="sr-only">{nhanMuc[u.mucHoatDong]}</span>
                    <span data-email>{u.email}</span>
                    {laToi && <span className="ml-2 text-xs text-hp-muted">{t.nguoi_dung.la_ban}</span>}
                  </td>
                  <td className={O}>{u.hoTen}</td>
                  <td className={`${O} whitespace-nowrap`}>{ten(u.vaiTro)}</td>
                  <td className={`${O} whitespace-nowrap`}>
                    {u.cachDangNhap ? cach[u.cachDangNhap] : t.nguoi_dung.vao_khac}
                  </td>
                  <td className={`${O} whitespace-nowrap tabular-nums`}>{ngay(u.lanCuoiVao, nn, t)}</td>
                  <td className={`${O} whitespace-nowrap`}>
                    {u.dangHoatDong ? (
                      t.nguoi_dung.dang_hoat_dong
                    ) : (
                      <span className="text-hp-pink-strong">{t.nguoi_dung.da_khoa}</span>
                    )}
                  </td>
                  <td className={O}>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      <DatMatKhau id={u.id} tenHien={u.email} />
                      <NutHanhDong
                        hanhDong={doiTrangThai}
                        truong={{ id: u.id, bat: u.dangHoatDong ? "0" : "1" }}
                        nhan={u.dangHoatDong ? t.nguoi_dung.khoa : t.nguoi_dung.mo_khoa}
                        Icon={u.dangHoatDong ? Lock : LockOpen}
                        // Tu khoa chinh minh la khong con ai vao duoc man hinh
                        // nay. Server van chan lan nua — day chi la de nut khong
                        // moi nguoi bam vao mot viec chac chan that bai.
                        tat={laToi && u.dangHoatDong}
                      />
                      <DoiVaiTro u={u} vaiTros={vaiTros} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
```

- [ ] **Step 11: Hướng dẫn tiếng Việt — mẹo thứ ba của bước Tài khoản**

Trong `src/messages/huong-dan.vi.ts`, thay:

```ts
      "Cột Cách đăng nhập cho biết người đó vào bằng Google, mật khẩu hay cả hai; cột Lần cuối vào cho biết tài khoản còn dùng không.",
```

bằng:

```ts
      "Chấm màu trước email cho biết lần cuối người đó dùng hệ thống: xanh — trong 24 giờ, vàng — trong 7 ngày, xám — lâu hơn hoặc chưa vào lần nào. Cột Cách đăng nhập cho biết họ vào bằng Google, mật khẩu hay cả hai.",
```

- [ ] **Step 12: Hướng dẫn tiếng Anh**

Trong `src/messages/huong-dan.en.ts`, thay:

```ts
      "The Sign-in method column shows Google, password or both; Last seen shows whether the account is still in use.",
```

bằng:

```ts
      "The dot before each email shows when that person last used the system: green — within 24 hours, amber — within 7 days, grey — longer ago or never. The Sign-in method column shows Google, password or both.",
```

- [ ] **Step 13: Script chụp — che email qua `[data-email]`**

Trong `scripts/chup-huong-dan.mts`, thay:

```ts
    await bangTaiKhoan.evaluate((bang, a) => {
      bang.querySelectorAll("tbody tr").forEach((tr, i) => {
        const o = tr.querySelectorAll("td");
        // O email co the kem the "(ban)"; chi doi doan chu dau, giu the do.
        const nutEmail = o[0]?.firstChild;
        if (nutEmail && nutEmail.nodeType === Node.TEXT_NODE) nutEmail.textContent = a.email[i % a.email.length];
        else if (o[0]) o[0].textContent = a.email[i % a.email.length];
        if (o[1]) o[1].textContent = a.ho[i % a.ho.length];
      });
    }, { email: EMAIL_MINH_HOA, ho: HO_TEN_MINH_HOA });
```

bằng:

```ts
    await bangTaiKhoan.evaluate((bang, a) => {
      bang.querySelectorAll("tbody tr").forEach((tr, i) => {
        const o = tr.querySelectorAll("td");
        // O email: cham hoat dong + chu an + [data-email] + the "(ban)". Chi doi chu trong
        // [data-email]. Khong thay thi DUNG LAI — chup tiep la lo email that len anh cong khai.
        const email = o[0]?.querySelector("[data-email]");
        if (!email) throw new Error("bang tai khoan khong con [data-email] — khong che duoc email");
        email.textContent = a.email[i % a.email.length];
        if (o[1]) o[1].textContent = a.ho[i % a.ho.length];
      });
    }, { email: EMAIL_MINH_HOA, ho: HO_TEN_MINH_HOA });
```

- [ ] **Step 14: Kiểm tra**

Dừng máy chủ 3100 nếu đang chạy.
Run: `npx tsc --noEmit` → không lỗi.
Run: `npx eslint` → 0 errors.
Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run` → 0 failed (đọc toàn bộ output).
Run: `npm run build` → thành công.
Run: `Get-ChildItem .next\static -Recurse -Filter *.css | Select-String -Pattern 'bg-hp-hoat-dong-ngay' | Measure-Object | % Count` → ≥ 1 (Tailwind đã sinh lớp màu chấm).

- [ ] **Step 15: Commit**

```bash
git add tests/app/hoat-dong-tuong-phan.test.ts src/app/globals.css src/messages/vi.ts src/messages/en.ts
git add src/app/admin/nguoi-dung/bang-tai-khoan.tsx src/messages/huong-dan.vi.ts src/messages/huong-dan.en.ts scripts/chup-huong-dan.mts
git diff --cached --name-status
git commit -F "$S\commit-msg.txt"
```

Expected `--name-status`: đúng 8 tệp (1 `A`, 7 `M`).

Message:

```
feat(tài khoản): chấm màu hoạt động và dòng chú giải trên bảng tài khoản

- Chấm trước email: xanh trong 24h, vàng hổ phách trong 7 ngày, xám lâu hơn hoặc chưa
  vào; có title và chữ ẩn cho trình đọc màn hình. Dòng chú giải ngay trên bảng.
- Ba màu mới trong @theme, test chốt ≥ 3:1 trên nền thẻ và nền trang.
- Hướng dẫn bước Tài khoản: mẹo giải thích ba màu. Script chụp che email qua
  [data-email], không thấy thì dừng thay vì lộ email thật.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 4: Chạy migration trên cơ sở dữ liệu thật — CONTROLLER, CHỜ ANH CHO PHÉP

**Files:**
- Temp (không commit): `scripts/tmp-kiem-cot.mts`

- [ ] **Step 1: Hỏi anh**

Trình bày cho anh: câu SQL của `0008_users_last_seen_at.sql`, lý do chạy trước push, và rằng bản đang chạy không bị ảnh hưởng. Chỉ làm tiếp khi anh đồng ý rõ ràng.

- [ ] **Step 2: Chạy migration**

Run: `npm run db:migrate`
Expected: dòng cuối báo migrations applied successfully, không có lỗi.

- [ ] **Step 3: Kiểm cột bằng script tạm**

`scripts/tmp-kiem-cot.mts`:

```ts
/** TAM — khong commit. Kiem cot users.last_seen_at sau migration 0008. */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
try {
  const cot = await sql`
    select data_type, is_nullable from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'last_seen_at'`;
  const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from drizzle.__drizzle_migrations`;
  console.log(JSON.stringify({ cot, soMigration: n }));
} finally {
  await sql.end({ timeout: 5 });
}
```

Run: `npx tsx scripts/tmp-kiem-cot.mts`
Expected: `{"cot":[{"data_type":"timestamp with time zone","is_nullable":"YES"}],"soMigration":9}`.
Run: `curl.exe -s -o NUL -w "%{http_code}" https://hpcatalogue.app/login` → `200` (bản đang chạy vẫn sống).
Xoá `scripts/tmp-kiem-cot.mts`.

---

### Task 5: Chụp lại ảnh hướng dẫn bước Tài khoản và soát bằng mắt

Điều kiện: Task 4 xong (cột đã có).

**Files:**
- Modify (script sinh): `public/huong-dan/21-tai-khoan.png`, `public/huong-dan/en/21-tai-khoan.png`, `public/huong-dan/diem.json`, `public/huong-dan/en/diem.json`
- Temp (không commit, giữ tới Task 7): `scripts/tmp-xem-huong-dan.mts`

- [ ] **Step 1: Build và khởi động máy chủ**

Dừng máy chủ 3100 nếu đang chạy. Run: `npm run build` → thành công. Khởi động máy chủ 3100 detached (Global Constraints), đợi `/login` trả `200`.

- [ ] **Step 2: Chụp hai bộ ảnh**

Run (nền, timeout 12 phút): `npm run huong-dan:anh`
Expected: 22 dòng `[vi] …png` + `[vi] diem.json`, 22 dòng `[en] …png` + `[en] diem.json`; không có dòng `khong xoa duoc tai khoan tam`; không có lỗi `khong che duoc email`.

- [ ] **Step 3: Xem thay đổi**

Run: `git status --short public/huong-dan`
Run: `git diff public/huong-dan/diem.json public/huong-dan/en/diem.json`
Ghi lại: những khoá ảnh nào trong `diem.json` có toạ độ đổi.

- [ ] **Step 4: Khởi động lại máy chủ (trang đọc `diem.json` một lần lúc nạp), tạo script soát tạm**

Dừng rồi khởi động lại máy chủ 3100, đợi `/login` 200. Tạo `scripts/tmp-xem-huong-dan.mts`:

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

Run (PowerShell): `$env:NN="en"; $env:RA="$S\soat-en-hoatdong"; npx tsx scripts/tmp-xem-huong-dan.mts` rồi `$env:NN="vi"; $env:RA="$S\soat-vi-hoatdong"; npx tsx scripts/tmp-xem-huong-dan.mts`
Expected: `[en] hinh: 22, anh tu thu muc en: 22, buoc: 22, cau hoi: 12, tieu de: How to use it` và `[vi] hinh: 22, anh tu thu muc en: 0, buoc: 22, cau hoi: 12, tieu de: Hướng dẫn sử dụng`; mỗi lượt `Da xoa tai khoan tam`.

- [ ] **Step 5: Soát bằng mắt**

Mở `public/huong-dan/21-tai-khoan.png`, `public/huong-dan/en/21-tai-khoan.png`, và `hinh-22.png` của CẢ HAI thư mục soát. Tiêu chí:
- Dòng chú giải ba mục (chấm xanh / vàng hổ phách / xám + chữ đúng ngôn ngữ) nằm ngay trên bảng tài khoản, dưới khối Cấp tài khoản mới.
- Mỗi hàng tài khoản có một chấm trước email, căn giữa dòng chữ, cách email một khoảng; hàng có "(bạn)"/"(you)" chấm xanh.
- Chỉ thấy email minh hoạ (`ngoc.anh`, `minh.thu`, `gia.bao`, `thuy.linh`, `quang.huy`, `kim.ngan` @ctyhp.vn) và họ tên minh hoạ; không có email thật.
- Sáu ô số không đè chữ chú giải, không đè nhau, không bị cắt mép.

Lỗi vị trí ô số: đổi `huong` của mốc đó trong bước 21 của `scripts/chup-huong-dan.mts`, chạy lại Step 2, khởi động lại máy chủ, soát lại. Lỗi trình bày chấm/chú giải: sửa `bang-tai-khoan.tsx`, commit riêng `fix(tài khoản): …` (tsc/eslint/vitest/build trước khi commit, dời script tạm ra `$S\tam\`), rồi chạy lại Step 1–5.

- [ ] **Step 6: Dừng máy chủ, giữ đúng những ảnh cần commit**

Với MỖI tệp `.png` bị đổi trong `public/huong-dan/` và `public/huong-dan/en/`:
- Là `21-tai-khoan.png` → giữ.
- Là ảnh khác mà khoá của nó trong `diem.json` cùng thư mục CÓ đổi toạ độ (Step 3) → giữ (ảnh và mũi tên phải đi cùng nhau).
- Còn lại (chỉ đổi byte vì dòng giờ cập nhật, link tạm) → `git restore -- <đường dẫn tệp>`.

- [ ] **Step 7: Commit (KHÔNG stage `scripts/tmp-xem-huong-dan.mts`)**

```bash
git add public/huong-dan/21-tai-khoan.png public/huong-dan/en/21-tai-khoan.png
git add public/huong-dan/diem.json public/huong-dan/en/diem.json
git add <từng .png khác được giữ ở Step 6, nếu có>
git diff --cached --name-status
git commit -F "$S\commit-msg.txt"
```

Nếu `diem.json` không đổi thì bỏ qua dòng add của nó.

Message:

```
docs(hướng dẫn): chụp lại bước Tài khoản có chấm màu hoạt động

- Ảnh 21-tai-khoan (vi/en): dòng chú giải và chấm trước email; email vẫn là email
  minh hoạ.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 6: Kiểm tra tổng và E2E cục bộ

**Files:**
- Temp (không commit, giữ tới Task 7): `scripts/tmp-e2e-hoat-dong.mts`

- [ ] **Step 1: Kiểm tra toàn bộ khi không có script tạm trong `scripts/`**

```powershell
New-Item -ItemType Directory -Force "$S\tam" | Out-Null
Get-ChildItem C:\Users\pit010\catalogue-quote-system\scripts\tmp-*.mts -ErrorAction SilentlyContinue | Move-Item -Destination "$S\tam\" -Force
git -C C:\Users\pit010\catalogue-quote-system status --short
```

Expected `git status --short`: trống.
Dừng máy chủ 3100. Run: `npx tsc --noEmit` → không lỗi. Run: `npx eslint` → 0 errors. Run: `node --env-file=C:/Users/pit010/catalogue-quote-system/.env.local node_modules/vitest/vitest.mjs run` → 0 failed (đọc toàn bộ). Run: `npm run build` → thành công.
Trả script tạm về: `Move-Item "$S\tam\tmp-*.mts" C:\Users\pit010\catalogue-quote-system\scripts\ -Force`.
Khởi động máy chủ 3100, đợi `/login` 200.

- [ ] **Step 2: Tạo `scripts/tmp-e2e-hoat-dong.mts`**

```ts
/**
 * TAM — khong commit. E2E cho cham hoat dong o trang Tai khoan.
 * Chay: GOC=<goc> RA=<thu muc anh> npx tsx scripts/tmp-e2e-hoat-dong.mts
 * Tao 1 admin tam (dang nhap) + 3 tai khoan tam khong dang nhap (3 ngay / 30 ngay / chua
 * vao). Tat ca XOA trong finally; hen gio 5 phut. Anh chup co email that — chi de soat
 * cuc bo, khong commit, khong dang.
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium, type Browser, type Locator, type Page } from "playwright";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import { boChu } from "../src/messages/index";

const GOC = process.env.GOC ?? "http://localhost:3100";
const RA = process.env.RA;
if (!RA) throw new Error("Thieu bien RA");

const t = boChu("vi");
const tEn = boChu("en");
const nd = t.nguoi_dung;
const ndEn = tEn.nguoi_dung;
const thoat = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const co = (s: string) => new RegExp(thoat(s.trim()), "i");
const dung = (s: string) => new RegExp(`^${thoat(s.trim())}$`, "i");

const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DUOI = randomBytes(4).toString("hex");
const EMAIL = `e2e-hoatdong-${DUOI}@ctyhp.vn`;
const MAT_KHAU = randomBytes(18).toString("base64url");
/** Tai khoan KHONG dang nhap, dat san last_seen_at de kiem ba muc. */
const PHU = [
  { khoa: "tuan", email: `e2e-hoatdong-${DUOI}-tuan@ctyhp.vn`, cach: "3 days" },
  { khoa: "lau", email: `e2e-hoatdong-${DUOI}-lau@ctyhp.vn`, cach: "30 days" },
  { khoa: "chua", email: `e2e-hoatdong-${DUOI}-chua@ctyhp.vn`, cach: null },
] as const;

const ids: string[] = [];
let idNguoi: string | null = null;
let trinhDuyet: Browser | null = null;
let dat = 0;
let hong = 0;

function kiem(ten: string, ok: boolean, chiTiet = ""): void {
  if (ok) { dat++; console.log(`  OK   ${ten}`); } else { hong++; console.log(`  HONG ${ten} ${chiTiet}`); }
}

setTimeout(() => {
  console.log("HONG: qua 5 phut, dong trinh duyet de finally don dep");
  void trinhDuyet?.close().catch(() => {});
}, 5 * 60_000).unref();

async function taoAuth(email: string, matKhau: string): Promise<string> {
  const { data, error } = await supa.auth.admin.createUser({ email, password: matKhau, email_confirm: true });
  if (error) throw error;
  ids.push(data.user.id);
  return data.user.id;
}

/** last_seen_at cua admin tam, kem so giay tu moc do toi now() cua co so du lieu. */
async function docMoc(): Promise<{ moc: Date | null; giay: number | null }> {
  const [h] = await sql<{ moc: Date | null; giay: number | null }[]>`
    select last_seen_at as moc, extract(epoch from now() - last_seen_at)::float8 as giay
    from users where id = ${idNguoi}`;
  return h ?? { moc: null, giay: null };
}

/** Doi toi khi dieu kien dung, toi da `ms` — trang co the con dang stream khi URL da doi. */
async function choDen(dk: () => Promise<boolean>, ms = 15_000): Promise<boolean> {
  const het = Date.now() + ms;
  while (Date.now() < het) {
    if (await dk()) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return dk();
}

async function moTaiKhoan(page: Page): Promise<void> {
  await page.goto(`${GOC}/admin/nguoi-dung`, { waitUntil: "networkidle", timeout: 120_000 });
  await dongCua(page, EMAIL).waitFor({ timeout: 60_000 });
}

function dongCua(page: Page, email: string): Locator {
  return page.locator("tbody tr").filter({ has: page.locator("[data-email]", { hasText: dung(email) }) });
}

async function doCham(dong: Locator): Promise<{ muc: string | null; mau: string; chuAn: string; title: string | null }> {
  const cham = dong.locator("[data-muc-hoat-dong]");
  return {
    muc: await cham.getAttribute("data-muc-hoat-dong"),
    mau: await cham.evaluate((el) => getComputedStyle(el).backgroundColor),
    chuAn: ((await dong.locator(".sr-only").first().textContent()) ?? "").trim(),
    title: await cham.getAttribute("title"),
  };
}

try {
  await mkdir(RA, { recursive: true });

  // Chuan bi: admin tam + 3 tai khoan phu co moc dat san
  idNguoi = await taoAuth(EMAIL, MAT_KHAU);
  await sql`insert into users (id, email, full_name, role) values (${idNguoi}, ${EMAIL}, 'E2E hoạt động', 'admin')`;
  for (const p of PHU) {
    const id = await taoAuth(p.email, randomBytes(18).toString("base64url"));
    if (p.cach === null) {
      await sql`insert into users (id, email, full_name, role) values (${id}, ${p.email}, ${"E2E " + p.khoa}, 'sale')`;
    } else {
      await sql`
        insert into users (id, email, full_name, role, last_seen_at)
        values (${id}, ${p.email}, ${"E2E " + p.khoa}, 'sale', now() - ${p.cach}::interval)`;
    }
  }
  kiem("admin tam moi tao: last_seen_at trong", (await docMoc()).moc === null);

  trinhDuyet = await chromium.launch();
  const ngu = await trinhDuyet.newContext({ viewport: { width: 1440, height: 900 } });
  await ngu.addCookies([{ name: "ngon-ngu", value: "vi", url: GOC }]);
  const page = await ngu.newPage();
  page.setDefaultTimeout(45_000);

  // 1. Dang nhap -> cua gac ghi last_seen_at
  await page.goto(`${GOC}/login`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.getByRole("button", { name: co(t.dang_nhap.khong_vao_duoc) }).click();
  await page.fill("#email", EMAIL);
  await page.fill("#mat_khau", MAT_KHAU);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 90_000, waitUntil: "commit" }),
    page.getByRole("button", { name: dung(t.dang_nhap.nut) }).click(),
  ]);
  kiem("dang nhap xong: last_seen_at duoc ghi", await choDen(async () => (await docMoc()).moc !== null));
  const sauDangNhap = await docMoc();
  kiem("last_seen_at la moc vua xong (< 120 giay)",
    sauDangNhap.giay !== null && sauDangNhap.giay < 120, `(giay=${sauDangNhap.giay})`);

  // 2. Trang Tai khoan: chu giai + cham
  await moTaiKhoan(page);
  const cacMuc = (await page.getByRole("list", { name: dung(nd.chu_giai_hoat_dong) }).getByRole("listitem").allInnerTexts())
    .map((s) => s.trim());
  kiem("chu giai: 3 muc dung chu, dung thu tu",
    JSON.stringify(cacMuc) === JSON.stringify([nd.hoat_dong_trong_ngay, nd.hoat_dong_trong_tuan, nd.hoat_dong_lau]),
    JSON.stringify(cacMuc));

  const bangTk = page.locator("table").filter({ has: page.locator("[data-email]") });
  const soDong = await bangTk.locator("tbody tr").count();
  const giaTri = await bangTk.locator("tbody tr [data-muc-hoat-dong]")
    .evaluateAll((ds) => ds.map((d) => d.getAttribute("data-muc-hoat-dong")));
  kiem("moi dong tai khoan co dung mot cham hop le",
    soDong > 0 && giaTri.length === soDong && giaTri.every((g) => g === "trong-ngay" || g === "trong-tuan" || g === "lau"),
    `(dong=${soDong}, cham=${giaTri.length})`);

  const MONG_DOI = [
    { ten: "admin tam (vua dang nhap)", email: EMAIL, muc: "trong-ngay", mau: "rgb(63, 125, 78)", nhan: nd.hoat_dong_trong_ngay },
    { ten: "tai khoan 3 ngay", email: PHU[0].email, muc: "trong-tuan", mau: "rgb(168, 116, 26)", nhan: nd.hoat_dong_trong_tuan },
    { ten: "tai khoan 30 ngay", email: PHU[1].email, muc: "lau", mau: "rgb(143, 135, 127)", nhan: nd.hoat_dong_lau },
    { ten: "tai khoan chua vao", email: PHU[2].email, muc: "lau", mau: "rgb(143, 135, 127)", nhan: nd.hoat_dong_lau },
  ];
  for (const m of MONG_DOI) {
    const c = await doCham(dongCua(page, m.email));
    kiem(`${m.ten}: cham ${m.muc}, mau ${m.mau}, chu an va title dung`,
      c.muc === m.muc && c.mau === m.mau && c.chuAn === m.nhan && c.title === m.nhan, JSON.stringify(c));
  }
  const oLanCuoi = ((await dongCua(page, PHU[2].email).locator("td").nth(4).textContent()) ?? "").trim();
  kiem("tai khoan chua vao: cot Lan cuoi vao ghi Chua vao lan nao", oLanCuoi === nd.chua_vao_lan_nao, `(thay "${oLanCuoi}")`);
  await page.screenshot({ path: join(RA, "tai-khoan-vi.png"), fullPage: true });

  // 3. Nguong 10 phut
  const moc1 = (await docMoc()).moc;
  await moTaiKhoan(page);
  await moTaiKhoan(page);
  const moc2 = (await docMoc()).moc;
  kiem("mo lai trong 10 phut: last_seen_at khong doi",
    moc1 !== null && moc2 !== null && moc1.getTime() === moc2.getTime(), `(${moc1?.toISOString()} -> ${moc2?.toISOString()})`);

  await sql`update users set last_seen_at = now() - interval '11 minutes' where id = ${idNguoi}`;
  await moTaiKhoan(page);
  kiem("moc cu hon 10 phut: mo trang la ghi lai",
    await choDen(async () => { const d = await docMoc(); return d.giay !== null && d.giay < 60; }));

  // 4. Tieng Anh
  await ngu.addCookies([{ name: "ngon-ngu", value: "en", url: GOC }]);
  await moTaiKhoan(page);
  const cacMucEn = (await page.getByRole("list", { name: dung(ndEn.chu_giai_hoat_dong) }).getByRole("listitem").allInnerTexts())
    .map((s) => s.trim());
  kiem("tieng Anh: chu giai 3 muc dung chu",
    JSON.stringify(cacMucEn) === JSON.stringify([ndEn.hoat_dong_trong_ngay, ndEn.hoat_dong_trong_tuan, ndEn.hoat_dong_lau]),
    JSON.stringify(cacMucEn));
  await page.screenshot({ path: join(RA, "tai-khoan-en.png"), fullPage: true });

  // 5. Khong co phien Postgres ket
  const [{ n }] = await sql<{ n: number }[]>`
    select count(*)::int as n from pg_stat_activity
    where state = 'active' and wait_event = 'ClientRead' and now() - state_change > interval '30 seconds'`;
  kiem("khong co phien ket ClientRead qua 30 giay", n === 0, `(n=${n})`);

  console.log(`\nKet qua: ${dat} dat, ${hong} hong`);
  if (hong > 0) process.exitCode = 1;
} catch (e) {
  console.log("HONG: " + String(e).slice(0, 800));
  process.exitCode = 1;
} finally {
  if (trinhDuyet) await trinhDuyet.close().catch(() => {});
  let daXoa = 0;
  for (const id of ids) {
    await sql`delete from users where id = ${id}`.catch(() => {});
    const { error } = await supa.auth.admin.deleteUser(id);
    if (error) console.log(`!! CHUA XOA tai khoan ${id}: ${error.message}`);
    else daXoa++;
  }
  console.log(`Da xoa ${daXoa}/${ids.length} tai khoan tam`);
  await sql.end({ timeout: 5 });
}
```

- [ ] **Step 3: Chạy E2E cục bộ**

Run (PowerShell, nền, timeout 8 phút): `$env:GOC="http://localhost:3100"; $env:RA="$S\e2e-hoat-dong-local"; npx tsx scripts/tmp-e2e-hoat-dong.mts`
Expected: 14 dòng `OK`, `Ket qua: 14 dat, 0 hong`, `Da xoa 4/4 tai khoan tam`, exit 0.
Nếu treo/hỏng: đọc output; xác nhận đã dọn (`select count(*) from users where email like 'e2e-hoatdong-%'` phải 0); sửa rồi chạy lại.

- [ ] **Step 4: Soát ảnh E2E bằng mắt**

Mở `tai-khoan-vi.png`, `tai-khoan-en.png` trong `$S\e2e-hoat-dong-local`. Tiêu chí: dòng chú giải ngay trên bảng, chấm tròn nhỏ căn giữa dòng email, ba màu phân biệt được bằng mắt, chữ chú giải đúng ngôn ngữ, bảng không vỡ hàng. Ảnh có email thật — chỉ xem, không gửi, không đăng.
Lỗi trình bày: sửa `bang-tai-khoan.tsx`, chạy lại Step 1, commit riêng `fix(tài khoản): …`, chạy lại E2E và Task 5.

- [ ] **Step 5: Dừng máy chủ 3100.**

---

### Task 7: Đẩy lên production và kiểm tra trên bản thật — CONTROLLER, HỎI ANH TRƯỚC KHI PUSH

- [ ] **Step 1: Cây sạch == HEAD**

Dời `scripts/tmp-*.mts` ra `$S\tam\`; `git status --short` → trống; `npx tsc --noEmit` → không lỗi; vitest cả bộ → 0 failed (đọc toàn bộ); trả script tạm về `scripts/`.

- [ ] **Step 2: Quét trước khi push**

Run: `git fetch origin; git log --oneline origin/main..HEAD`
Expected: commit spec, commit plan, Task 1, Task 2, Task 3, Task 5 (+ fix nếu có).
Run: `git diff origin/main..HEAD -- src tests scripts docs | Select-String -Pattern 'sb_secret|eyJ[A-Za-z0-9_-]{10,}|postgres(ql)?://|SUPABASE_SECRET_KEY\s*=|@gmail\.com|dieu@'`
Expected: chỉ khớp chính dòng mẫu lệnh này trong tệp plan; không khớp nào trong `src`, `tests`, `scripts`.

- [ ] **Step 3: Hỏi anh cho push**

Trình bày số commit và nội dung; chỉ push khi anh đồng ý rõ ràng.

- [ ] **Step 4: Ghi dấu vân tay bản live, push**

Run (Bash): `curl -s --max-time 30 https://hpcatalogue.app/login | grep -o '/_next/static/[^"]*' | sort -u | md5sum`
Run: `git push origin main` → `<cũ>..<mới>  main -> main`.

- [ ] **Step 5: Đợi Vercel triển khai**

Run (Bash, nền, timeout 10 phút): lặp mỗi 10 giây tới khi dấu vân tay `/login` khác Step 4; in giờ lúc đổi.
Rồi: `curl -s https://hpcatalogue.app/huong-dan/21-tai-khoan.png | md5sum` so với `md5sum public/huong-dan/21-tai-khoan.png` — phải trùng; tương tự `https://hpcatalogue.app/huong-dan/en/21-tai-khoan.png`.

- [ ] **Step 6: E2E trên production**

Run (PowerShell, nền, timeout 8 phút): `$env:GOC="https://hpcatalogue.app"; $env:RA="$S\e2e-hoat-dong-prod"; npx tsx scripts/tmp-e2e-hoat-dong.mts`
Expected: `Ket qua: 14 dat, 0 hong`, `Da xoa 4/4 tai khoan tam`. Soát hai ảnh như Task 6 Step 4.

- [ ] **Step 7: Soát trang Hướng dẫn trên production**

Run: `$env:GOC="https://hpcatalogue.app"; $env:NN="en"; $env:RA="$S\soat-prod-en-hoatdong"; npx tsx scripts/tmp-xem-huong-dan.mts`, rồi `NN="vi"`, `RA="$S\soat-prod-vi-hoatdong"`.
Expected: EN `hinh: 22, anh tu thu muc en: 22, buoc: 22`; VI `hinh: 22, anh tu thu muc en: 0, buoc: 22`; mỗi lượt `Da xoa tai khoan tam`. Xem `hinh-22.png` hai bộ.

- [ ] **Step 8: Dọn dẹp**

Xoá `scripts/tmp-e2e-hoat-dong.mts` và `scripts/tmp-xem-huong-dan.mts`. Run: `git status --short` → trống.

- [ ] **Step 9: Cập nhật memory** (thư mục `C:\Users\pit010\.claude\projects\C--Users-pit010-QUICKBOOK-WEBAPP\memory\`)

Tạo `catalogue-cham-hoat-dong.md` (thay `<sha>` bằng `git rev-parse --short HEAD`):

```markdown
---
name: catalogue-cham-hoat-dong
description: Catalogue — chấm màu hoạt động ở trang Tài khoản đọc users.last_seen_at (ghi trong getSessionUser, tối đa 10 phút/lần), không đọc last_sign_in_at
metadata:
  type: project
---

Trang Tài khoản (`/admin/nguoi-dung`) có chấm trước email: xanh < 24h, vàng hổ phách < 7 ngày,
xám lâu hơn / chưa vào (anh yêu cầu 15/09/2026). LIVE `<sha>`, E2E production 14/14.

Điều không đọc ra từ code:

- **Mốc là lần cuối DÙNG hệ thống — anh chốt.** `last_sign_in_at` của Supabase chỉ đổi khi bấm
  đăng nhập lại; `proxy.ts` gia hạn phiên mỗi yêu cầu nên người dùng hằng ngày giữ một phiên
  nhiều tuần → tô theo mốc đó là xám oan.
- **Ghi trong `getSessionUser`, tuần tự ngay sau câu SELECT, tối đa 10 phút/lần.** Không
  `after()`, không ở `proxy.ts` — bài học phiên kẹt ClientRead 10/09 ([[catalogue-vai-tro-du-lieu]],
  [[catalogue-ket-noi-db]]). Ghi lỗi chỉ log.
- **Mốc hiển thị = muộn hơn giữa last_seen_at và last_sign_in_at**, để ngay sau khi thêm cột
  không ai bị xám oan.
- **Thêm cột mà Drizzle đọc: migration TRƯỚC, push SAU.** `select()`/`insert()` của Drizzle liệt kê
  mọi cột trong schema (cửa gác, callback Google, danh sách tài khoản) → cột chưa có là mọi trang
  có đăng nhập lỗi 500. Máy chủ cục bộ dùng DB production nên cũng phải đợi migration.
- Vàng tươi không đạt 3:1 trên nền be → vàng hổ phách `#A8741A`; test
  `tests/app/hoat-dong-tuong-phan.test.ts`.
```

Thêm một dòng vào `MEMORY.md` ngay dưới dòng `[Vai trò là dữ liệu]`:

```markdown
- [Chấm hoạt động ở trang Tài khoản](catalogue-cham-hoat-dong.md) — đọc users.last_seen_at ghi trong cửa gác ≤10 phút/lần; migration trước, push sau
```

Thêm vào cuối `catalogue-anh-huong-dan.md`:

```markdown
## Bước 21 Tài khoản có chấm hoạt động (15/09/2026)

Ô email giờ là chấm + chữ ẩn + `[data-email]` + "(bạn)". Script che email qua `[data-email]` và
NÉM LỖI nếu không thấy — nhánh dự phòng cũ ghi đè cả ô (xoá mất chấm), còn chụp tiếp mà không che
được là lộ email thật lên ảnh công khai. Màu chấm trên ảnh là hoạt động thật của nhân viên (email
đã che). Xem [[catalogue-cham-hoat-dong]].
```
