# PRD — Hệ thống Quản lý Catalogue & Tạo Báo giá Trực tuyến

| | |
|---|---|
| **Mã tài liệu** | PRD-CQS-001 |
| **Phiên bản** | 1.0 |
| **Ngày** | 2026-08-28 |
| **Trạng thái** | Chờ duyệt |
| **Tên mã dự án** | Catalogue Quote System (CQS) |

---

## 1. Tổng quan

### 1.1 Bối cảnh

Ảnh sản phẩm của công ty hiện nằm rải rác trên Google Drive, máy cá nhân của từng nhân viên và các nhóm chat. Khi cần báo giá cho khách, nhân viên kinh doanh phải tự tay tìm ảnh, tải về, ghép vào Word/PowerPoint, chỉnh sửa trình bày, xuất PDF rồi gửi qua email hoặc Zalo.

Cách làm này gây ra bốn vấn đề:

1. **Chậm** — mỗi bản báo giá tốn 30–90 phút, phần lớn là thao tác thủ công lặp lại.
2. **Không đồng nhất** — mỗi nhân viên trình bày một kiểu, ảnh hưởng hình ảnh thương hiệu.
3. **Mù thông tin** — gửi file đi rồi không biết khách đã mở xem hay chưa.
4. **Dữ liệu phân mảnh** — không có nguồn ảnh và giá chuẩn duy nhất, dễ báo sai giá hoặc gửi nhầm ảnh cũ.

### 1.2 Mục tiêu sản phẩm

Xây dựng ứng dụng web nội bộ giải quyết trọn vẹn chuỗi: **nạp dữ liệu → quản lý kho → tạo báo giá → gửi link cho khách**.

Ba năng lực cốt lõi:

1. **Kho catalogue tập trung** — nạp hàng loạt ảnh + thông tin sản phẩm từ Google Drive (ảnh đi kèm file Google Sheet), hoặc upload trực tiếp.
2. **Tạo báo giá bằng cách chọn** — nhân viên chọn sản phẩm, chọn phong cách trình bày, điều chỉnh giá, bấm một nút.
3. **Link chia sẻ** — hệ thống sinh đường link; khách bấm vào là xem được trang catalogue báo giá trình bày đẹp, đọc tốt trên cả máy tính và điện thoại.

### 1.3 Chỉ số thành công

| Chỉ số | Hiện tại | Mục tiêu sau 3 tháng |
|---|---|---|
| Thời gian tạo một bản báo giá | 30–90 phút | Dưới 5 phút |
| Tỉ lệ báo giá được gửi qua hệ thống | 0% | Trên 80% |
| Số sản phẩm được số hoá vào kho | 0 | Toàn bộ catalogue đang bán |
| Tỉ lệ báo giá biết được khách đã xem | 0% | 100% |
| Tỉ lệ báo giá sai giá do dùng dữ liệu cũ | Chưa đo | Dưới 1% |

### 1.4 Ngoài phạm vi phiên bản 1 (Non-goals)

Những hạng mục sau **có chủ đích không làm** ở v1, để giữ phạm vi đủ nhỏ cho một lần triển khai:

- **Khách hàng tương tác trên link** — không cho khách tick chọn sản phẩm, nhập số lượng, đặt hàng hay bình luận. Link chỉ để xem.
- **Multi-tenant / bán cho công ty khác** — hệ thống phục vụ đúng một doanh nghiệp.
- **AI sinh lại ảnh sản phẩm** — không dùng AI để tạo ảnh mới, thay nền hay dựng bối cảnh. Ảnh khách thấy là ảnh thật đã chụp.
- **Quản lý tồn kho, đơn hàng, công nợ, thanh toán** — hệ thống dừng ở bước báo giá.
- **Ứng dụng di động native** — chỉ web, nhưng giao diện phải dùng tốt trên trình duyệt di động.
- **Chỉnh sửa ảnh trong hệ thống** — không có công cụ cắt/xoay/chỉnh màu. Ảnh phải đúng ngay từ lúc nạp vào.

---

## 2. Người dùng và vai trò

| Vai trò | Là ai | Làm gì trong hệ thống |
|---|---|---|
| **Admin** | Quản lý kinh doanh / phụ trách marketing | Toàn quyền: nạp dữ liệu, sửa catalogue, tạo và duyệt template, quản lý tài khoản, xem toàn bộ báo giá |
| **Sale** | Nhân viên kinh doanh | Xem catalogue, tạo báo giá của mình, sinh link, xem thống kê lượt xem báo giá của mình. **Không** sửa được catalogue gốc, **không** tạo/duyệt được template |
| **Khách hàng** | Người nhận báo giá | Không có tài khoản. Mở link công khai để xem trang báo giá |

**Quy mô dự kiến:** 10–30 tài khoản nội bộ, dưới 50.000 ảnh, dưới 10.000 sản phẩm.

---

## 3. Luồng nghiệp vụ tổng thể

```
┌──────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1 — NẠP DỮ LIỆU (Admin, làm định kỳ)                   │
│                                                                  │
│  Google Drive folder          Upload trực tiếp                   │
│  ├─ anh-sp/*.jpg       hoặc   ├─ kéo thả nhiều ảnh               │
│  └─ danh-muc.xlsx             └─ điền thông tin                  │
│           │                            │                         │
│           └──────────┬─────────────────┘                         │
│                      ▼                                           │
│           Màn hình ĐỐI SOÁT (xem trước, sửa lỗi khớp)            │
│                      │                                           │
│                      ▼                                           │
│              KHO CATALOGUE (sản phẩm + ảnh + giá + danh mục)     │
└──────────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────┼───────────────────────────────────────────┐
│ GIAI ĐOẠN 2 — TẠO PHONG CÁCH (Admin, làm 1 lần cho mỗi style)    │
│                      │                                           │
│  Admin mô tả phong cách bằng lời                                 │
│         → gọi API sinh HTML+CSS có slot dữ liệu                  │
│         → xem thử với dữ liệu mẫu → chỉnh → DUYỆT                │
│         → lưu thành TEMPLATE tái dùng vĩnh viễn                  │
└──────────────────────┼───────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────┐
│ GIAI ĐOẠN 3 — BÁO GIÁ (Sale, hằng ngày — dưới 5 phút)            │
│                                                                  │
│  Chọn sản phẩm  →  Nhập thông tin khách  →  Chỉnh giá riêng      │
│         →  Chọn template  →  Xem trước  →  [XUẤT BẢN]            │
│                              │                                   │
│                              ▼                                   │
│              https://bao-gia.congty.vn/q/a7f3k9                  │
└──────────────────────┼───────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────┐
│ GIAI ĐOẠN 4 — KHÁCH XEM                                          │
│  Mở link → trang catalogue báo giá (responsive) → ghi nhận lượt  │
│  xem → Sale nhận thông báo "khách đã mở"                         │
└──────────────────────────────────────────────────────────────────┘
```

**Điểm mấu chốt của thiết kế:** Giai đoạn 2 (gọi API) tách hẳn khỏi Giai đoạn 3 (bán hàng). API chỉ được gọi khi admin muốn tạo phong cách mới — không gọi mỗi lần báo giá. Nhờ vậy thao tác báo giá hằng ngày diễn ra tức thì, không tốn phí, và kết quả hoàn toàn đoán trước được.

