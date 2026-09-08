# Kết nối Google Sheet + Drive cho web catalogue

**Hiện tại**: web chạy bằng một bản chụp dữ liệu, lấy về ngày 07/09/2026. Sửa bảng
tính không lên web, thêm ảnh vào Drive cũng không lên web.

**Sau khi làm xong**: sửa bảng tính → khoảng 60 giây sau web đổi theo. Bỏ ảnh mới
vào thư mục Drive → khoảng 10 phút sau web thấy. Không ai phải bấm nạp lại gì cả.

Việc chia làm ba phần: phần 1 và 2 do IT / quản trị Google Workspace làm, phần 3
do người quản lý web làm.

---

## Phần 1 — IT làm trong Google Cloud Console

1. Vào <https://console.cloud.google.com> → chọn (hoặc tạo) một project.

2. **Bật hai API**: *APIs & Services → Library*, tìm và bấm Enable cho
   - `Google Sheets API`
   - `Google Drive API`

3. **Tạo service account**: *IAM & Admin → Service Accounts → Create service
   account*.
   - Tên: ví dụ `catalogue-web`
   - Bước "Grant this service account access to project": **bỏ trống**, không cần
     role nào. Quyền đọc dữ liệu đến từ phần 2, không đến từ IAM.
   - Tạo xong sẽ có một email dạng `catalogue-web@<project>.iam.gserviceaccount.com`.

4. **Tạo khoá**: mở service account vừa tạo → tab *Keys* → *Add key → Create new
   key → JSON*. Trình duyệt tải về một file `.json`. **File này là mật khẩu** —
   gửi cho người quản lý web qua kênh riêng, đừng gửi qua chat nhóm hay email
   chung.

5. **Bật uỷ quyền toàn miền** (domain-wide delegation): vẫn trong service account
   → *Advanced settings* (hoặc *Details*) → tick **Enable Google Workspace
   Domain-wide Delegation** → Save.
   Sau khi lưu sẽ hiện một **Client ID** — dãy khoảng 21 chữ số. Chép lại, phần 2
   cần đến.

---

## Phần 2 — Quản trị Google Workspace làm trong Admin Console

Vào <https://admin.google.com> → *Security → Access and data control → API
controls* → mục **Domain-wide delegation** → *Manage domain-wide delegation* →
**Add new**.

- **Client ID**: dán dãy số lấy ở bước 5 phần 1.
- **OAuth scopes**: dán nguyên dòng này (hai phạm vi, ngăn nhau bằng dấu phẩy,
  không có dấu cách):

```
https://www.googleapis.com/auth/spreadsheets.readonly,https://www.googleapis.com/auth/drive.readonly
```

- Bấm **Authorise**.

Cả hai phạm vi đều là `readonly` — hệ thống **chỉ đọc**, không sửa, không xoá, không
tạo file trên Drive hay Sheet.

### Vì sao phải làm bước uỷ quyền này

Đây là câu IT hay hỏi lại, nên nói trước cho gọn.

Đã khảo sát 65 thư mục ảnh thật đang dùng: chúng nằm rải trên **4 Shared Drive**, và
58/65 thư mục chỉ mang đúng một dòng quyền — *"ai trong ctyhp.vn có link đều xem
được"*. Email của service account nằm **ngoài** tên miền `ctyhp.vn` nên không thuộc
diện đó.

Hậu quả nếu bỏ qua bước này: hệ thống vẫn đọc được bảng tính bình thường, nhưng khi
liệt kê thư mục ảnh thì Google trả về **danh sách rỗng kèm mã 200 OK** — tức là
không báo lỗi gì cả, chỉ đơn giản là không có ảnh nào. Rất dễ tưởng nhầm là thư mục
trống.

Cách thay thế duy nhất là mời email service account vào từng Shared Drive một, và
mỗi khi có Shared Drive mới lại phải nhớ mời tiếp. Uỷ quyền toàn miền làm một lần
là xong, kể cả thư mục lập về sau.

---

## Phần 3 — Người quản lý web làm

### 3.1 Chia sẻ bảng tính

Mở bảng tính **ONLINE CATALOGUE** → *Chia sẻ* → thêm email service account
(`...@....iam.gserviceaccount.com`) với quyền **Người xem**.

Lấy luôn **Sheet ID** từ thanh địa chỉ — là đoạn giữa `/d/` và `/edit`:

```
https://docs.google.com/spreadsheets/d/[ĐOẠN NÀY LÀ SHEET ID]/edit#gid=0
```

### 3.2 Chọn người để mạo danh

