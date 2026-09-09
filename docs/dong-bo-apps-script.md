# Đẩy dữ liệu từ Google lên web bằng Apps Script

**Hiện tại**: web chạy bằng một bản chụp dữ liệu lấy tay. Sửa bảng tính không lên
web, thêm ảnh vào Drive cũng không lên web.

**Sau khi làm xong**: sửa bảng tính → **dưới một phút** sau web đổi theo. Bỏ ảnh mới
vào thư mục Drive → chậm nhất một tiếng sau web thấy. Không ai phải bấm gì.

## Vì sao lại là Apps Script

Hai đường thông thường đều bị chặn ở công ty này:

| Đường | Vì sao không đi được |
|---|---|
| Mời tài khoản máy vào Shared Drive | Chính sách Workspace của CTYHP cấm chia sẻ tệp ra ngoài tên miền. Google trả về đúng chữ: *"Policy set by the administrators of CTYHP prohibits the sharing of items with … because it is not a Google Account in a compatible allowlisted domain."* |
| Uỷ quyền toàn miền (domain-wide delegation) | Phải vào admin.google.com, mà anh không có quyền đó. |

Apps Script không vướng cả hai: nó chạy **bên trong** Google với tư cách chính
tài khoản của anh, và chỉ **gọi ra ngoài**. Không có tệp nào bị chia sẻ ra ngoài
tên miền cả.

Còn một điểm được thêm, không phải đánh đổi: **Vercel không giữ thông tin đăng
nhập Google nào**. Nếu web có bị lộ thì kẻ tấn công vẫn không chạm được vào Drive
công ty. Hai đường kia đều phải để một khoá riêng tư nằm trên Vercel.

---

## Cách nó chạy

```
Apps Script (chạy trong Google)
   │  mỗi PHÚT   — đọc bảng tính Catalogue-OL, kèm chip Drive   (~2 giây)
   │  mỗi GIỜ    — thêm bước liệt kê ảnh trong ~65 thư mục      (~36 giây)
   │  mỗi 10 PHÚT— bù ảnh còn thiếu vào bộ đệm
   ▼
POST hpcatalogue.app/api/dong-bo/…   ─ kèm khoá bí mật
   ▼
Supabase Storage:  dong-bo/bang.json
                   dong-bo/anh-thu-muc.json
                   dong-bo/trang-thai.json
                   sheet-cache/<id>-600.webp, <id>-1400.webp
   ▼
Web đọc từ đây. Không gọi Google lần nào nữa.
```

Bốn cổng nhận:

| Cổng | Việc |
|---|---|
| `POST /api/dong-bo/thu-muc` | Nhận bảng thô, trả về ID các thư mục ảnh cần liệt kê. Không ghi gì. |
| `POST /api/dong-bo/du-lieu` | Nhận bảng thô, lưu lại. Kèm `anhThuMuc` thì lưu cả danh sách ảnh; không kèm thì giữ nguyên danh sách cũ. |
| `POST /api/dong-bo/thieu-anh` | Trả về những ảnh chưa có trong bộ đệm, ảnh đại diện xếp trước. |
| `POST /api/dong-bo/anh` | Nhận ảnh, thu nhỏ thành 600px và 1400px, cất vào bộ đệm. |

Cả bốn đều đòi khoá bí mật trong header `Authorization`. **Không khai biến
`DONG_BO_SECRET` thì cả bốn TẮT hẳn** — trả về 503, không bao giờ được hiểu
"thiếu khoá" thành "không cần khoá".

Tại sao cổng `thu-muc` tồn tại thay vì để script tự tìm cột: tên cột của bảng
tính đã đổi hai lần trong một tháng (`FOLDER HÌNH` → `Hình raw - lưu mẫu`, và
`LOẠI`/`DÒNG` tráo chỗ cho nhau). Chỉ có mã web mới biết những tên nào còn được
chấp nhận. Cho script tự đoán là bảo đảm có ngày hai bên lệch nhau — mà lệch kiểu
đó **không báo lỗi**, chỉ im lặng mất thư viện ảnh của vài chục mẫu.

---

## Cài đặt

### Bước 1 — Tạo khoá bí mật

Chạy trên máy anh:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Copy chuỗi in ra. Nó sẽ được dán vào **hai chỗ** ở bước 2 và bước 3, phải giống
hệt nhau từng ký tự.

### Bước 2 — Khai báo trên Vercel

Vào <https://vercel.com> → project catalogue → **Settings** → **Environment
Variables**. Thêm ba biến, cả ba đều tick **Production** và **Preview**:

| Tên | Giá trị |
|---|---|
| `DONG_BO_SECRET` | chuỗi vừa tạo ở bước 1 |
| `CATALOGUE_TEP_MAU` | `storage:dong-bo/bang.json` |
| `CATALOGUE_TEP_ANH_MAU` | `storage:dong-bo/anh-thu-muc.json` |

