# Bàn giao — Catalogue Quote System

**Cập nhật:** 2026-08-29 · **Nhánh:** `feat/m0-m1-catalogue` · **Mốc:** M0 + M1

---

## 1. Đang ở đâu

**11/14 task hoàn thành. 100 test xanh. 34 commit.**

| # | Task | Trạng thái |
|---|---|---|
| 1 | Khởi tạo dự án + tầng cấu hình | ✅ |
| 2 | Lược đồ CSDL + migration | ✅ |
| 3 | Đăng nhập, phiên, chốt chặn vai trò | ✅ |
| 4 | Tiện ích tiếng Việt / tiền tệ / ngày | ✅ |
| 5 | Logic đường dẫn cây danh mục | ✅ |
| 6 | Danh mục: CSDL + nghiệp vụ + giao diện | ✅ |
| 7 | Xử lý ảnh (3 biến thể WebP) | ✅ |
| 8 | Lưu trữ Supabase Storage | ✅ |
| 9 | Sản phẩm: tìm kiếm + nghiệp vụ | ✅ |
| 10 | Upload ảnh hàng loạt | ✅ |
| 11 | Giao diện catalogue | ⚠️ **code xong, review yêu cầu sửa 1 lỗi** |
| 12 | Thao tác hàng loạt | ⬜ chưa bắt đầu |
| 13 | Cấu hình thương hiệu | ⬜ chưa bắt đầu |
| 14 | Kiểm thử đầu-cuối | ⬜ chưa bắt đầu |

**Chạy được đầu-cuối ngay bây giờ:** đăng nhập và phân quyền · quản lý cây danh mục nhiều cấp · tải ảnh hàng loạt (sinh 3 biến thể, xoá EXIF, phát hiện ảnh trùng theo mã băm) · tìm kiếm tiếng Việt không dấu · lưới ảnh có bộ lọc · sửa chi tiết sản phẩm.

---

