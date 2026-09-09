# Kết nối Google Sheet + Drive cho web catalogue

> **CẢ HAI ĐƯỜNG TRONG TÀI LIỆU NÀY ĐỀU BỊ CHẶN Ở CTYHP (08/09/2026).**
> Đường đang dùng là **Google Apps Script** — xem
> [dong-bo-apps-script.md](dong-bo-apps-script.md).
>
> - **Đường A** (mời tài khoản máy vào Shared Drive) bị chính sách Workspace từ
>   chối thẳng: *"Policy set by the administrators of CTYHP prohibits the sharing
>   of items with catalogue-web@… because it is not a Google Account in a
>   compatible allowlisted domain."*
> - **Đường B** (uỷ quyền toàn miền) cần admin.google.com, mà anh không có quyền.
>
> Giữ tài liệu này lại làm hồ sơ: nếu sau này IT mở chính sách, đường A là đường
> ngắn nhất và mã nguồn đọc Google trực tiếp vẫn còn nguyên trong repo
> (`sheet.client.ts`, `drive.client.ts`, `google-auth.ts`).

---

**Hiện tại**: web chạy bằng một bản chụp dữ liệu lấy về ngày 07/09/2026. Sửa bảng
tính không lên web, thêm ảnh vào Drive cũng không lên web.

**Sau khi làm xong**: sửa bảng tính → khoảng 60 giây sau web đổi theo. Bỏ ảnh mới
vào thư mục Drive → khoảng 10 phút sau web thấy. Không ai phải bấm nạp lại gì.

Có **hai đường** làm được việc này. Tài liệu này hướng dẫn **đường A** — đường
ngắn, không cần vào Admin Console, không cần nhờ IT. Đường B nằm ở cuối, chỉ dùng
khi đường A bị chặn.

---

# ĐƯỜNG A — mời tài khoản máy vào 4 Shared Drive

Ý tưởng: tạo một "tài khoản máy" (service account) cho web, rồi **mời nó vào từng
Shared Drive** đúng như mời một đồng nghiệp, với quyền Người xem.

Mời vào **Shared Drive** là thấy hết mọi thư mục bên trong — **4 thao tác, không
phải 65**.

Ước tính: 15 phút, trong đó 2 phút cần nhờ đồng nghiệp.

## Bước 1 — Tạo tài khoản máy và tải khoá

Đăng nhập Google bằng tài khoản **@ctyhp.vn** (đừng dùng Gmail cá nhân).

1. Mở <https://console.cloud.google.com/iam-admin/serviceaccounts>
2. Nhìn thanh xanh trên cùng, chọn project **catalogue-web**. Chưa có project thì
   bấm ô chọn project → **NEW PROJECT** → tên `catalogue-web` → **CREATE**, xong
   nhớ **chọn lại** project vừa tạo (Google không tự chuyển sang).
3. Bật hai API — mỗi link bấm **ENABLE** một lần:
   - <https://console.cloud.google.com/apis/library/sheets.googleapis.com>
   - <https://console.cloud.google.com/apis/library/drive.googleapis.com>

   Nút hiện chữ **MANAGE** nghĩa là đã bật sẵn, bỏ qua.
4. Quay lại trang Service Accounts, bấm **+ CREATE SERVICE ACCOUNT**
   - *Service account name*: `catalogue-web`
   - **CREATE AND CONTINUE**
   - Màn hình *Grant this service account access to project*: **để trống**, bấm
     **CONTINUE**
   - Màn hình cuối: **DONE**
5. Xong sẽ có một dòng với email dạng
   `catalogue-web@catalogue-web-xxxxxx.iam.gserviceaccount.com`.
   **Chép email này lại** — cả bước 2 và bước 4 đều cần.
6. Bấm vào dòng đó → tab **KEYS** → **ADD KEY → Create new key → JSON** →
   **CREATE**. Trình duyệt tải về một tệp `.json`.

> **Tệp JSON này là mật khẩu.** Ai có nó là đọc được dữ liệu. Cất vào chỗ riêng,
> đừng gửi qua chat nhóm hay email chung.

**Nếu Google báo lỗi khi tạo khoá** (`Key creation is not allowed on this service
account`): tổ chức đang cấm tạo khoá. Báo lại để chuyển sang đường khác.

## Bước 2 — Mời tài khoản máy vào 4 Shared Drive

Ảnh sản phẩm nằm rải trên **4 Shared Drive**. Với mỗi cái:

1. Mở link ở bảng dưới
2. Bấm chuột phải vào tên Shared Drive ở cột trái → **Quản lý thành viên**
   (hoặc bấm tên drive trên đầu trang → *Quản lý thành viên*)