---

## 4. Yêu cầu chức năng

Ký hiệu mức ưu tiên: **P0** = bắt buộc có ở v1 · **P1** = nên có ở v1 · **P2** = để dành v2.

### Module A — Nạp dữ liệu (Ingest)

#### A1. Upload ảnh trực tiếp · P0

Người dùng kéo thả hoặc chọn nhiều file ảnh cùng lúc.

- Định dạng chấp nhận: JPG, PNG, WebP, HEIC. Dung lượng tối đa 20 MB/ảnh, tối đa 200 ảnh/lần.
- Hiện thanh tiến trình từng file; một file lỗi không làm hỏng cả lô.
- Sau khi upload, chuyển thẳng sang màn hình gán thông tin (A4).

**Tiêu chí nghiệm thu:** Upload 100 ảnh JPG 5 MB hoàn tất dưới 3 phút trên đường truyền 20 Mbps; nếu 3 file lỗi thì 97 file còn lại vẫn vào kho và hệ thống liệt kê rõ 3 file lỗi kèm lý do.

#### A2. Kết nối và đồng bộ Google Drive · P0

- Admin đăng nhập Google (OAuth 2.0, scope `drive.readonly`) và dán link folder Drive.
- Hệ thống quét folder: lấy tất cả file ảnh và **file Google Sheet / Excel đầu tiên** tìm thấy làm nguồn thông tin.
- Quét đệ quy vào folder con; tên folder con được đề xuất làm danh mục.
- Đồng bộ chạy nền, có trang theo dõi tiến trình (đang xử lý / xong / lỗi).
- Nút **"Đồng bộ lại"** để cập nhật khi Drive có thay đổi. Ảnh đã có (khớp theo Drive file ID) sẽ được cập nhật chứ không tạo bản trùng.

**Tiêu chí nghiệm thu:** Với folder Drive chứa 500 ảnh và 1 Sheet 500 dòng, một lần đồng bộ hoàn tất dưới 10 phút và tạo đúng 500 sản phẩm; chạy lại lần hai không tạo thêm bản ghi trùng.

#### A3. Đối soát Sheet ↔ ảnh · P0

Đây là bước quyết định chất lượng dữ liệu, nên phải có màn hình xem trước trước khi ghi vào kho.

**Cấu trúc Sheet chuẩn** (hệ thống tự nhận cột theo tên tiêu đề, không phụ thuộc thứ tự):

| Cột | Bắt buộc | Ghi chú |
|---|---|---|
| `ten_file_anh` | ✅ | Tên file ảnh trong Drive, ví dụ `SP001.jpg`. Nhiều ảnh cho một SP thì ngăn cách bằng dấu `;` |
| `ma_sp` | ✅ | Mã sản phẩm, phải duy nhất |
| `ten_sp` | ✅ | Tên hiển thị |
| `gia` | | Giá niêm yết, số nguyên. Trống = chưa có giá |
| `danh_muc` | | Đường dẫn danh mục, ví dụ `Nội thất > Ghế > Ghế gỗ` |
| `mo_ta` | | Mô tả ngắn |
| `thuoc_tinh` | | Cặp `khoá=giá trị` ngăn bằng `;`, ví dụ `Chất liệu=Gỗ sồi;Màu=Nâu` |

- Hệ thống cho phép **ánh xạ lại tên cột** nếu Sheet của công ty đặt tên khác.
- Màn hình đối soát hiển thị: số dòng khớp ảnh, số dòng thiếu ảnh, số ảnh thừa không có trong Sheet, số mã SP bị trùng.
- Người dùng sửa được trực tiếp trên màn hình đối soát trước khi bấm **"Xác nhận nhập"**.
- Dòng lỗi không chặn dòng đúng — nhập được phần đúng, phần lỗi tải về file Excel để sửa rồi nhập lại.

**Tiêu chí nghiệm thu:** Sheet 500 dòng trong đó 10 dòng trỏ tới tên ảnh không tồn tại → màn hình đối soát chỉ đúng 10 dòng đó, cho phép nhập 490 dòng còn lại, và xuất được file lỗi gồm đúng 10 dòng.

#### A4. Gán thông tin thủ công hàng loạt · P0

Dành cho ảnh upload trực tiếp hoặc ảnh Drive không có trong Sheet.

- Bảng nhập nhanh dạng lưới (giống Excel): điều hướng bằng Tab/Enter, dán nhiều ô từ clipboard.
- Chọn nhiều dòng → gán chung danh mục / giá / thuộc tính một lần.

#### A5. Xử lý ảnh sau khi nạp · P0

Chạy nền, tự động, không cần thao tác:

- Sinh 3 kích thước: `thumb` 400px, `medium` 1200px, `large` 2000px (giữ nguyên tỉ lệ, cạnh dài nhất).
- Chuyển sang WebP, giữ bản gốc để tải xuống khi cần.
- Đọc và lưu kích thước thật, dung lượng, mã băm nội dung để phát hiện ảnh trùng.
- Xoá metadata EXIF (vị trí GPS, thông tin máy ảnh) trước khi phục vụ ra ngoài.

---

### Module B — Quản lý Catalogue

#### B1. Danh mục nhiều cấp · P0

- Cây danh mục không giới hạn số cấp, kéo thả để sắp xếp lại.
- Xoá danh mục có sản phẩm bên trong: hệ thống hỏi chuyển sản phẩm đi đâu, không xoá ngầm.

#### B2. Sản phẩm · P0

Mỗi sản phẩm gồm: mã SP (duy nhất), tên, mô tả, giá niêm yết, đơn vị tiền tệ, danh mục, danh sách ảnh, thuộc tính tự do (JSON), trạng thái (`đang bán` / `ngừng bán` / `nháp`).

- Sản phẩm `ngừng bán` không hiện trong màn hình chọn để báo giá, nhưng báo giá cũ đã gửi vẫn giữ nguyên nội dung.

#### B3. Ảnh sản phẩm · P0

- Một sản phẩm có nhiều ảnh; sắp xếp bằng kéo thả; một ảnh được đánh dấu **ảnh đại diện**.
- Ảnh đại diện là ảnh mặc định dùng khi đưa vào báo giá; sale đổi được sang ảnh khác khi tạo báo giá.

#### B4. Tìm kiếm và lọc · P0

- Ô tìm kiếm chung: khớp mã SP, tên, mô tả. **Hỗ trợ tiếng Việt không dấu** — gõ `ghe go soi` tìm ra `Ghế gỗ sồi`.
- Bộ lọc: danh mục, khoảng giá, trạng thái, có/không có ảnh, ngày nạp.
- Hiển thị dạng lưới ảnh (mặc định) hoặc dạng bảng.

**Tiêu chí nghiệm thu:** Với 10.000 sản phẩm, kết quả tìm kiếm trả về dưới 500 ms.

#### B5. Thao tác hàng loạt · P1

Chọn nhiều sản phẩm → đổi danh mục, đổi trạng thái, tăng/giảm giá theo phần trăm, xoá.

