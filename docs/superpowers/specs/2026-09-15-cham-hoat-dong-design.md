# Chấm màu hoạt động trên trang Tài khoản — thiết kế

Ngày: 15/09/2026. Trang: `/admin/nguoi-dung` (chỉ admin), cửa gác `getSessionUser`, trang
Hướng dẫn bước 21.

## 1. Yêu cầu

Anh gửi ảnh một danh sách "EMAIL NHÂN VIÊN" có chấm màu trước mỗi email, kèm chú giải:
xanh "Hoạt động trong 24h", vàng "Hoạt động trong 7 ngày", xám "Lâu không đăng nhập".
Anh muốn hệ thống có các chấm này để biết nhân viên truy cập thế nào.

Anh chốt (15/09/2026):

- Mốc tính là **lần cuối dùng hệ thống**, không phải lần cuối đăng nhập.
- Cách **A**: thêm một cột, ghi khi nhân viên mở trang, tối đa 10 phút một lần.

## 2. Hiện trạng

- Cột "Lần cuối vào" (`bang-tai-khoan.tsx:230`) hiện `lanCuoiDangNhap` = `last_sign_in_at`
  của Supabase Auth, đọc qua `auth.admin.listUsers` trong `danhSachNguoiDung()`. Mốc này
  chỉ đổi khi bấm đăng nhập lại. `proxy.ts` gia hạn phiên trên mọi yêu cầu, nên người dùng
  hằng ngày có thể giữ một phiên nhiều tuần — tô màu theo mốc này thì họ bị xám oan.
- Bảng `users` chưa có cột nào ghi hoạt động.
- `getSessionUser()` (`auth/guard.ts`) chạy MỘT câu SELECT hồ sơ cho mọi yêu cầu có đăng
  nhập (khung trang, trang, server action, API trong app), bọc `cache()` để khung và trang
  không chạy trùng.
- `db/client.ts` giữ `max: 1`. Sự cố 10/09/2026 (phiên kẹt `ClientRead`) đến từ nhiều truy
  vấn dồn cùng lúc trên một kết nối. Quy tắc đang giữ: mỗi yêu cầu chỉ một truy vấn chạy
  một lúc.
- Migration mới nhất: `0007_gop_y_anh`. Sinh bằng `npm run db:generate`, chạy bằng
  `npm run db:migrate` (drizzle-kit, `.env.local` cổng 5432).
- Test tương phản đọc thẳng `globals.css` qua `tests/app/doc-mau-css.ts`; regex tên biến
  chỉ nhận `[a-z-]` — tên biến màu không được có chữ số.
- Script chụp hướng dẫn che email ở bước 21 bằng cách thay `firstChild` của ô email nếu đó
  là nút chữ; không thì ghi đè cả ô.

## 3. Thiết kế

### 3.1 Dữ liệu

- Cột mới `users.last_seen_at timestamptz NULL`. Trong schema:
  `lastSeenAt: timestamp("last_seen_at", { withTimezone: true })`. Tên tiếng Anh cho khớp
  các cột khác của bảng `users` (`full_name`, `is_active`, `created_at`).
- Migration `0008_users_last_seen_at.sql`, sinh bằng
  `npm run db:generate -- --name users_last_seen_at`, thêm chú thích đầu tệp như `0007`.
  SQL chỉ được có đúng một câu `ALTER TABLE "users" ADD COLUMN "last_seen_at" timestamp with time zone;`
  — sinh ra thêm gì khác là schema đang lệch, phải dừng lại xem.
- Chỉ thêm cột cho phép NULL: code đang chạy không đọc cột này nên không bị ảnh hưởng.
- Không điền dữ liệu cũ. Cột trống lúc đầu; mốc hiển thị lùi về `last_sign_in_at` (3.3).

### 3.2 Ghi nhận hoạt động — trong `getSessionUser`

- Câu SELECT hiện có lấy thêm `lastSeenAt`. Không thêm lượt truy vấn nào.
- Có hồ sơ rồi: nếu `isActive` và `nenGhiHoatDong(lastSeenAt, new Date())` thì chạy MỘT câu
  UPDATE, `await` tuần tự ngay sau SELECT, trước khi hàm trả về:

  ```sql
  UPDATE users SET last_seen_at = now()
  WHERE id = $1
    AND (last_seen_at IS NULL OR last_seen_at < now() - make_interval(mins => 10))
  ```

  Điều kiện lặp lại trong WHERE để hai bản hàm cùng thấy mốc cũ thì chỉ một câu thật sự ghi.
  Số 10 lấy từ hằng `PHUT_GIUA_HAI_LAN_GHI`, truyền dạng tham số.
- UPDATE lỗi: `console.error("[hoat-dong] khong ghi duoc lan cuoi hoat dong:", loi)` rồi trả
  hồ sơ bình thường. Ghi hoạt động không bao giờ được làm ai mất quyền vào.