3. Dán email tài khoản máy
4. Chọn quyền **Người xem**
5. **Bỏ tích "Thông báo cho mọi người"** — tài khoản máy không có hộp thư
6. Bấm **Gửi** / **Chia sẻ**

| # | Shared Drive | Link | Ai làm |
|---|---|---|---|
| 1 | 57 thư mục ảnh | <https://drive.google.com/drive/folders/0AIyzHshEwIqqUk9PVA> | **Nhờ đồng nghiệp** |
| 2 | A-HÌNH SẢN PHẨM ĐẸP (6 thư mục) | <https://drive.google.com/drive/folders/0ABBifYpSdPWTUk9PVA> | Anh tự làm được |
| 3 | 1 thư mục | <https://drive.google.com/drive/folders/0ACN0qXNdoBwsUk9PVA> | **Nhờ đồng nghiệp** |
| 4 | WEBSITE (1 thư mục) | <https://drive.google.com/drive/folders/0AJ2V8vBTjUsGUk9PVA> | Anh tự làm được |

Khảo sát ngày 08/09/2026 cho thấy tài khoản của anh **không phải thành viên** của
drive số 1 và số 3, nên hai cái đó phải nhờ người đang quản lý chúng.

### Tin nhắn gửi đồng nghiệp

> Nhờ anh/chị mở Shared Drive này giúp em: `<dán link>`
>
> Bấm chuột phải vào tên drive ở cột trái → **Quản lý thành viên**, thêm địa chỉ
> dưới đây với quyền **Người xem**, nhớ **bỏ tích thông báo**:
>
> `catalogue-web@....iam.gserviceaccount.com`
>
> Đây là tài khoản máy của web catalogue công ty, **chỉ đọc** — không sửa, không
> xoá, không tải lên được gì.

### Nếu Google từ chối

Thông báo kiểu *"Không thể chia sẻ bên ngoài tổ chức"* nghĩa là Workspace đang cấm
chia sẻ ra ngoài tên miền, mà email tài khoản máy thì nằm ngoài `ctyhp.vn`.

Đường A dừng ở đây. Báo lại để chuyển sang **đường C** (Apps Script) — đường đó
không cần chia sẻ gì ra ngoài, cũng không cần quyền quản trị nào.

## Bước 3 — Chia sẻ bảng tính

1. Mở bảng tính **Catalogue-OL**
2. Bấm **Chia sẻ** góc trên bên phải
3. Dán email tài khoản máy, chọn **Người xem**, bỏ tích thông báo, bấm **Gửi**
4. Chép **Sheet ID** từ thanh địa chỉ — đoạn nằm giữa `/d/` và `/edit`:

```
https://docs.google.com/spreadsheets/d/[ĐOẠN NÀY LÀ SHEET ID]/edit#gid=0
```

## Bước 4 — Khai báo trên Vercel

Vào project **product-catalog-management** → *Settings* → *Environment Variables*.

### Thêm 3 biến (chọn cả Production và Preview)

| Biến | Giá trị | Kiểu |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `catalogue-web@....iam.gserviceaccount.com` | Config |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | nội dung `private_key` trong tệp JSON — xem cách chép bên dưới | **Secret** |
| `CATALOGUE_SHEET_ID` | Sheet ID lấy ở bước 3 | Config |

### Sửa 1 biến

`CATALOGUE_SHEET_TAB` đang là `test` → đổi thành **`Catalogue-OL`**.

### Xoá hẳn 2 biến — quan trọng nhất

- `CATALOGUE_TEP_MAU`
- `CATALOGUE_TEP_ANH_MAU`

Còn hai biến này thì hệ thống **vẫn đọc dữ liệu mẫu** và bỏ qua Google. Đây mới là
công tắc thật; thêm bao nhiêu biến ở trên cũng vô nghĩa nếu quên xoá chúng.

### TUYỆT ĐỐI không đặt `GOOGLE_IMPERSONATE_EMAIL`

Biến đó bắt tài khoản máy **đóng vai một người thật** — việc này cần uỷ quyền toàn
miền trong Admin Console (đường B). Đặt nó mà không có uỷ quyền thì **hỏng ngay từ
bước lấy token**, đến bảng tính cũng không đọc được.

Đường A đi bằng chính tài khoản máy, nên biến này phải **để trống hoặc không tồn
tại**.

### Cách chép khoá PEM cho đúng

Mở tệp JSON bằng Notepad, tìm dòng `"private_key"`:

```
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADAN...\n-----END PRIVATE KEY-----\n",
```

Chép **nguyên đoạn nằm giữa hai dấu nháy kép**, kể cả các ký tự `\n` — cả dãy trên
**một dòng**, đừng bấm Enter chỗ nào. Bỏ hai dấu nháy kép ở đầu và cuối.