#### B6. Phát hiện ảnh trùng · P1

Khi nạp, nếu mã băm nội dung ảnh trùng với ảnh đã có, hệ thống cảnh báo và cho chọn: bỏ qua, thay thế, hay vẫn giữ cả hai.

---

### Module C — Template Studio (sinh HTML + CSS bằng API)

Đây là phần lõi kỹ thuật của hệ thống. Nguyên tắc nền tảng:

> **API được gọi để tạo ra TEMPLATE, không phải để tạo ra từng bản báo giá.**

Template là một bộ HTML + CSS chứa các **slot dữ liệu**. Sinh một lần, admin duyệt, rồi tái dùng cho hàng trăm bản báo giá. Lúc báo giá chỉ đổ dữ liệu vào slot — thao tác thuần cục bộ, dưới 100 ms, không tốn phí, kết quả giống hệt nhau mỗi lần.

#### C1. Sinh template bằng mô tả · P0

Admin vào **Template Studio → Tạo phong cách mới**, và cung cấp:

- **Mô tả phong cách bằng lời** — ví dụ: *"Sang trọng, nền trắng ngà, chữ serif, ảnh lớn tràn viền, mỗi hàng 2 sản phẩm, tông nhấn màu vàng đồng."*
- **Bố cục** — chọn: lưới 2 cột / lưới 3 cột / danh sách một cột / xen kẽ trái-phải.
- **Bộ nhận diện** — logo, màu chủ đạo, màu nhấn, phông chữ (lấy sẵn từ cấu hình thương hiệu ở G2, sửa được cho riêng template này).
- **Có hiện giá hay không**, có hiện mã SP hay không, có hiện bảng tổng cộng hay không.

Hệ thống ghép các thông tin trên vào một prompt hệ thống cố định (chứa hợp đồng slot ở C2 và các ràng buộc ở C4), gọi API, nhận về HTML + CSS.

- **Model mặc định:** `claude-opus-5` — chọn tầng cao nhất vì chất lượng thẩm mỹ của HTML/CSS sinh ra là mục tiêu chính, và số lần gọi rất ít nên chi phí không đáng kể.
- **Chi phí thực tế:** 5 USD cho mỗi triệu token đầu vào và 25 USD cho mỗi triệu token đầu ra. Một biến thể tốn khoảng 3.000 token vào và 8.000 token ra, tức 0,22 USD; vì mỗi lần yêu cầu sinh 3 biến thể nên **một lần tạo phong cách tốn khoảng 0,66 USD**. Tổng chi phí API cho cả vòng đời hệ thống dự kiến dưới 30 USD.
- Dùng streaming để hiển thị tiến trình, tránh timeout.
- Sinh **3 biến thể song song** cho mỗi lần yêu cầu, để admin có cái so sánh và chọn — đây là cơ chế chính đảm bảo "đẹp nhất": chọn lọc từ nhiều phương án thay vì chấp nhận phương án đầu tiên.

#### C2. Hợp đồng slot dữ liệu · P0

Đây là giao kèo bắt buộc giữa template và hệ thống. Template do API sinh ra **phải** tiêu thụ đúng cấu trúc dữ liệu sau, không được tự đặt tên khác:

```
quote.title              — tiêu đề báo giá
quote.code               — mã báo giá
quote.date               — ngày lập
quote.valid_until        — hiệu lực đến ngày
quote.notes              — ghi chú chung
quote.currency           — đơn vị tiền tệ
quote.subtotal           — tổng trước thuế/giảm giá
quote.discount           — giảm giá
quote.total              — tổng cộng
quote.show_price         — true/false, có hiện giá không

customer.name            — tên người liên hệ
customer.company         — tên công ty
customer.phone
customer.email

brand.logo_url
brand.company_name
brand.address
brand.phone
brand.website

items[]                  — danh sách sản phẩm, lặp qua bằng {{#each items}}
  .index                 — số thứ tự, bắt đầu từ 1
  .sku
  .name
  .description
  .image_url             — ảnh khổ medium (1200px)
  .image_large_url
  .attributes[]          — cặp {label, value}
  .quantity
  .unit_price_formatted  — chuỗi đã định dạng, ví dụ "2.500.000 ₫"
  .line_total_formatted
```

**Cú pháp slot:** kiểu Mustache — `{{quote.title}}`, `{{#each items}}...{{/each}}`, `{{#if quote.show_price}}...{{/if}}`. Chọn cú pháp này vì nó **không có khả năng thực thi mã** (logic-less), khác với các engine cho phép gọi hàm tuỳ ý.

Mọi giá trị đều được **escape HTML tự động** khi đổ vào slot. Không có cơ chế đổ HTML thô.

#### C3. Xem trước, chỉnh sửa và duyệt · P0

- Sau khi sinh, hệ thống render ngay template với **bộ dữ liệu mẫu** (6 sản phẩm giả lập, có ảnh thật) trong khung xem trước.
- Xem trước ở ba khổ: **máy tính · máy tính bảng · điện thoại**. Template không đạt ở khổ điện thoại thì không được duyệt.
- Admin sửa trực tiếp HTML/CSS trong trình soạn thảo có tô màu cú pháp, hoặc **yêu cầu API chỉnh sửa tiếp** bằng lời (*"làm ảnh to hơn, giảm khoảng cách giữa các hàng"*) — lần gọi này gửi kèm HTML hiện tại để sửa, không sinh lại từ đầu.
- Chỉ template ở trạng thái **`đã duyệt`** mới xuất hiện trong danh sách chọn của sale.

#### C4. Kiểm định tự động trước khi duyệt · P0

Mọi template — dù do API sinh hay admin tự sửa — phải qua bộ kiểm tra tự động, **không vượt qua thì không cho duyệt**:

| Kiểm tra | Yêu cầu |
|---|---|
| Thẻ cấm | Không có `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<base>`, `<meta http-equiv>` |
| Thuộc tính cấm | Không có `on*` (`onclick`, `onerror`, `onload`…), không có `javascript:` trong `href`/`src` |
| Tài nguyên ngoài | Không có `<link>`, `@import`, `url()` trỏ ra ngoài miền hệ thống. Phông chữ phải nằm trong danh sách cho phép, được tự phục vụ |
| CSS nguy hiểm | Không có `position: fixed` ở phần tử gốc, không có `expression()` |
| Slot bắt buộc | Phải dùng ít nhất `{{#each items}}`, `{{item.image_url}}`, `{{item.name}}` |
| Render thử | Render được với dữ liệu mẫu mà không lỗi cú pháp |
| Ảnh thiếu | Sản phẩm không có ảnh vẫn render được (có ảnh giữ chỗ), không vỡ bố cục |
| Danh sách rỗng | `items` rỗng vẫn render được, không văng lỗi |

#### C5. Quản lý phiên bản template · P1

- Mỗi lần sửa và duyệt lại tạo một phiên bản mới; giữ toàn bộ lịch sử, quay lại phiên bản cũ được.
- **Báo giá đã xuất bản khoá cứng vào phiên bản template tại thời điểm xuất bản.** Sửa template không làm thay đổi diện mạo của báo giá đã gửi cho khách — đây là ràng buộc bắt buộc, vì khách có thể mở lại link bất cứ lúc nào.