## 2. Chạy trên máy

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # 100 test, mất ~60-90s (chạm CSDL thật)
npm run typecheck
npm run build
```

**Cần `.env.local`** — không có trong git. Xin từ người bàn giao, hoặc dựng lại theo `.env.example`:

```
DATABASE_URL=postgresql://postgres.<ref>:<mat-khau>@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_STORAGE_BUCKET=catalogue
```

**Ba điều bắt buộc, sai là mất hàng giờ dò:**

1. **Phải dùng connection pooler**, không dùng host trực tiếp `db.<ref>.supabase.co`. Host trực tiếp **chỉ có IPv6**; máy không có route IPv6 sẽ treo im lặng, không báo lỗi gì.
2. **`prepare: false`** trong `src/db/client.ts` là bắt buộc khi đi qua pooler. Bỏ đi sẽ ra lỗi prepared-statement rất khó đoán.
3. **Bucket `catalogue` phải đặt private.** Ảnh phục vụ qua URL có ký và hết hạn (PRD §8.3), không phải link công khai.

**Tài khoản admin:** `aiteamdev1@gmail.com` (mật khẩu xin riêng, hoặc đặt lại qua Supabase → Authentication). Tạo tài khoản mới:

```bash
npx tsx scripts/tao-admin.mts <email> <mat-khau> "<Họ tên>"
```

---

## 3. Việc tiếp theo, theo thứ tự

### 3.1 Sửa lỗi Task 11 trước — **bắt buộc, chặn Task 12**

`src/app/admin/products/[id]/actions.ts` bắt `LoiSkuTrung` rồi `throw` lại từ trong một Server Action.

**Next.js che thông báo lỗi của Server Action ở production.** Nên nhân viên nhập trùng mã sản phẩm sẽ thấy màn hình lỗi chung chung **không một chữ tiếng Việt** — tệ hơn lỗi CSDL thô, và vô hiệu hoá hoàn toàn lớp `LoiSkuTrung`.

Lỗi này **không lộ ở `npm run dev`** vì Next không che thông báo ở chế độ development. Chỉ xuất hiện đúng trong production.

**Cách sửa** (theo tài liệu Next 16 trong `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`): lỗi lường trước được thì **trả về dưới dạng giá trị**, không ném ra.

- Chuyển phần form sang client component, dùng `useActionState`
- `luuSanPham` trả `{ error?: string }` cho trường hợp `LoiSkuTrung`, vẫn `throw` cho lỗi ngoài dự kiến
- Hiện `state.error` cạnh nút Lưu

### 3.2 Task 12 — Thao tác hàng loạt
Sửa `src/app/admin/products/page.tsx` (bọc lưới trong form chọn nhiều) + 2 file mới. Xem `docs/superpowers/plans/2026-08-28-m0-m1-nen-mong-va-catalogue.md`.

### 3.3 Task 13 — Cấu hình thương hiệu
Một bản ghi dùng chung: logo, màu, tiền tệ. Upload logo đi qua `storage.ts`.

### 3.4 Task 14 — Kiểm thử đầu-cuối
Playwright, 5 kịch bản. **Phải phủ cả đường đăng nhập sai mật khẩu** — đường này hiện mới chỉ được xác minh bằng build và đọc code, chưa từng chạy thật.

### 3.5 Món nợ tồn từ trước
- **Task 3 bước 11** và **Task 6 bước 8** — kiểm tra thủ công trên trình duyệt, hồi đó chưa có tài khoản admin nên bỏ qua. Giờ làm được.
- **Chạy thử clone sạch**: `git clone` → `npm install` → `typecheck` → `build`. Task 1 từng có lỗi chỉ xuất hiện trên bản clone mới.

---

## 4. Nợ kỹ thuật

### Cần xử lý sớm

**Bộ test chập chờn — khoảng 1 lần hỏng / 7 lần chạy.** Chưa tìm ra nguyên nhân.

Giả thuyết ban đầu là timeout cold-start của nhóm test CSDL qua pooler Singapore, nhưng **đã bị bác**: một lần hỏng rơi vào `image-processor.test.ts`, hoàn toàn không dính CSDL. Giả thuyết hiện tại: vitest chạy các file test song song, các test sinh ảnh tốn CPU bị đói tài nguyên.

Cách kiểm chứng: chạy nhiều lần với `--no-file-parallelism` rồi so tỷ lệ hỏng. Nếu đúng, thu hẹp `testTimeout: 15000` từ toàn cục về riêng `tests/db/**` thay vì nâng tiếp con số.

**Cuộc đua khi phát hiện ảnh trùng.** Hai người upload cùng lúc một ảnh giống hệt có thể tạo ra hai sản phẩm. **Đừng "sửa" bằng unique index trên `contentHash`** — PRD B6 yêu cầu cho người dùng chọn *"bỏ qua, thay thế, hay vẫn giữ cả hai"*, và unique index sẽ đóng vĩnh viễn lựa chọn thứ ba. Lý do đã ghi trong chú thích tại `src/modules/media/upload.service.ts`. Khi làm đầy đủ B6, giải pháp đúng nhiều khả năng là *partial* unique index.

**`storage.ts` là cửa ngõ duy nhất tới Supabase Storage — nhưng chỉ là quy ước.** Không có luật lint nào chặn module khác tự gọi `createClient`. Nên thêm `no-restricted-imports`.

### Mức trung bình

- **`chuyenNhanh`** (chuyển nhánh danh mục) là nhiều lệnh ghi nhưng **chưa được nối với action nào**. Task nào đầu tiên phơi bày nó **phải bọc `db.transaction`** giống `xoaDanhMuc`.
- Form sửa/xoá danh mục hiện với cả người dùng `sale`. `requireAdmin()` chặn ở phía máy chủ nên không phải lỗ hổng, nhưng trải nghiệm không nhất quán.
- Form xoá danh mục chưa gửi `chuyen_san` → mỗi lần xoá đều bỏ danh mục của sản phẩm, dù tầng nghiệp vụ đã hỗ trợ chuyển sang danh mục khác.
- `taoSanPham` trả về `{...r}` nên kèm cả cột nội bộ (`searchText`, `createdBy`…). Chưa rò rỉ vì chưa nơi nào JSON-serialize, nhưng API nào trả thẳng ra sẽ lộ.
- `route.ts` — khối đọc tệp chưa có `try/catch` riêng, lỗi parse body sẽ ra 500 thô thay vì hợp đồng JSON `{ loi }` của ứng dụng.
- Không có test tự động cho chính `route.ts` (chặn khi chưa đăng nhập, 0 tệp, 200 tệp). Tính chất bảo mật này hiện không có bảo vệ regression.
- Mã băm tính trên **byte gốc kể cả EXIF** → hai ảnh giống hệt về pixel nhưng khác EXIF sẽ ra hash khác. Cần xác nhận đây là ý muốn.

### Mức thấp

- `xoaNhieu` và `chuyenSanPhamSangDanhMuc`: N+1 query thay vì `WHERE id IN (...)`.
- Mỗi biến thể ảnh gọi `sharp(gocBuffer)` riêng → giải mã ảnh gốc 3 lần. Nên dùng `.clone()`.
- `xuLyAnh` chỉ bọc `try/catch` quanh `metadata()`; lỗi trong `resize`/`webp` sẽ ra lỗi sharp thô.
- Nhánh USD trong `dinhDangTien` để `Intl` tự làm tròn → về lý thuyết vẫn in được `"-$0.00"`. Nhánh VND đã sửa.
- `categories.service.ts` còn chuỗi tiếng Việt inline trong `throw new Error()`.
- `route.ts:13` chuỗi `"Chưa chọn tệp nào."` còn inline, chưa vào `vi.ts`.
- `products.service.ts` import `BoLoc`, `ThamSoTrang` nhưng không dùng → 2 cảnh báo eslint.
- `package.json` chưa có trường `engines`.
- Không escape `%` và `_` trong từ khoá trước khi ghép `LIKE` (không phải lỗ hổng vì đã bound parameter, chỉ khớp nhầm).
- Thứ tự kết quả upload: tệp hỏng ở bước kiểm sơ bộ bị đẩy lên đầu danh sách thay vì giữ thứ tự người dùng chọn.

---

## 5. Cạm bẫy đã gặp — đọc trước khi viết code

Trong 11 task, **có 12 lỗi nằm sẵn trong bản kế hoạch** và đều bị chặn trước khi thành nợ. Ghi lại để không lặp:

| Lỗi | Bài học |
|---|---|
| Regex bỏ dấu dùng **ký tự tổ hợp thô** (U+0300–U+036F) dán thẳng vào source | Ký tự vô hình, vỡ khi đổi encoding. Luôn dùng escape `\uXXXX` |
| Test định dạng ngày dùng mốc **nửa đêm UTC** | Ở UTC+7 giờ UTC và giờ máy trùng nhau → test **không thể đỏ**. Đặt mốc sát ranh giới ngày theo hai hướng |
| `Math.round` làm tròn `.5` về `+Infinity` | Bất đối xứng giữa số âm/dương, và in ra `"-0 ₫"` cho mọi số âm nhỏ |
| Trang login **`throw`** mã lỗi thay vì `redirect` | `throw` không phải `NEXT_REDIRECT`, không ai bắt → màn hình lỗi thay vì khung cảnh báo |
| **Chiều gọi `taoVongLap` bị ngược** | Hàm chỉ đúng khi gọi `(path đích, id nút đang di chuyển)`. Gọi ngược → hệ thống **cho phép tạo vòng lặp**, nhánh tự tách khỏi cây |
| `laLoiTrungKhoa` chỉ đọc `e.message` | **Drizzle bọc lỗi Postgres vào `.cause`** → `LoiSkuTrung` chưa từng được ném. Phải dò `.cause` và kiểm SQLSTATE `23505` |
| `resize(w, h, {fit:"inside"})` | **Làm tròn hai lần** → ảnh 3000×2000 ra 1999×1333. Chỉ truyền một chiều ràng buộc |
| Script dùng **top-level await** trong file `.ts` | Dự án là CommonJS → phải đổi đuôi `.mts` |
| `dotenv.config()` đặt sau `import` | **ESM nâng mọi `import` lên chạy trước** → biến môi trường chưa nạp. Dùng `import()` động |
| Ghi Storage **bên trong `db.transaction`** | Giữ kết nối pooler qua 4 lượt đi mạng. Pool chỉ có 10 → cạn kết nối |
| `Promise.all` + `arrayBuffer()` cho cả lô | 200 tệp × 20 MB ≈ **4 GB trong RAM**, và tệp quá cỡ chỉ bị từ chối *sau khi* đã đọc |
| `${products.id}` trong truy vấn con | Drizzle in **không kèm tên bảng** → bị `product_images.id` che → `anhDaiDien` **luôn `null`**, lưới ảnh không bao giờ hiện hình |

**Bài học lớn nhất:** lỗi cuối cùng lọt qua cả hai lớp bảo vệ — test xanh và review độc lập — vì **test của Task 9 chỉ khẳng định về danh sách `sku`, chưa bao giờ chạm tới `anhDaiDien`**. Nó chỉ lộ ra khi Task 11 thực sự *dùng* trường đó.

> Một truy vấn tính ra trường mới thì phải có test **khẳng định giá trị của chính trường đó**, không phải test một hành vi lọc thay thế.

---

## 6. Quy trình đang dùng

Mỗi task đi qua: brief riêng → agent cài đặt theo TDD → agent review độc lập chấm **hai điểm** (đúng spec + chất lượng code) → có lỗi Critical/Important thì sửa rồi review lại → sạch mới sang task tiếp.

Ba nguyên tắc đã cứu được nhiều lỗi thật:

**Không sửa test cho khớp code.** Gặp mâu thuẫn thì dừng, tìm bên nào sai, báo lại. Đã bắt được 3 lỗi kế hoạch nhờ nguyên tắc này.

**Test chưa ai nhìn thấy đỏ thì chưa chứng minh được gì.** Với test bảo vệ điều quan trọng, phải cố ý làm hỏng code để xem test có thật sự đỏ không, rồi mới khôi phục.

**Không tin báo cáo, tự kiểm chứng.** Đã có lần agent báo 70/70 nhưng chạy lại thì 69/70.

Ghi chép ở `.superpowers/sdd/progress.md` (không vào git). Kế hoạch chi tiết 14 task ở `docs/superpowers/plans/`, đặc tả ở `docs/superpowers/specs/`.

---

## 7. Kiến trúc

```
src/lib/       tiện ích thuần, KHÔNG import gì từ project
src/db/        lược đồ + kết nối (prepare:false, bắt buộc vì pooler)
src/auth/      phiên đăng nhập + chốt chặn vai trò
src/modules/   nghiệp vụ — catalog/ và media/
src/messages/  TOÀN BỘ chuỗi hiển thị tiếng Việt
src/app/       route + giao diện, chỉ gọi xuống modules
```

**Chiều phụ thuộc luôn là `app` → `modules` → `db`/`lib`.** Không có mũi tên ngược.

Bốn quy tắc bất di bất dịch:

1. **Chỉ `src/lib/env.ts` được đọc `process.env`** (ngoại lệ duy nhất: `drizzle.config.ts`, là file cấu hình build-time).
2. **Chỉ `src/modules/media/storage.ts` được gọi Supabase Storage.**
3. **Mọi chuỗi hiển thị nằm trong `src/messages/vi.ts`**, không viết thẳng vào JSX.
4. **Kiểm tra vai trò luôn ở phía máy chủ.** Ẩn nút không phải là kiểm soát truy cập.

---

## 8. Lưu ý vận hành

**Cơ sở dữ liệu và bucket là thật và dùng chung.** Mọi test ghi dữ liệu phải bọc `withRollback` (CSDL) hoặc `try/finally` + `xoaTep` (Storage). Bộ test hiện chập chờn 1/7, nên việc bỏ lại rác không phải giả thuyết.

**Không bao giờ** chạy `DROP`, `TRUNCATE`, hay xoá dữ liệu mình không tạo ra.

**Khoá `sb_secret_` vượt qua mọi luật Row Level Security.** Chỉ nằm ở `.env.local` phía máy chủ. Đã kiểm: không commit nào trong lịch sử git chứa nó.

**Phiên bản thực tế:** Next.js 16.3.3 · React 19.2.8 · Tailwind 4 · PostgreSQL 17.6 (Supabase, vùng `ap-southeast-1`). PRD ban đầu ghi Next.js 15; đã cập nhật lại §6.2.