Xong bấm **Redeploy** (Deployments → dấu ba chấm ở bản mới nhất → Redeploy).
Biến môi trường chỉ có hiệu lực từ lần deploy sau.

Trước khi Apps Script đẩy lần đầu, trang catalogue sẽ ghi *"Đang chờ Apps Script
đẩy bảng tính lên lần đầu"*. Đó là đúng, không phải lỗi.

### Bước 3 — Dựng script trong Google

1. Mở <https://script.google.com> → **New project**
2. Xoá hết nội dung trong `Code.gs`, dán toàn bộ tệp
   [`google-apps-script/DongBo.gs`](../google-apps-script/DongBo.gs) vào
3. Bấm biểu tượng bánh răng **Project Settings** ở cột trái → kéo xuống
   **Script Properties** → **Add script property**, thêm bốn dòng:

   | Property | Value |
   |---|---|
   | `URL_WEB` | `https://hpcatalogue.app` |
   | `KHOA` | chuỗi bí mật ở bước 1 |
   | `SHEET_ID` | ID bảng tính — đoạn giữa `/d/` và `/edit` trên thanh địa chỉ |
   | `TAB` | `Catalogue-OL` |

   Khoá bí mật để ở đây chứ **không để trong mã nguồn**: mã nguồn thì bị chia sẻ,
   sao chép, dán vào chat.

4. Cột trái, mục **Services** → bấm dấu **+** → chọn **Google Sheets API** →
   **Add**. Bấm **+** lần nữa → **Drive API** → **Add**.

   **Bắt buộc**, và đây là chỗ dễ vấp nhất. Script gọi Sheets/Drive qua REST,
   mà REST thì đòi API phải được bật trong **dự án Cloud ẩn** Apps Script tự tạo
   cho mỗi project. `SpreadsheetApp` và `DriveApp` vẫn chạy bình thường nên rất
   dễ tưởng là đã đủ quyền — rồi đúng phát 403 *"Google Sheets API has not been
   used in project … before or it is disabled."* Thêm Service ở đây chính là cái
   công tắc đó.

   Phải thêm **cả hai**: thiếu Drive API thì script chạy qua được bước đọc bảng
   tính rồi mới chết ở bước tải ảnh, với đúng lỗi 403 y hệt.

5. Quay lại `Code.gs`, chọn hàm **`chayThuMotLan`** trong ô thả xuống rồi bấm
   **Run**. Google sẽ hỏi cấp quyền — bấm qua **Advanced** → **Go to … (unsafe)**
   → **Allow**. (Chữ "unsafe" là vì script chưa qua kiểm duyệt của Google, không
   phải vì nó nguy hiểm — anh vừa tự viết ra nó.)
6. Xem tab **Execution log**. Đúng thì thấy đại ý:

   ```
   Bang tinh: ONLINE CATALOGUE
   Doc duoc 73 dong tho.
   Can liet ke 65 thu muc anh.
   DA DAY: 71 dong, 65 thu muc, 1360 anh
   Thieu 1360/1360 anh; luot nay lam toi 400 tam.
   DA DAY ANH: 168 tam, 0 tam hong, con lai ~1192.
   ```

7. Chọn hàm **`datLichChay`** rồi bấm **Run** một lần. Từ đây nó tự chạy. Kiểm
   bằng ⏰ **Triggers**, phải thấy đúng **ba** dòng:

   | Function | Nhịp | Việc |
   |---|---|---|
   | `dongBoBang` | mỗi phút | chỉ bảng tính — thứ người dùng sửa và chờ thấy |
   | `dongBoDuLieu` | mỗi giờ | đầy đủ, kèm liệt kê thư mục Drive |
   | `dongBoAnh` | mỗi 10 phút | bù ảnh vào bộ đệm |

### Bước 4 — Đợi ảnh đuổi kịp

Lần đầu có khoảng 1.360 ảnh. Mỗi lượt chạy Apps Script chỉ được vài phút nên nó
làm được vài trăm tấm một lượt — **khoảng một đến hai tiếng là xong**. Trong lúc
đó web vẫn dùng được: ảnh đại diện của từng dòng được đẩy **trước** (khoảng 71
tấm, xong trong vài phút), nên lưới catalogue đầy đủ gần như ngay lập tức; thứ
còn thiếu là thư viện ảnh trong trang chi tiết.

Từ lần sau chỉ còn ảnh mới, mỗi lượt vài giây.

---

## Kiểm tra và xử lý sự cố

**Xem lần đồng bộ gần nhất**: mở <https://hpcatalogue.app/admin/catalogue-sheet>,
dòng chữ nhỏ dưới tiêu đề ghi *"Bản chụp bảng tính, Apps Script đẩy lên lúc
10:20 08/09/2026"*.