#### C6. Bộ template có sẵn · P0

Hệ thống cài đặt kèm **4 template được thiết kế và kiểm định sẵn**, để dùng được ngay từ ngày đầu mà chưa cần gọi API lần nào: `Tối giản` · `Sang trọng` · `Lưới ảnh lớn` · `Bảng giá gọn`.

Việc này cũng đóng vai trò lưới an toàn: nếu API tạm thời không gọi được, hệ thống vẫn hoạt động đầy đủ.

---

### Module D — Tạo báo giá

Mục tiêu vận hành của module này: **từ lúc bắt đầu đến lúc có link, dưới 5 phút.**

#### D1. Chọn sản phẩm · P0

- Từ màn hình catalogue: tick chọn nhiều sản phẩm → **"Đưa vào báo giá"**. Có "giỏ chọn" nổi hiển thị số lượng đang chọn, giữ nguyên khi chuyển trang hoặc đổi bộ lọc.
- Từ trong màn hình báo giá: mở bảng chọn nhanh, tìm kiếm và thêm tiếp.
- Sắp xếp lại thứ tự sản phẩm bằng kéo thả.
- Nếu một sản phẩm có nhiều ảnh, sale chọn ảnh nào sẽ xuất hiện trong báo giá này.

#### D2. Thông tin báo giá · P0

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| Tiêu đề | ✅ | Mặc định `Báo giá <tên khách> — <ngày>` |
| Mã báo giá | ✅ | Tự sinh dạng `BG-2026-0042`, sửa được |
| Tên khách hàng | ✅ | |
| Công ty / điện thoại / email | | Hiển thị nếu template có slot tương ứng |
| Ngày lập | ✅ | Mặc định hôm nay |
| Hiệu lực đến | | Mặc định 30 ngày sau |
| Ghi chú | | Điều khoản, thời gian giao hàng… |
| Template | ✅ | Chọn từ các template đã duyệt |

#### D3. Điều chỉnh giá · P0

Giá trong báo giá là **bản sao độc lập** của giá niêm yết, không phải tham chiếu.

- Khi thêm sản phẩm, hệ thống chép giá niêm yết hiện tại vào dòng báo giá.
- Sale sửa được **đơn giá** và **số lượng** cho từng dòng. Sửa ở đây **không** ảnh hưởng giá trong catalogue.
- Có ô **giảm giá** cho toàn báo giá: số tiền tuyệt đối hoặc phần trăm.
- Hệ thống tự tính thành tiền từng dòng, tổng phụ, giảm giá, tổng cộng.
- Dòng nào bị sửa giá khác giá niêm yết thì hiện dấu hiệu trực quan kèm giá gốc, để sale không sửa nhầm.
- **Hệ quả quan trọng:** giá niêm yết trong catalogue thay đổi về sau **không** làm thay đổi báo giá đã lập. Đây là hành vi đúng — báo giá là một cam kết tại một thời điểm.

#### D4. Xem trước · P0

- Khung xem trước hiển thị đúng những gì khách sẽ thấy, cập nhật ngay khi sửa dữ liệu hoặc đổi template.
- Chuyển nhanh giữa ba khổ máy tính / máy tính bảng / điện thoại.
- Đổi template không mất dữ liệu đã nhập.

#### D5. Trạng thái và xuất bản · P0

Báo giá có bốn trạng thái: `Nháp` → `Đã xuất bản` → (`Hết hạn` | `Đã thu hồi`).

- **Nháp** — chỉ nội bộ thấy, chưa có link.
- **Xuất bản** — sinh link công khai, ghi lại thời điểm, khoá phiên bản template. Sao chép link vào clipboard bằng một nút bấm.
- Sửa báo giá **đã xuất bản** thì nội dung ở link cập nhật ngay. Hệ thống cảnh báo trước khi lưu, vì khách có thể đang xem.
- **Thu hồi** — link ngừng hoạt động, khách thấy trang thông báo lịch sự "báo giá không còn hiệu lực, vui lòng liên hệ người gửi".
- **Hết hạn** — tự động khi quá ngày hiệu lực. Hành vi giống thu hồi.

#### D6. Nhân bản báo giá · P1

Nhân bản một báo giá cũ thành nháp mới — dùng khi báo giá cho khách khác với danh sách sản phẩm tương tự. Đây là đường tắt giúp rút thời gian xuống dưới 1 phút cho các lần báo giá lặp lại.

#### D7. Xuất PDF · P1

Nút **"Tải PDF"** ở phía nội bộ, phục vụ lưu hồ sơ và in. Dùng chính HTML của template với CSS `@media print`, in qua trình duyệt không cần thêm hạ tầng.

Khách hàng **không** có nút này ở v1 (theo phạm vi đã chốt: link chỉ để xem).

---

### Module E — Trang khách xem

#### E1. Trang công khai · P0

- Đường dẫn: `https://<miền>/q/<mã ngẫu nhiên>`. Mã dài 10 ký tự sinh ngẫu nhiên bằng bộ sinh số an toàn mật mã — **không** dùng ID tuần tự, để không ai đoán mò ra báo giá của khách khác.
- Không cần đăng nhập, không cần cài gì.
- Nội dung: đúng như template đã dựng — ảnh sản phẩm, thông tin, giá, tổng cộng, thông tin công ty.
- Ảnh tải theo kiểu trì hoãn (lazy load); bấm vào ảnh mở khung xem lớn.
- Thẻ Open Graph để khi dán link vào Zalo/Messenger/email hiện ảnh và tiêu đề đẹp.
- **Trang phải đọc tốt trên điện thoại** — đây là tiêu chí nghiệm thu bắt buộc, vì phần lớn khách sẽ mở link từ điện thoại.

**Tiêu chí nghiệm thu:** Trên mạng 4G phổ thông, báo giá 20 sản phẩm hiển thị nội dung chính (Largest Contentful Paint) dưới 2,5 giây.

#### E2. Bảo mật link · P1

- Tuỳ chọn đặt **mật khẩu** cho link. Khách nhập mật khẩu mới xem được.
- Tuỳ chọn **ngày hết hạn** riêng cho link, độc lập với hiệu lực báo giá.
- Thẻ `<meta name="robots" content="noindex, nofollow">` trên mọi trang báo giá, để Google không đánh chỉ mục và làm lộ giá cho đối thủ.

#### E3. Nhiều link cho một báo giá · P2

Sinh nhiều link cho cùng một báo giá để phân biệt kênh gửi (Zalo / email / trực tiếp) và biết kênh nào được mở.

---

### Module F — Theo dõi và thống kê

#### F1. Ghi nhận lượt xem · P0

Mỗi lần link được mở, ghi lại: thời điểm, mã băm địa chỉ IP (không lưu IP thô), loại thiết bị, nguồn dẫn.

Trang chi tiết báo giá hiển thị: đã xem hay chưa, lần xem đầu, lần xem gần nhất, tổng số lượt.

#### F2. Thông báo cho sale · P1

Khi khách mở link **lần đầu tiên**, gửi email cho sale tạo báo giá đó. Chỉ báo lần đầu, không báo mọi lượt xem — tránh gây phiền.