Uỷ quyền toàn miền hoạt động bằng cách service account "đóng vai" một người thật
trong công ty. Cần một email `@ctyhp.vn` **mở được tất cả thư mục ảnh** — cứ lấy
người đang phụ trách kho ảnh là chắc nhất. Hệ thống chỉ đọc dưới danh nghĩa người
này, không gửi mail, không sửa file của họ.

### 3.3 Thêm biến môi trường trên Vercel

Vercel → project **product-catalog-management** → *Settings → Environment
Variables*. Thêm cho **cả Production và Preview**:

| Biến | Giá trị | Kiểu |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `catalogue-web@....iam.gserviceaccount.com` | Config |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | nội dung `private_key` trong file JSON (xem 3.4) | **Secret** |
| `GOOGLE_IMPERSONATE_EMAIL` | email người thật chọn ở 3.2 | Config |
| `CATALOGUE_SHEET_ID` | Sheet ID lấy ở 3.1 | Config |

`CATALOGUE_SHEET_TAB` đã có sẵn giá trị `test` — giữ nguyên, trừ khi đổi sang tab
khác.

### 3.4 Chép khoá PEM cho đúng

Mở file JSON bằng Notepad, tìm dòng `"private_key"`:

```
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADAN...\n-----END PRIVATE KEY-----\n",
```

Chép **nguyên đoạn nằm giữa hai dấu nháy kép**, kể cả các ký tự `\n` — chép cả dãy
dài trên một dòng, đừng bấm Enter chỗ nào. Bỏ hai dấu nháy kép ở đầu và cuối.

Đây là chỗ hay sai nhất. Nếu khoá bị xuống dòng thật thay vì `\n`, hệ thống sẽ báo
không lấy được access token.

### 3.5 Xoá hai biến dữ liệu mẫu — **quan trọng**

Vẫn trong màn hình Environment Variables, **xoá hẳn** hai biến:

- `CATALOGUE_TEP_MAU`
- `CATALOGUE_TEP_ANH_MAU`

Còn hai biến này thì hệ thống vẫn đọc dữ liệu mẫu và bỏ qua Google — thêm bao nhiêu
biến ở 3.3 cũng không có tác dụng. Đây là công tắc thật sự.

### 3.6 Deploy lại

Vercel → *Deployments* → deploy mới nhất → *Redeploy*. Biến môi trường chỉ có hiệu
lực với lần build sau khi thêm.

---

## Kiểm tra đã chạy chưa

Trên máy, điền y hệt các biến trên vào `.env.local` rồi chạy:

```bash
npm run kiem-tra:google
```

Lệnh này đi qua 5 chặng và dừng ngay ở chặng đầu tiên hỏng, kèm việc cụ thể phải
làm. Năm chặng hỏng theo năm cách khác hẳn nhau và rất dễ đọc nhầm thành nhau:

| Chặng | Hỏng nghĩa là |
|---|---|
| 1. Cấu hình | thiếu biến, hoặc còn giá trị giả `CHUA_CO_...` |
| 2. Lấy access token | khoá PEM sai định dạng, hoặc chưa uỷ quyền client ID ở phần 2 |
| 3. Đọc bảng tính | chưa chia sẻ bảng tính cho service account (bước 3.1) |
| 4. Liệt kê thư mục ảnh | **thư mục trả về rỗng** — thiếu `GOOGLE_IMPERSONATE_EMAIL`, hoặc người được mạo danh không mở được thư mục |
| 5. Tải một ảnh | cả ảnh gốc lẫn ảnh thu nhỏ đều không lấy được |

Chạy hết 5 chặng không hỏng chặng nào là xong.

Sau đó mở web và kiểm bằng mắt: sửa một ô trên bảng tính, đợi khoảng một phút rồi
tải lại trang catalogue — giá trị mới phải hiện ra.

---

## Vài điều đã xử lý sẵn, không cần lo

- **Quyền Người xem là đủ.** Nhiều thư mục bật `restrictedForReaders` khiến người
  xem không tải được file gốc. Hệ thống hỏi trước xem có tải được bản gốc không,
  không được thì lấy bản thu nhỏ 1600px. Không cần nhờ IT gỡ hạn chế đó.
- **Ảnh được lưu đệm.** Ảnh tải về được thu nhỏ và cất vào Supabase Storage, lần sau
  không gọi lại Google. Không lo vượt hạn mức API.
- **Bảng tính đệm 60 giây, thư mục ảnh đệm 10 phút.** Sửa xong đợi một chút mới thấy
  là bình thường, không phải lỗi.
- **Cột FOLDER HÌNH nhận cả hai kiểu**: dán link thường và chip Drive (kiểu bấm vào
  hiện tên thư mục) đều đọc được.