**Xem nhật ký script**: script.google.com → mở project → cột trái chọn
**Executions**. Mỗi lượt chạy một dòng, bấm vào để xem log.

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `403 … API has not been used in project …` | Chưa thêm Advanced Service | Làm bước 3.4 — thêm cả **Google Sheets API** và **Drive API** trong mục Services |
| `tra ve 503: {"loi":"chua_bat"}` | Vercel chưa có `DONG_BO_SECRET`, hoặc đã thêm mà chưa redeploy | Làm lại bước 2, nhớ Redeploy |
| `tra ve 401` | Khoá trong Script Properties khác khoá trên Vercel | So lại từng ký tự, coi chừng khoảng trắng thừa hai đầu |
| `tra ve 422: {"loi":"bang_rong"}` | Sai tên tab, hoặc tab thật sự không còn dòng nào | Kiểm tra Script Property `TAB` |
| `tra ve 422: {"loi":"bang_khong_doc_duoc"}` | Bảng tính vừa đổi tên cột bắt buộc | Xem `chiTiet` trong log — nó ghi rõ thiếu cột nào. Đổi tên cột về như cũ, hoặc báo để thêm tên mới vào `catalogue.mapper.ts` |
| `Khong liet ke duoc thu muc <id>` | Thư mục bị xoá hoặc đổi quyền | Không sao, 64 thư mục kia vẫn lên. Sửa link trong bảng tính khi rảnh |
| `X tam hong` | Ảnh hỏng, hoặc Drive không cấp thumbnail | Xem tên tệp trong log |

**Ngưng đồng bộ**: chạy hàm `ngungLichChay`.

**Chạy lại ngay không chờ lịch**: `dongBoBang` (chỉ bảng tính, 2 giây) hoặc
`chayThuMotLan` (đầy đủ, kèm ảnh).

**Đổi tần suất**: sửa trong hàm `datLichChay` rồi chạy lại hàm đó. Nó luôn xoá
hết lịch cũ trước khi đặt lại, nên chạy bao nhiêu lần cũng được — lịch chồng nhau
trên Apps Script là cách dễ nhất để đốt hết hạn mức gọi ra ngoài trong một buổi.

---

## Những chỗ cố ý làm như vậy

**Ảnh lấy bản thumbnail 1600px chứ không lấy bản gốc.** Hai Shared Drive chứa ảnh
sản phẩm đặt `downloadRestriction`, cơ đó chặn tải bản gốc nhưng không chặn
thumbnail. Và web chỉ hiển thị tối đa 1400px, nên gửi bản gốc vài MB là tốn băng
thông mà không thêm một điểm nét nào.

**Bảng rỗng bị từ chối chứ không được ghi đè.** Một bảng không còn dòng nào gần
như chắc chắn là lỗi phía script (đọc nhầm tab, quyền bị thu hồi) chứ không phải
công ty vừa xoá hết hàng. Ghi đè là mất sạch catalogue đang chạy.

**Bảng thô đi qua đúng bộ đọc của đường thật trước khi được lưu.** Nếu bảng tính
đổi tên cột và làm hỏng bộ đọc thì phải hỏng **ngay lúc script đẩy lên**, lúc còn
người đang nhìn — chứ không phải lặng lẽ ghi đè lên bản tốt rồi làm trang khách vỡ
vào sáng hôm sau.

**Một ảnh hỏng không làm hỏng cả lô.** Script gửi theo lô sáu tấm; nếu một tấm
hỏng làm cả yêu cầu thất bại thì năm tấm kia phải tải lại từ đầu ở lượt sau — và
có thể hỏng mãi mãi.

**Bảng tính và thư mục Drive đi hai nhịp khác nhau.** Phần đắt tiền của một lượt
đồng bộ là liệt kê 65 thư mục Drive — 36 giây, so với 2 giây để đọc bảng tính. Gộp
chung thì không thể chạy mỗi phút: 36 giây mỗi phút là ăn hết hạn mức chạy của cả
ngày trước giờ ăn trưa. Mà thư mục thì hiếm khi đổi, còn bảng tính thì đổi suốt.

**Bảng không đổi thì không ghi lại.** Chạy mỗi phút là 1.440 lượt một ngày, mà bảng
tính thì cả ngày không ai động tới. Cổng `du-lieu` giữ một vân tay (sha256) của bảng
trong `trang-thai.json` và bỏ qua việc ghi đè tệp 110 KB y hệt bản cũ. **Nhưng mốc
thời gian vẫn cập nhật** — người dùng đọc dòng đó để biết đồng bộ *còn sống*, và một
mốc đứng im vì "không có gì mới" trông y hệt một mốc đứng im vì script hỏng.

**Mỗi gói tin tối đa 6 ảnh.** Vercel chặn thân yêu cầu ở 4,5 MB và base64 làm
phình ảnh thêm một phần ba. Đổi con số này thì phải đổi ở **cả hai nơi**:
`SO_ANH_MOI_LAN` trong `DongBo.gs` và trong `src/app/api/dong-bo/anh/route.ts`.