#### F3. Bảng điều khiển · P1

- **Sale:** báo giá của tôi, cái nào đã được xem, cái nào sắp hết hạn.
- **Admin:** tổng số báo giá theo tháng, tỉ lệ được xem, sản phẩm được đưa vào báo giá nhiều nhất, template được dùng nhiều nhất.

---

### Module G — Quản trị hệ thống

#### G1. Tài khoản và phân quyền · P0

- Đăng nhập bằng email + mật khẩu, hoặc Google Workspace nếu công ty dùng.
- Hai vai trò: Admin, Sale.
- Admin mời thành viên qua email, vô hiệu hoá tài khoản khi nhân viên nghỉ việc.
- Vô hiệu hoá tài khoản **không** làm hỏng các link báo giá người đó đã gửi.

#### G2. Cấu hình thương hiệu · P0

Một nơi duy nhất khai báo: logo, tên công ty, địa chỉ, điện thoại, website, màu chủ đạo, màu nhấn, phông chữ, đơn vị tiền tệ và cách định dạng số.

Mọi template đều lấy từ đây, nên đổi logo một lần là toàn bộ báo giá mới dùng logo mới.

#### G3. Nhật ký hoạt động · P1

Ghi lại: ai nạp dữ liệu, ai sửa giá sản phẩm, ai xuất bản/thu hồi báo giá, ai duyệt template. Giữ 12 tháng.

---

## 5. Mô hình dữ liệu

Cơ sở dữ liệu PostgreSQL. Các bảng chính:

```
users                    id · email · full_name · role(admin|sale) · is_active
                         · password_hash · created_at

brand_settings           id · company_name · logo_path · address · phone · website
                         · primary_color · accent_color · font_family
                         · currency · number_format

categories               id · name · slug · parent_id -> categories
                         · sort_order · path (materialized, ví dụ "1.4.9")

products                 id · sku(unique) · name · description · list_price
                         · currency · category_id -> categories
                         · attributes(jsonb) · status(active|discontinued|draft)
                         · source(upload|gdrive) · gdrive_file_id
                         · created_by -> users · created_at · updated_at

product_images           id · product_id -> products · storage_key
                         · variants(jsonb: thumb/medium/large keys)
                         · width · height · bytes · content_hash
                         · is_primary · sort_order

import_jobs              id · source(upload|gdrive) · gdrive_folder_id
                         · sheet_file_id · column_mapping(jsonb)
                         · status(pending|running|review|done|failed)
                         · stats(jsonb) · created_by -> users · created_at

import_rows              id · job_id -> import_jobs · row_number · raw_data(jsonb)
                         · matched_image_names(text[])
                         · status(ok|missing_image|duplicate_sku|invalid)
                         · error_message · product_id -> products

templates                id · name · description · style_prompt
                         · layout_kind · status(draft|approved|archived)
                         · current_version_id -> template_versions
                         · thumbnail_key · is_builtin
                         · created_by -> users · created_at

template_versions        id · template_id -> templates · version_number
                         · html_source · css_source
                         · validation_report(jsonb) · generated_by(api|manual)
                         · api_model · api_tokens_in · api_tokens_out
                         · created_by -> users · created_at

quotes                   id · code(unique) · title
                         · status(draft|published|expired|revoked)
                         · customer_name · customer_company
                         · customer_phone · customer_email
                         · issue_date · valid_until · notes
                         · template_version_id -> template_versions   [khoá cứng phiên bản]
                         · show_price · currency
                         · discount_type(amount|percent) · discount_value
                         · subtotal · total
                         · created_by -> users · published_at · created_at

quote_items              id · quote_id -> quotes · sort_order
                         · product_id -> products (nullable, giữ để truy vết)
                         · image_id -> product_images
                         · sku_snapshot · name_snapshot · description_snapshot
                         · attributes_snapshot(jsonb)   [bản chụp tại thời điểm lập]
                         · unit_price · quantity · line_total

quote_links              id · quote_id -> quotes · slug(unique, 10 ký tự ngẫu nhiên)
                         · password_hash(nullable) · expires_at
                         · is_active · label · view_count · created_at

quote_link_views         id · link_id -> quote_links · viewed_at
                         · ip_hash · user_agent · referrer · device_kind

audit_log                id · actor_id -> users · action · entity_type · entity_id
                         · payload(jsonb) · created_at
```

### Hai quyết định quan trọng về dữ liệu

**1. `quote_items` lưu bản chụp (snapshot), không chỉ lưu tham chiếu.**

Các trường `sku_snapshot`, `name_snapshot`, `description_snapshot`, `attributes_snapshot`, `unit_price` chứa bản sao dữ liệu tại thời điểm lập báo giá. Nhờ vậy: đổi tên sản phẩm, đổi giá niêm yết, hay thậm chí xoá sản phẩm khỏi catalogue đều không làm sai lệch báo giá đã gửi cho khách. `product_id` vẫn được giữ để phục vụ thống kê và truy vết, nhưng không dùng để render.

**2. `quotes.template_version_id` trỏ vào *phiên bản*, không trỏ vào *template*.**

Báo giá đã xuất bản luôn render bằng đúng HTML/CSS tại thời điểm xuất bản. Admin chỉnh sửa template về sau không làm thay đổi diện mạo của những báo giá khách đã nhận.

Hai quyết định này cùng phục vụ một nguyên tắc: **một bản báo giá đã gửi đi là bất biến.**

---

## 6. Kiến trúc kỹ thuật

### 6.1 Thành phần

```
   Trình duyệt nhân viên              Trình duyệt khách hàng
     (có đăng nhập)                    (không đăng nhập)
            |                                  |
            v                                  v
   +--------------------------------------------------+
   |              Next.js (App Router)                 |
   |                                                   |
   |  /admin/*    khu vực nội bộ, có xác thực          |
   |  /q/[slug]   trang công khai, render tại máy chủ, |
   |              không kèm mã JS nội bộ               |
   |                                                   |
   |  Route handlers: import · quote · template        |
   +------+----------------+---------------+-----------+
          |                |               |
          v                v               v
   +-------------+  +-------------+  +----------------+
   | PostgreSQL  |  |  Storage    |  |  Job queue     |
   | (Supabase)  |  |  ảnh gốc +  |  |  đồng bộ Drive |
   |             |  |  3 biến thể |  |  + xử lý ảnh   |
   +-------------+  +------+------+  +----------------+
                           |
                           v
                        +-----+
                        | CDN |
                        +-----+

   Dịch vụ ngoài:
     · Google Drive API  - đọc folder ảnh + Sheet (chỉ quyền đọc)
     · Claude API        - sinh HTML+CSS template (chỉ gọi ở Template Studio)
     · Email             - thông báo "khách đã xem" + mời tài khoản
```

### 6.2 Công nghệ đề xuất