Đây là chỗ hay sai nhất. Khoá bị xuống dòng thật thay vì `\n` thì hệ thống báo
không lấy được access token.

### Deploy lại

*Deployments* → bản mới nhất → **Redeploy**. Biến môi trường chỉ có hiệu lực với
lần build sau khi thêm.

## Bước 5 — Kiểm tra

Trên máy, điền y hệt các biến trên vào `.env.local` rồi chạy:

```bash
npm run kiem-tra:google
```

Lệnh đi qua 5 chặng và dừng ngay ở chặng đầu tiên hỏng, kèm việc cụ thể phải làm.
Năm chặng hỏng theo năm cách khác hẳn nhau và rất dễ đọc nhầm thành nhau:

| Chặng | Hỏng nghĩa là |
|---|---|
| 1. Cấu hình | thiếu biến, hoặc còn giá trị giả `CHUA_CO_...` |
| 2. Lấy access token | khoá PEM sai định dạng, **hoặc lỡ đặt `GOOGLE_IMPERSONATE_EMAIL`** |
| 3. Đọc bảng tính | chưa chia sẻ bảng tính cho tài khoản máy (bước 3) |
| 4. Liệt kê thư mục ảnh | **thư mục trả về rỗng** — còn Shared Drive chưa mời ở bước 2 |
| 5. Tải một ảnh | cả ảnh gốc lẫn ảnh thu nhỏ đều không lấy được |

Chặng 2 sẽ in ra `dang mao danh ...` nếu anh lỡ đặt biến impersonate — thấy dòng
đó là xoá biến đi.

Chặng 4 là chỗ dễ đọc nhầm nhất: thư mục **chưa được mời** trả về danh sách **rỗng
kèm mã 200**, Google không báo lỗi gì cả.

Chạy hết 5 chặng không hỏng chặng nào là xong. Sau đó mở web, sửa một ô trên bảng
tính, đợi khoảng một phút rồi tải lại trang catalogue — giá trị mới phải hiện ra.

---

## Vài điều đã xử lý sẵn, không cần lo

- **Quyền Người xem là đủ.** Nhiều thư mục bật `restrictedForReaders` khiến người
  xem không tải được tệp gốc. Hệ thống hỏi trước xem có tải được bản gốc không,
  không được thì lấy bản thu nhỏ 1600px. Không cần nhờ ai gỡ hạn chế đó, cũng
  không cần quyền Người đóng góp.
- **Ảnh được lưu đệm.** Ảnh tải về được thu nhỏ và cất vào Supabase Storage; lần
  sau không gọi lại Google. Không lo vượt hạn mức API.
- **Bảng tính đệm 60 giây, thư mục ảnh đệm 10 phút.** Sửa xong đợi một chút mới
  thấy là bình thường.
- **Cột thư mục nhận cả hai kiểu**: dán link thường và chip Drive (kiểu bấm vào
  hiện tên thư mục) đều đọc được.

---

# ĐƯỜNG B — uỷ quyền toàn miền (chỉ khi đường A bị chặn, và cần IT)

Thay vì mời tài khoản máy vào từng Shared Drive, cho nó **đóng vai một người thật**
trong công ty. Nó sẽ thấy đúng những gì người đó thấy — kể cả thư mục chia sẻ cho
cả tổ chức về sau, không phải mời tay từng cái.

Đổi lại **bắt buộc phải vào Admin Console**, tức phải nhờ quản trị viên cấp cao
của Google Workspace.

1. **Cloud Console**, trong service account đã tạo ở bước 1: mở trang chi tiết,
   tìm dòng **Unique ID** — một dãy khoảng 21 chữ số. Chép lại.
2. **Admin Console** (<https://admin.google.com>, khác hẳn Cloud Console):
   *Bảo mật → Kiểm soát quyền truy cập và dữ liệu → Điều khiển API →
   Quản lý uỷ quyền trên toàn miền* → **Add new**
   - **Client ID**: dãy 21 chữ số ở trên
   - **OAuth scopes**: dán nguyên dòng này, không có dấu cách

     ```
     https://www.googleapis.com/auth/spreadsheets.readonly,https://www.googleapis.com/auth/drive.readonly
     ```

   - **AUTHORISE**
3. Trên Vercel, **thêm** biến `GOOGLE_IMPERSONATE_EMAIL` = email một người thật
   `@ctyhp.vn` mở được tất cả thư mục ảnh. Deploy lại.

Cả hai phạm vi đều là `readonly` — hệ thống chỉ đọc, không sửa, không xoá, không
tạo gì trên Drive hay Sheet.