- Giá trị trả về giữ đúng kiểu `NguoiDung` — không thêm `lastSeenAt` vào kiểu đó.
- Tài khoản bị khoá: không ghi. Họ bị cửa gác chặn, không phải "đang dùng".
- KHÔNG ghi ở `proxy.ts`: tuyến đó chỉ gia hạn phiên và không chạm cơ sở dữ liệu; thêm vào
  là thêm một chỗ mở kết nối ngoài luồng của trang.
- KHÔNG dùng `after()`: nó chạy sau khi phản hồi đã gửi, dựa vào `waitUntil` giữ bản hàm
  sống — đúng loại tình huống bản hàm bị đóng băng giữa cuộc trò chuyện với Postgres đã
  gây kẹt `ClientRead` hôm 10/09.
- Được tính là hoạt động: mọi trang, hành động, API đi qua `getSessionUser` — `/admin/*`,
  `/catalogue/tao`, `/api/catalogue`, `/api/catalogue-chon`, `/api/catalogue-sheet/*`,
  `/api/upload`, `/api/gop-y/anh/*`. Không tính: khách mở link catalogue (không có phiên).
- Chi phí: tối đa một câu UPDATE mỗi 10 phút cho mỗi người đang dùng; mọi yêu cầu khác
  không thêm gì.

### 3.3 Hàm thuần — `src/modules/nguoi-dung/nguoi-dung.model.ts`

```ts
export const PHUT_GIUA_HAI_LAN_GHI = 10;
export type MucHoatDong = "trong-ngay" | "trong-tuan" | "lau";
export const MUC_HOAT_DONG: readonly MucHoatDong[] = ["trong-ngay", "trong-tuan", "lau"];
export function nenGhiHoatDong(lanCuoi: Date | null, bayGio: Date): boolean;
export function gopLanCuoiVao(hoatDong: Date | null, dangNhap: Date | null): Date | null;
export function mucHoatDong(lanCuoi: Date | null, bayGio: Date): MucHoatDong;
```

Quy tắc:

- `nenGhiHoatDong`: `null` → `true`; `bayGio − lanCuoi ≥ 10 phút` → `true`; còn lại, kể cả
  mốc nằm ở tương lai do lệch đồng hồ → `false`.
- `gopLanCuoiVao`: lấy mốc muộn hơn; một bên `null` thì lấy bên kia; cả hai `null` → `null`.
  Đăng nhập cũng là hoạt động — nhờ vậy ngay sau khi triển khai không ai bị xám oan.
- `mucHoatDong`: `null` → `lau`; hiệu `< 24 giờ` → `trong-ngay` (mốc ở tương lai cũng vậy);
  `< 7 ngày` → `trong-tuan`; còn lại → `lau`. Đúng 24 giờ → `trong-tuan`; đúng 7 ngày → `lau`.

### 3.4 Danh sách tài khoản — `src/modules/nguoi-dung/nguoi-dung.service.ts`

- `NguoiDungHang`: bỏ `lanCuoiDangNhap`, thay bằng
  - `lanCuoiVao: Date | null` = `gopLanCuoiVao(h.lastSeenAt, last_sign_in_at)`
  - `mucHoatDong: MucHoatDong` = `mucHoatDong(lanCuoiVao, bayGio)`
- `danhSachNguoiDung()` lấy MỘT `bayGio = new Date()` cho cả danh sách. Tính ở máy chủ;
  bảng (client component) chỉ hiển thị, nên lúc dựng ở máy chủ và lúc trình duyệt nạp lại
  không lệch nhau.
- Supabase Auth lỗi → `last_sign_in_at` coi như `null`; chấm vẫn có theo `last_seen_at`.

### 3.5 Giao diện — `src/app/admin/nguoi-dung/bang-tai-khoan.tsx`

- Ô email, theo thứ tự: chấm tròn 8px (`h-2 w-2 rounded-full`, `mr-2`, căn giữa dòng) mang
  `data-muc-hoat-dong={muc}`, `title={nhãn}`, `aria-hidden`; `<span className="sr-only">`
  chứa nhãn; `<span data-email>` chứa email; thẻ "(bạn)" như cũ.
- Dòng chú giải đặt ngay trên bảng tài khoản: `<ul aria-label={chu_giai_hoat_dong}>` nằm
  ngang, xuống dòng khi hẹp, chữ `text-xs text-hp-muted`, mỗi mục một chấm + nhãn.
- Cột "Lần cuối vào" hiện `ngay(u.lanCuoiVao, nn, t)` — cùng mốc với chấm. Tiêu đề cột giữ
  nguyên.
- Lớp màu chọn qua bảng tĩnh `Record<MucHoatDong, string>` (Tailwind cần tên lớp viết sẵn).
- Màu thêm vào `@theme` trong `globals.css`. Tông ấm, không dùng hồng:

  | Biến | Giá trị | Mức |
  |---|---|---|
  | `--color-hp-hoat-dong-ngay` | `#3F7D4E` | xanh lá trầm — trong 24h |
  | `--color-hp-hoat-dong-tuan` | `#A8741A` | vàng hổ phách — trong 7 ngày |
  | `--color-hp-hoat-dong-lau`  | `#8F877F` | xám ấm — lâu hơn / chưa vào |

  Mỗi màu ≥ 3:1 trên `hp-card` (nền hàng) và `hp-foundation` (nền dòng chú giải) — mức WCAG
  1.4.11 cho thành phần đồ hoạ mang thông tin. Ngày ở cột bên cạnh và chữ ẩn cho trình đọc
  màn hình là kênh thứ hai, nên thông tin không chỉ nằm ở màu.