| Lớp | Lựa chọn | Lý do |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript | Render tại máy chủ cho trang khách xem: nhanh và không lộ mã nội bộ |
| Giao diện quản trị | Tailwind CSS + shadcn/ui | Dựng nhanh khu vực nội bộ; không liên quan tới CSS của template |
| CSDL và xác thực | Supabase (PostgreSQL + Auth + Storage) | Hạ tầng quản lý sẵn, đúng với quyết định không tự vận hành máy chủ |
| Lưu trữ ảnh | Supabase Storage + CDN | Đủ cho 50.000 ảnh. Đã chốt Supabase thay vì R2 để gom hạ tầng về một nhà cung cấp |
| Xử lý ảnh | `sharp` chạy trong job nền | Nhanh, ổn định, tự chủ |
| Hàng đợi | Bảng job trong PostgreSQL + worker | Đủ cho quy mô này; không cần thêm Redis |
| Đọc Sheet | Google Sheets API và thư viện `xlsx` | Đọc trực tiếp, không cần tải file trung gian |
| Engine template | Handlebars ở chế độ hạn chế (không cho helper tuỳ ý) | Cú pháp logic-less, không thực thi được mã |
| Làm sạch HTML | `sanitize-html` với danh sách cho phép nghiêm ngặt | Chốt chặn bảo mật cho HTML do API sinh |
| Sinh template | Claude API, model `claude-opus-5` | Chất lượng cao nhất cho tác vụ hiếm khi gọi nhưng quyết định thẩm mỹ toàn hệ thống |
| Triển khai | Vercel (ứng dụng) + Supabase (dữ liệu) | Không cần người vận hành máy chủ |

**Phiên bản thực tế khi triển khai (2026-08-28):** Next.js 16.3.3 · React 19.2.8 · Tailwind CSS 4 · PostgreSQL 17.6 (Supabase, vùng `ap-southeast-1`). Bản PRD đầu ghi Next.js 15; `create-next-app` nay trả về 16, và không có hạng mục nào trong kế hoạch phụ thuộc API riêng của 15 nên đã chấp nhận phiên bản mới thay vì ghim ngược.

**Lưu ý kết nối cơ sở dữ liệu:** phải dùng **connection pooler** của Supabase, không dùng host trực tiếp `db.<ref>.supabase.co` — host trực tiếp chỉ phục vụ IPv6. Kèm theo đó, driver bắt buộc đặt `prepare: false` khi đi qua pooler.

**Tên khoá Supabase:** dự án dùng tên khoá thế hệ mới — `publishable key` (thay cho `anon`) và `secret key` (thay cho `service_role`).

**Ghi chú về chi phí API:** `claude-opus-5` có giá 5 USD cho mỗi triệu token đầu vào và 25 USD cho mỗi triệu token đầu ra. Mỗi biến thể tiêu tốn khoảng 3.000 token vào và 8.000 token ra, tức 0,22 USD; mỗi lần tạo phong cách sinh 3 biến thể nên tốn khoảng **0,66 USD**. Vì API chỉ được gọi khi tạo hoặc chỉnh template — không gọi khi báo giá — tổng chi phí API cho cả vòng đời hệ thống dự kiến dưới 30 USD. Đây chính là lý do chọn tầng model cao nhất thay vì tầng rẻ hơn.

### 6.3 Đường đi của một trang báo giá

```
Yêu cầu GET /q/a7f3k9
   |
   +- Tra quote_links theo slug
   |     không thấy / đã tắt / hết hạn  ->  trang thông báo lịch sự
   |
   +- Link có đặt mật khẩu?
   |     chưa xác thực  ->  màn hình nhập mật khẩu
   |
   +- Nạp quote + quote_items + template_version (phiên bản đã khoá cứng)
   |
   +- Dựng đối tượng dữ liệu theo đúng hợp đồng slot ở mục C2
   |     · định dạng tiền tệ tại máy chủ, theo cấu hình thương hiệu
   |     · sinh URL ảnh đã ký, có hạn dùng
   |
   +- Biên dịch template Handlebars (chế độ hạn chế) và đổ dữ liệu
   |     -> mọi giá trị được escape HTML tự động
   |
   +- Làm sạch HTML kết quả bằng danh sách thẻ/thuộc tính cho phép
   |
   +- Đóng gói cùng CSS của template
   |     + thẻ meta noindex, nofollow
   |     + thẻ Open Graph cho ảnh xem trước khi dán link
   |
   +- Trả về HTML tĩnh
         · ghi một bản ghi vào quote_link_views (chạy nền, không chặn phản hồi)
```

Trang khách xem **không kèm bất kỳ mã JavaScript nội bộ nào**, không chứa khoá API, không truy cập được các route quản trị. Về bản chất đó là một trang HTML tĩnh đã render sẵn.

### 6.4 Ranh giới các thành phần

Hệ thống chia thành các phần có trách nhiệm tách bạch, giao tiếp qua giao diện rõ ràng, để hiểu và kiểm thử được độc lập:

| Thành phần | Trách nhiệm duy nhất | Đầu vào -> Đầu ra |
|---|---|---|
| `ingest/drive` | Đọc folder Drive, liệt kê ảnh và Sheet | folder ID -> danh sách file |
| `ingest/matcher` | Khớp dòng Sheet với file ảnh | dòng Sheet + danh sách file -> kết quả đối soát |
| `media/processor` | Sinh biến thể ảnh, xoá EXIF, tính mã băm | ảnh gốc -> 3 biến thể + siêu dữ liệu |
| `catalog` | Nghiệp vụ sản phẩm, danh mục, tìm kiếm | - |
| `template/generator` | Gọi API sinh HTML+CSS từ mô tả | mô tả phong cách -> mã nguồn template |
| `template/validator` | Kiểm định an toàn và tính đúng đắn | mã nguồn template -> báo cáo đạt/không đạt |
| `template/renderer` | Đổ dữ liệu vào template, làm sạch kết quả | template + dữ liệu -> HTML an toàn |
| `quote` | Nghiệp vụ báo giá, tính tiền, vòng đời trạng thái | - |
| `sharing` | Sinh slug, kiểm tra quyền truy cập, ghi lượt xem | - |

`template/renderer` là thành phần **duy nhất** được phép biến template thành HTML. Mọi nơi cần render — xem trước ở Template Studio, xem trước khi tạo báo giá, và trang khách xem — đều gọi đúng thành phần này. Nhờ vậy quy tắc làm sạch HTML chỉ tồn tại ở một chỗ và không thể bị bỏ sót ở một nhánh nào đó.

---

## 7. Yêu cầu phi chức năng

### 7.1 Hiệu năng

| Thao tác | Ngưỡng yêu cầu |
|---|---|
| Tìm kiếm catalogue (10.000 sản phẩm) | dưới 500 ms |
| Xem trước báo giá sau khi sửa dữ liệu | dưới 300 ms |
| Xuất bản báo giá (sinh link) | dưới 1 giây |
| Trang khách xem, 20 sản phẩm, mạng 4G | LCP dưới 2,5 giây |
| Đồng bộ Drive 500 ảnh | dưới 10 phút |
| Sinh template bằng API | 20-60 giây, có hiển thị tiến trình |

### 7.2 Quy mô mục tiêu

Thiết kế cho: 50.000 ảnh · 10.000 sản phẩm · 30 tài khoản nội bộ · 500 báo giá mỗi tháng · 5.000 lượt xem link mỗi tháng.

Vượt ngưỡng này thì cần đánh giá lại phần lưu trữ và tìm kiếm — không nằm trong phạm vi thiết kế hiện tại.

### 7.3 Tính sẵn sàng

- Khu vực quản trị: mục tiêu 99% uptime trong giờ làm việc.
- Trang khách xem: mục tiêu 99,9% — đây là bộ mặt của công ty trước khách hàng, ưu tiên cao hơn khu vực nội bộ.
- Sao lưu cơ sở dữ liệu hằng ngày, giữ 30 ngày.
- **API sinh template lỗi không được làm ngừng hệ thống.** Template đã duyệt vẫn dùng bình thường, báo giá vẫn tạo được. Chỉ riêng chức năng tạo phong cách mới tạm ngưng.

### 7.4 Trình duyệt và thiết bị

- Khu vực quản trị: Chrome, Edge, Safari, Firefox — hai phiên bản gần nhất. Tối ưu cho màn hình từ 1280px.
- Trang khách xem: thêm Safari iOS và Chrome Android. **Bắt buộc dùng tốt từ 360px** — không được cuộn ngang, không được có chữ nhỏ hơn 14px.

### 7.5 Ngôn ngữ và định dạng

- Giao diện tiếng Việt. Cấu trúc mã nguồn tách chuỗi hiển thị ra file riêng để thêm ngôn ngữ khác về sau mà không phải sửa logic.
- Tiền tệ mặc định VND, định dạng `2.500.000 ₫`. Hỗ trợ USD.
- Ngày tháng định dạng `dd/mm/yyyy`.
- Tìm kiếm phải xử lý đúng tiếng Việt có dấu và không dấu.

---

## 8. Bảo mật

### 8.1 Rủi ro trọng yếu: HTML do API sinh ra được phục vụ công khai

Đây là rủi ro bảo mật lớn nhất của thiết kế này và cần được xử lý bằng nhiều lớp phòng thủ, không dựa vào một lớp duy nhất.

**Lớp 1 — Ràng buộc lúc sinh.** Prompt hệ thống nêu rõ các thẻ và thuộc tính bị cấm, và yêu cầu chỉ dùng HTML tĩnh cùng CSS.

**Lớp 2 — Kiểm định tự động.** Bộ kiểm tra ở mục C4 chạy trên mọi template. Không đạt thì không được duyệt. Đây là cổng chặn tự động, không phụ thuộc vào việc admin có đọc kỹ mã hay không.

**Lớp 3 — Admin duyệt thủ công.** Một con người xem mã và bấm duyệt trước khi template được dùng thật.

**Lớp 4 — Làm sạch lúc render.** Ngay cả template đã duyệt, HTML đầu ra vẫn đi qua `sanitize-html` với danh sách cho phép nghiêm ngặt mỗi lần render. Đây là lớp bảo vệ cuối, hoạt động kể cả khi ba lớp trên đều bị vượt qua.

**Lớp 5 — Content Security Policy.** Trang khách xem đặt CSP chặt: `default-src 'none'; img-src 'self' <miền CDN>; style-src 'self' 'unsafe-inline'; font-src 'self'`. Không cho phép `script-src`. Kể cả khi một thẻ `<script>` lọt qua tất cả các lớp trên, trình duyệt vẫn từ chối chạy nó.

**Lớp 6 — Cách ly miền.** Trang khách xem phục vụ từ tên miền hoặc tên miền phụ riêng, không dùng chung với khu vực quản trị. Nhờ vậy cookie phiên đăng nhập của nhân viên không bao giờ được gửi kèm khi trình duyệt tải trang công khai.

### 8.2 Kiểm soát truy cập

- Mật khẩu băm bằng `bcrypt` hoặc `argon2`.
- Phiên đăng nhập hết hạn sau 8 giờ không hoạt động.
- Sale chỉ đọc và sửa được báo giá do chính mình tạo; danh sách báo giá lọc theo `created_by` ngay ở tầng truy vấn, không lọc ở giao diện.
- Mọi route quản trị kiểm tra vai trò ở phía máy chủ. Không dựa vào việc ẩn nút bấm trên giao diện.

### 8.3 Bảo vệ link công khai

- Slug 10 ký tự sinh bằng bộ sinh số ngẫu nhiên an toàn mật mã, cho khoảng 8·10^17 tổ hợp — không thể dò tìm bằng cách thử tuần tự.
- Giới hạn tần suất truy cập theo địa chỉ IP để chặn dò quét slug.
- Thẻ `noindex, nofollow` trên mọi trang báo giá, ngăn công cụ tìm kiếm đánh chỉ mục và làm lộ giá cho đối thủ.
- URL ảnh được ký và có hạn dùng, tránh việc ai đó lấy link ảnh trực tiếp phát tán ra ngoài.

### 8.4 Dữ liệu cá nhân

- Chỉ lưu mã băm địa chỉ IP của khách, không lưu IP thô.
- Không đặt cookie theo dõi trên trang khách xem.
- Thông tin liên hệ của khách hàng chỉ nhân viên đã đăng nhập mới xem được.
- Quyền truy cập Google Drive giới hạn ở phạm vi `drive.readonly`. Hệ thống không có khả năng ghi hay xoá dữ liệu trên Drive của công ty.

---

## 9. Lộ trình triển khai

Chia làm năm mốc. Mỗi mốc đều cho ra một hệ thống dùng được, không phải bán thành phẩm chờ mốc sau.

### M0 — Nền móng (tuần 1)

Khởi tạo dự án, lược đồ cơ sở dữ liệu, đăng nhập và phân quyền, cấu hình thương hiệu, khung giao diện quản trị.

*Kết quả:* đăng nhập được, thấy khung ứng dụng trống.

### M1 — Catalogue (tuần 2-3)

Upload ảnh trực tiếp, xử lý ảnh nền, danh mục, sản phẩm, ảnh sản phẩm, tìm kiếm và lọc, gán thông tin hàng loạt.

*Kết quả:* nạp và quản lý được toàn bộ kho ảnh — bắt đầu số hoá catalogue thật ngay từ đây, song song với các mốc sau.

### M2 — Báo giá và link (tuần 4-5)

Bốn template dựng sẵn, engine render, tạo báo giá, điều chỉnh giá, xem trước, xuất bản, trang khách xem, ghi nhận lượt xem.

*Kết quả:* **hệ thống đã dùng được thật cho công việc bán hàng.** Đây là mốc quan trọng nhất — mọi thứ sau đây đều là mở rộng.

### M3 — Đồng bộ Google Drive (tuần 6)

OAuth Google, quét folder, đọc Sheet, màn hình đối soát, đồng bộ nền, đồng bộ lại.

*Kết quả:* nạp hàng loạt từ Drive thay cho upload thủ công.

### M4 — Template Studio (tuần 7-8)

Sinh template bằng API, sinh ba biến thể song song, xem trước ba khổ màn hình, trình soạn thảo, bộ kiểm định, quy trình duyệt, quản lý phiên bản.

*Kết quả:* admin tự tạo được phong cách mới không cần lập trình viên.

### M5 — Hoàn thiện (tuần 9)