- Chữ mới trong nhóm `nguoi_dung` (`vi.ts` / `en.ts`):

  | Khoá | vi | en |
  |---|---|---|
  | `hoat_dong_trong_ngay` | Hoạt động trong 24h | Active in the last 24h |
  | `hoat_dong_trong_tuan` | Hoạt động trong 7 ngày | Active in the last 7 days |
  | `hoat_dong_lau` | Lâu không đăng nhập | Not signed in for a while |
  | `chu_giai_hoat_dong` | Chú giải màu hoạt động | Activity colour key |

  Nhãn tiếng Việt giữ đúng chữ trong ảnh anh gửi.

### 3.6 Hướng dẫn — bước 21 Tài khoản

- `tai_khoan.meo[2]` sửa lại cho khớp (số mục không đổi):
  - vi: "Chấm màu trước email cho biết lần cuối người đó dùng hệ thống: xanh — trong 24 giờ,
    vàng — trong 7 ngày, xám — lâu hơn hoặc chưa vào lần nào. Cột Cách đăng nhập cho biết họ
    vào bằng Google, mật khẩu hay cả hai."
  - en: "The dot before each email shows when that person last used the system: green —
    within 24 hours, amber — within 7 days, grey — longer ago or never. The Sign-in method
    column shows Google, password or both."
- Không thêm mốc mũi tên → `chu` và số mốc trong `diem.json` giữ nguyên.
- `scripts/chup-huong-dan.mts` bước 21: che email qua `[data-email]` thay cho `firstChild`.
  Chấm giờ đứng trước email, nhánh cũ sẽ ghi đè cả ô và xoá mất chấm lẫn thẻ "(bạn)".
- Chụp lại `21-tai-khoan` cả hai bộ (vi, en), soát bằng mắt trên trang hướng dẫn. Chỉ commit
  ảnh `21-tai-khoan.png` hai bộ và `diem.json` hai bộ; ảnh bước khác đổi byte do dòng giờ cập
  nhật thì bỏ.

### 3.7 Kiểm tra

- `tests/modules/nguoi-dung/nguoi-dung.model.test.ts` thêm:
  - `nenGhiHoatDong`: `null`; 9 phút 59 giây; đúng 10 phút; mốc ở tương lai.
  - `gopLanCuoiVao`: bốn tổ hợp có/không `null`.
  - `mucHoatDong`: `null`; 1 phút; 23 giờ 59 phút; đúng 24 giờ; 6 ngày 23 giờ; đúng 7 ngày;
    30 ngày; mốc ở tương lai.
- `tests/app/hoat-dong-tuong-phan.test.ts`: ba màu ≥ 3:1 trên `card` và `foundation` của
  `GOC`; mỗi giá trị trong `MUC_HOAT_DONG` có đúng một biến CSS tương ứng.
- `npx tsc --noEmit`, `npm test` (đọc đủ output, không cắt), `npm run build`.
- E2E trên bản live sau khi push — script tạm ngoài repo, theo khuôn tài khoản tạm, xoá
  trong `finally`, có hẹn giờ:
  1. Tạo admin tạm, đăng nhập bằng mật khẩu, mở `/admin/nguoi-dung`.
  2. Dòng chú giải có đủ ba nhãn; dòng của tài khoản tạm có `data-muc-hoat-dong="trong-ngay"`.
  3. Cơ sở dữ liệu: `last_seen_at` của tài khoản tạm khác `null`.
  4. Mở lại trang trong vòng 10 phút → `last_seen_at` không đổi.
  5. `pg_stat_activity` không có phiên kẹt `ClientRead`.
  6. `finally`: xoá tài khoản tạm.

### 3.8 Triển khai — thứ tự bắt buộc

1. Code + test + commit ở máy, chưa push.
2. **Chạy migration trên cơ sở dữ liệu thật** (`npm run db:migrate`) — hỏi anh trước. Kiểm
   lại cột đã có.
3. Chụp lại ảnh hướng dẫn bước 21 (máy chủ cục bộ cần cột đã có), commit.
4. **Push** — hỏi anh trước.
5. E2E trên bản live.

Push trước migration thì `getSessionUser` đọc một cột chưa có → toàn bộ khu admin và trang
tạo catalogue lỗi 500. Lùi lại: revert commit code; cột thừa để nguyên, vô hại.

## 4. Ngoài phạm vi

- Trạng thái "đang online" theo thời gian thực, lịch sử truy cập theo ngày, thống kê lượt
  khách mở catalogue.
- Chấm màu ở chỗ khác ngoài trang Tài khoản.
- Lọc hoặc sắp xếp bảng theo mức hoạt động.