Thông báo email khi khách xem, bảng điều khiển, đặt mật khẩu cho link, xuất PDF, nhân bản báo giá, thao tác hàng loạt, phát hiện ảnh trùng, nhật ký hoạt động.

**Tổng thời gian dự kiến: 9 tuần.** Hệ thống bắt đầu tạo giá trị thật từ cuối tuần 5.

Lý do xếp Template Studio ở M4 chứ không phải M1: bốn template dựng sẵn đã đủ để bán hàng, nên đưa hệ thống vào dùng thật sớm quan trọng hơn là có khả năng tự sinh phong cách. Thứ tự này cũng cho phép thiết kế Template Studio dựa trên kinh nghiệm thực tế sau vài tuần vận hành, thay vì đoán trước.

---

## 10. Rủi ro

| Rủi ro | Mức | Cách xử lý |
|---|---|---|
| HTML do API sinh chứa mã độc, phục vụ công khai cho khách | **Cao** | Sáu lớp phòng thủ ở mục 8.1. Lớp CSP và lớp làm sạch lúc render hoạt động độc lập với chất lượng đầu ra của API |
| Template sinh ra đẹp trên máy tính nhưng vỡ trên điện thoại | Cao | Bắt buộc xem trước ba khổ màn hình; không đạt khổ điện thoại thì không cho duyệt |
| Sheet của công ty không theo cấu trúc chuẩn, đối soát sai hàng loạt | Cao | Cho phép ánh xạ lại tên cột; màn hình đối soát bắt buộc trước khi ghi; xuất được file lỗi để sửa và nhập lại |
| Ảnh chụp không đồng đều (nền, tỉ lệ, ánh sáng) làm trang báo giá xấu | Trung bình | Template chuẩn hoá khung ảnh bằng `object-fit`. Về lâu dài cần quy chuẩn chụp ảnh ở khâu đầu vào — nằm ngoài phạm vi hệ thống |
| Giá bị lộ khi link phát tán ngoài ý muốn | Trung bình | Slug ngẫu nhiên khó dò, `noindex`, tuỳ chọn mật khẩu và hạn dùng, thu hồi link được bất cứ lúc nào |
| Google thay đổi hoặc thu hồi quyền truy cập Drive API | Trung bình | Upload trực tiếp luôn là đường thay thế đầy đủ; Drive là tiện ích, không phải phụ thuộc sống còn |
| Sale sửa nhầm giá và gửi cho khách | Trung bình | Dòng có giá khác giá niêm yết được đánh dấu trực quan kèm giá gốc; nhật ký ghi lại mọi lần sửa |
| Chi phí lưu trữ ảnh tăng ngoài dự kiến | Thấp | Ảnh phục vụ dưới dạng WebP đã nén qua CDN; theo dõi dung lượng theo tháng |
| Phụ thuộc một nhà cung cấp API duy nhất cho việc sinh template | Thấp | Template đã duyệt được lưu dưới dạng HTML/CSS thuần trong cơ sở dữ liệu. Nhà cung cấp ngừng hoạt động cũng không ảnh hưởng tới các template hiện có |

---

## 11. Giả định

Những điều dưới đây được giả định là đúng. Nếu một giả định sai, phần thiết kế tương ứng cần xem lại.

1. Công ty có tài khoản Google Workspace và các folder ảnh nằm trên Drive của công ty, không nằm ở tài khoản cá nhân.
2. Ảnh sản phẩm đã được chụp và xử lý đạt yêu cầu trước khi nạp vào hệ thống. Hệ thống không chỉnh sửa ảnh.
3. Mỗi sản phẩm có một mã duy nhất và nhất quán giữa các file Sheet khác nhau.
4. Khách hàng mở link bằng trình duyệt hiện đại có kết nối internet. Không cần phương án xem ngoại tuyến.
5. Số lượng báo giá dưới 500 mỗi tháng, nên không cần tối ưu cho tải cao.
6. Công ty chấp nhận lưu ảnh sản phẩm và thông tin liên hệ khách hàng trên hạ tầng đám mây.
7. Có ít nhất một người ở vai trò Admin đủ hiểu biết để đọc và duyệt mã HTML/CSS ở Template Studio.

---

## 12. Câu hỏi mở

Những điểm này chưa quyết định và cần chốt trước hoặc trong quá trình triển khai. Không câu nào chặn việc bắt đầu M0.

| # | Câu hỏi | Cần chốt trước mốc |
|---|---|---|
| 1 | Tên miền cho trang khách xem là gì? Dùng tên miền phụ của công ty hay tên miền riêng? | M2 |
| 2 | Báo giá có cần thể hiện thuế VAT tách riêng không? Nếu có thì mức thuế cố định hay theo từng dòng? | M2 |
| 3 | Ngoài VND có cần báo giá bằng ngoại tệ không? Nếu có thì tỉ giá nhập tay hay lấy tự động? | M2 |
| 4 | Số lượng sản phẩm tối đa trong một báo giá là bao nhiêu? Cần phân trang cho trang khách xem không? | M2 |
| 5 | Cấu trúc file Sheet hiện tại của công ty như thế nào? Cần một file mẫu thật để hiệu chỉnh phần đối soát | M3 |
| 6 | Ai giữ vai trò Admin và ai đủ khả năng duyệt mã ở Template Studio? | M4 |
| 7 | Có cần lưu lịch sử các phiên bản của một báo giá (gửi lần 1, lần 2 sau khi khách thương lượng) không? | M5 |

---

## 13. Tóm tắt các quyết định thiết kế

Bảy quyết định định hình toàn bộ hệ thống, ghi lại kèm lý do để về sau còn đối chiếu:

1. **API sinh template, không sinh từng báo giá.** Giữ thao tác báo giá hằng ngày ở mức tức thì, không tốn phí, kết quả đoán trước được — trong khi vẫn có được sự linh hoạt của AI ở khâu thiết kế phong cách.

2. **Chất lượng đến từ chọn lọc, không đến từ may mắn.** Sinh ba biến thể mỗi lần, xem trước ba khổ màn hình, kiểm định tự động, admin duyệt. Không bản nào tới tay khách mà chưa qua mắt người.

3. **Model tầng cao nhất cho việc sinh template.** Vì API hiếm khi được gọi, chi phí cả vòng đời dưới 30 USD, mà chất lượng đầu ra quyết định diện mạo mọi bản báo giá.

4. **Báo giá đã gửi là bất biến.** Snapshot dữ liệu sản phẩm và khoá cứng phiên bản template. Khách mở lại link sau sáu tháng vẫn thấy đúng thứ đã nhận.

5. **Giá trong báo giá tách khỏi giá catalogue.** Sale linh hoạt theo từng khách mà không làm rối dữ liệu gốc.

6. **Trang khách xem là HTML tĩnh, phục vụ từ miền riêng.** Không mã JS nội bộ, không cookie phiên, CSP chặt. Bộ mặt công khai của công ty có bề mặt tấn công gần bằng không.

7. **Bốn template dựng sẵn trước khi có Template Studio.** Hệ thống dùng được thật từ tuần 5, và không bao giờ phụ thuộc vào việc API có hoạt động hay không.

---

*Hết tài liệu.*
