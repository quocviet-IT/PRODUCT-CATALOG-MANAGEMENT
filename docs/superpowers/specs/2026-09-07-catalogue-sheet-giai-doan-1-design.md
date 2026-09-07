# Đặc tả — Lưới catalogue đọc từ Google Sheet (Giai đoạn 1)

| | |
|---|---|
| **Mã tài liệu** | SPEC-CQS-002 |
| **Ngày** | 2026-09-07 |
| **Trạng thái** | Chờ duyệt |
| **Liên quan** | PRD-CQS-001 mục A2, A3 |

---

## 1. Bối cảnh

PRD-CQS-001 đặt "nạp dữ liệu từ Google Drive" là năng lực P0 (mục A2, A3), nhưng 14 task đã thực hiện mới dựng xong nền móng M0 + M1. Hiện chưa có đường nào đưa dữ liệu từ Google Sheet vào ứng dụng; lưới sản phẩm chỉ đọc từ Postgres của chính hệ thống.

Công ty đang giữ dữ liệu mẫu trong một bảng tính trên Shared Drive, cùng chỗ với ảnh sản phẩm. Giai đoạn 1 dựng đường ống đọc — chứng minh chuỗi *xác thực Google → đọc bảng → phục vụ ảnh riêng tư* chạy được — trước khi cam kết vào lược đồ đồng bộ ở giai đoạn sau.

### 1.1 Mục tiêu

Một trang lưới ảnh trong hệ thống hiện có, đọc thẳng một tab của bảng tính mỗi lần mở, hiển thị đủ mọi dòng kèm ảnh, có tìm kiếm và bộ lọc, và đánh dấu những dòng khuyết dữ liệu.

### 1.2 Ngoài phạm vi giai đoạn 1

- Ghi dữ liệu bảng tính vào cơ sở dữ liệu
- Sửa dữ liệu từ trong ứng dụng (bảng tính vẫn là nguồn duy nhất)
- Đồng bộ nền, hàng đợi, lịch chạy
- Dính tới luồng báo giá
- Cho người ngoài xem (trang nằm sau đăng nhập)
- Xử lý ảnh cho đẹp: cân bằng trắng, tách nền, phân biệt ảnh studio với ảnh chụp đời thường

---

## 2. Quyết định đã chốt

| Quyết định | Chọn | Lý do |
|---|---|---|
| Nền tảng | Mở rộng `catalogue-quote-system` | Đăng nhập, phân quyền, xử lý ảnh, lưu trữ, tìm kiếm tiếng Việt đã chạy và đã có test |
| Nguồn dữ liệu | Đọc thẳng bảng tính mỗi lần mở, không ghi CSDL | Đúng nghĩa "giai đoạn 1 chỉ hiển thị"; số liệu luôn khớp bảng; chưa phải chốt lược đồ |
| Hình dạng màn hình | Lưới ảnh | Người dùng là nhân viên kinh doanh lướt xem mẫu để tư vấn khách |
| Xác thực Google | Service account | Không hết hạn, không phụ thuộc ai đăng nhập, dùng lại được cho đồng bộ nền ở giai đoạn 2 |
| Tab nguồn | Cấu hình được | Chuyển sang tab chính hoặc bảng khác chỉ đổi một biến môi trường |
| Dòng khuyết | Hiện hết, đánh dấu | Không giấu dữ liệu của người dùng; lỗi bảng tính lộ ra để có người sửa |
| Ảnh | Proxy có bộ nhớ đệm, tải khi cần | Nhanh gần bằng nạp trước mà không cần ai nhớ chạy lệnh đồng bộ |

---

## 3. Kiến trúc

Giữ nguyên chiều phụ thuộc `app → modules → db/lib`. Thêm một module mới, không sửa `modules/catalog/`.

```
src/modules/sheet/
  google-auth.ts        chỉ nơi này biết tới google-auth-library
  sheet.client.ts       chỉ nơi này gọi Sheets API
  drive.client.ts       chỉ nơi này gọi Drive API
  catalogue.mapper.ts   THUẦN, không I/O — bảng thô sang mô hình
  catalogue.service.ts  ghép lại, đệm 60 giây trong bộ nhớ

src/modules/media/
  anh-drive.ts          tải ảnh Drive, resize, giao storage.ts lưu

src/app/admin/catalogue-sheet/
  page.tsx              lưới, server component
  bo-loc.tsx            bộ lọc, client component

src/app/api/anh-drive/[fileId]/
  route.ts              nạp lười rồi chuyển hướng sang URL có ký
```

`catalogue.mapper.ts` chứa **toàn bộ tri thức về hình dạng bảng tính**. Vì nó thuần nên test được không cần mạng, và khi bảng đổi cấu trúc thì chỉ một file phải sửa.

Ba client mỗi cái một việc và là cửa ngõ duy nhất tới dịch vụ tương ứng, giống quy ước `storage.ts` đã có.

### 3.1 Thư viện thêm vào

Đúng một gói: `google-auth-library`.

Không dùng `googleapis` — gói đó kéo theo hàng trăm API không dùng tới. Hai lệnh gọi REST bằng `fetch` với token do `google-auth-library` cấp là đủ.

---

## 4. Đọc bảng tính

Dữ liệu nằm ở ba tầng khác nhau và `values.get` chỉ thấy một tầng. Dùng `spreadsheets.get` với field mask `sheets.data.rowData.values(formattedValue,userEnteredValue,hyperlink)` để một lần gọi lấy đủ cả ba:

| Cần | Lấy từ |
|---|---|
| Chữ hiển thị | `formattedValue` |
| ID ảnh | `userEnteredValue.formulaValue`, tách từ `=IMAGE(".../d/<id>")` |
| Đường dẫn thư mục ảnh | `hyperlink` |

### 4.1 Nhận cột theo tên tiêu đề

Tiêu đề nằm ở **dòng 2** (dòng 1 là băng tiêu đề gộp ô). Nhận cột theo tên, không theo vị trí — đúng như PRD A3 quy định.

**Chuẩn hoá tên tiêu đề trước khi so khớp.** Ít nhất một ô tiêu đề trong bảng nguồn chứa ký tự xuống dòng (`TL VÀNG\n (gr)`). So khớp trực tiếp sẽ trượt. Trước khi đối chiếu phải: bỏ khoảng trắng đầu cuối, thay mọi chuỗi khoảng trắng và xuống dòng liên tiếp bằng một dấu cách, rồi so không phân biệt hoa thường.

| Nhóm | Cột |
|---|---|
| **Bắt buộc** | `SKU`, `MO`, `Chi tiết SP`, `MÃ MẪU`, `CHẤT LIỆU`, `TL VÀNG`, `HÌNH` |
| **Tuỳ chọn** | `SIZE`, `FOLDER HÌNH`, `SO`, `LOẠI`, `DÒNG` |

Cột bắt buộc nói về **sự tồn tại của cột**, không phải giá trị trong đó — ô rỗng là hợp lệ và sinh cờ cảnh báo tương ứng.

Thiếu cột bắt buộc thì ném lỗi nêu đích danh cột thiếu. **Không** render lưới rỗng im lặng — bảng đổi tên cột là sự cố cần người xử lý, không phải trạng thái bình thường. Thiếu cột tuỳ chọn thì trường tương ứng nhận `null`.

Các cột không có tiêu đề bị bỏ qua.

### 4.2 Bộ đệm

Kết quả đọc được giữ trong bộ nhớ tiến trình 60 giây. Bảng tính do người sửa tay, tần suất thay đổi tính bằng giờ; 60 giây đủ để nhiều người mở trang liên tiếp không tạo ra nhiều lệnh gọi API.

---

## 5. Mô hình dữ liệu

```ts
type DongCatalogue = {
  dongSheet: number;          // so dong that trong bang (dem tu 1), de doi chieu khi bao loi
  sku: string | null;
  maMau: string | null;
  chiTiet: string | null;
  chatLieu: string | null;    // 18KW, 18KY, 14KY, 14KW, PT900PD
  loaiXoan: "lab" | "tu-nhien" | null;
  tlVang: number | null;
  size: string | null;
  fileIdAnh: string | null;
  urlThuMuc: string | null;
  co: CoBatThuong[];
};

type CoBatThuong =
  | "thieu-sku" | "thieu-anh" | "thieu-mo-ta" | "trung" | "tl-vang-lech";
```

### 5.1 Hai trường được suy ra

Bảng tính bỏ trống hai thứ mà dữ liệu vốn có sẵn ở chỗ khác. Mapper suy ra:

**`size`** — cột `SIZE` bỏ trống ở phần lớn dòng, nhưng `Chi tiết SP` luôn kết thúc bằng `Size: 5`, `Size: 14.5VN`. Ưu tiên giá trị trong cột; trống thì tách từ chuỗi mô tả.

**`loaiXoan`** — suy từ tiền tố của `Chi tiết SP`: `LGDRI` là xoàn nuôi trong phòng thí nghiệm, `DIARI` là xoàn tự nhiên. Đã kiểm trên toàn bộ dữ liệu mẫu, khớp mọi dòng với cột mô tả tương ứng trong bảng.

---

## 6. Cờ bất thường

Cờ là **cảnh báo hiển thị**, không phải bộ lọc. Dòng mang cờ vẫn lên lưới.

| Cờ | Điều kiện |
|---|---|
| `thieu-sku` | Ô SKU rỗng |
| `thieu-anh` | Không tách được `fileId` từ cột `HÌNH` |
| `thieu-mo-ta` | Ô `Chi tiết SP` rỗng |
| `trung` | Trùng cặp (`MÃ MẪU`, `MO`) với một dòng khác |
| `tl-vang-lech` | `TL VÀNG` lệch quá 0,005 so với giá trị suy ra |

### 6.1 Quy luật trọng lượng vàng

```
TL VÀNG = tổng gr − 0.2 × tổng cts
```

Trong đó `gr` và các giá trị `cts` tách từ `Chi tiết SP`; hệ số 0,2 là quy đổi carat sang gram.

Quy luật này khớp phần lớn dữ liệu mẫu, đủ chắc để coi phần còn lại là lỗi nhập liệu chứ không phải ngoại lệ hợp lệ. Ngưỡng 0,005 vì cột hiển thị làm tròn hai chữ số thập phân.

---

## 7. Đường đi của ảnh

Ảnh gốc trên Drive nặng vài MB tới hơn chục MB mỗi tấm, và nằm trong Shared Drive riêng tư — trình duyệt của người dùng không tự tải được.

Trang **không chờ ảnh**. Mỗi thẻ render `<img loading="lazy" src="/api/anh-drive/<fileId>">`; trình duyệt kéo ảnh khi cuộn tới.

Route `/api/anh-drive/[fileId]` cho mỗi yêu cầu:

1. Kiểm `fileId` khớp `^[A-Za-z0-9_-]{10,80}$`. Giá trị này tới từ URL nên không tin được.
2. Yêu cầu phiên đăng nhập hợp lệ. Ảnh sản phẩm nội bộ không mở cho người lạ đoán ID.
3. Khoá `sheet-cache/<fileId>-600.webp` đã có trong bucket chưa?
4. Chưa thì tải bytes từ Drive, `sharp` resize bề ngang 600, chuyển WebP, giao `storage.ts` ghi.
5. Trả `302` sang URL có ký hạn một giờ, dùng lại cơ chế `kyNhieuUrl` mà lưới sản phẩm đang dùng.

Ảnh hơn chục MB xuống còn khoảng 40 KB. Lần mở đầu mỗi tấm chậm một nhịp, sau đó về thẳng từ Storage.

`anh-drive.ts` **không** gọi Supabase trực tiếp — mọi thao tác lưu trữ đi qua `storage.ts`, giữ đúng luật số 2 của dự án.

---

## 8. Giao diện

Áp hệ thiết kế Hùng Phát. Bề mặt thuộc loại **công cụ nội bộ**: cùng bộ token thương hiệu nhưng đệm chặt hơn (`p-5`). Cỡ chữ trải từ 10px (nhãn cảnh báo trên thẻ) tới 28px (tiêu đề trang) — xem thang cỡ chữ cụ thể theo từng khối ở §8.4.

### 8.1 Token

Dự án dùng **Tailwind 4**, cấu hình nằm trong CSS chứ không có `tailwind.config.js`. Khai báo trong `src/app/globals.css`:

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
  --font-title: var(--font-title);
  --font-body:  var(--font-body);
}
```

Đồng thời **gỡ khối `@media (prefers-color-scheme: dark)`** của boilerplate Next.js. Nó đặt nền `#0a0a0a`; để lại thì máy nào bật chế độ tối sẽ thấy nền đen chọi với toàn bộ hệ màu be.

### 8.2 Ba chỗ lệch khỏi hệ thiết kế, kèm lý do

**1. Font chữ thân bài: `Cardo` thay bằng `EB Garamond`.**

`Cardo` không có subset `vietnamese` trên Google Fonts. Toàn bộ giao diện là tiếng Việt, nên dùng nó thì mọi chữ có dấu rơi sang font hệ thống và trang vỡ tự dạng. `EB Garamond` giữ đúng ý đồ serif thân bài và có đủ dấu.

Tiêu đề dùng `Cormorant Garamond` — bản thân hệ thiết kế đã cho phép thay khi không có `The Seasons`, và nó cũng có tiếng Việt.

**2. Thêm `--color-hp-pink-strong: #C4165F`.**

`#E91D79` không đạt WCAG AA ở bất kỳ vai trò nào có chữ: làm nền nút với chữ trắng chỉ đạt 4,27:1, với chữ kem là 3,81:1; ngưỡng cần là 4,5:1.

Giữ `#E91D79` cho việc nó làm tốt — nét kẻ, viền focus, chấm trạng thái, những chỗ chỉ cần 3:1. Mọi bề mặt có chữ dùng `#C4165F` (5,17:1 trên nền be, 5,79:1 với chữ trắng). Đây là thực hiện đúng yêu cầu "giữ tỉ lệ tương phản WCAG AA" của chính hệ thiết kế, không phải đi ngược nó.

**3. `--ink-muted` từ `#8A8178` xuống `#6E6760`.**

Hệ thiết kế dùng màu này cho nhãn 11px in hoa — cỡ đó không được hưởng ngoại lệ "chữ lớn" của WCAG. Giá trị gốc chỉ đạt 3,14–3,58:1 trên ba nền. Giá trị mới giữ nguyên sắc taupe ấm, chỉ hạ độ sáng cho tới khi đạt 4,57–4,97:1.

### 8.3 Ngân sách màu hồng

Hệ thiết kế cho phép tối đa ba lần xuất hiện mỗi màn hình. Trang có hai màn hình hiển thị, không bao giờ xuất hiện cùng lúc: khi đọc bảng tính lỗi, trang trả về sớm và không render dải số, bộ lọc hay thẻ nào — nên đây là hai màn hình tách biệt, mỗi màn hình tính ngân sách riêng.

**Màn hình lưới** (đường đi bình thường) dùng đủ ba:

1. Viền dưới ô tìm kiếm khi focus, 2px `hp-pink`
2. Gạch chân bộ lọc đang bật, 2px `hp-pink`
3. Nút "Lọc" khi rê chuột, nền `hp-pink-strong`

**Màn hình lỗi** (khi không đọc được bảng tính) dùng một:

1. Dòng thông báo lỗi, chữ `hp-pink-strong`

Dấu cảnh báo trên thẻ **không** dùng hồng: số thẻ mang cảnh báo lên tới hàng chục, tô hồng hết là biến màu nhấn thành trang trí lặp — điều hệ thiết kế cấm thẳng. Thay bằng nhãn in hoa giãn chữ màu muted. Ô chọn "chỉ dòng có cảnh báo" cũng không dùng hồng dù luôn hiện: một checkbox là nền tô tĩnh, không phải viền focus, hover hay điểm nhấn cấu trúc — không vai nào trong ba vai được phép khớp với nó.

### 8.4 Bố cục

**Đầu trang** theo mẫu Section Header: nhãn eyebrow ghi nguồn dữ liệu, tiêu đề `font-title` 28px, gạch hairline bên dưới.

**Dải số** — bốn ô ngăn bằng hairline dọc, số trên nhãn dưới, `tabular-nums`: tổng số mẫu, số thiếu ảnh, số thiếu SKU, số lệch trọng lượng vàng. Số ở `font-title text-2xl text-hp-ink`. Không tô màu con số cảnh báo; hệ này tạo thứ bậc bằng cỡ chữ và khoảng trắng.

**Bộ lọc** — hàng chữ in hoa giãn, không phải chip bo tròn. Mặc định muted, đang bật thì ink kèm gạch chân hồng. Lọc theo chất liệu và theo loại xoàn, kèm một công tắc *chỉ dòng có cảnh báo*. Mỗi lựa chọn hiện kèm số lượng.

**Ô tìm kiếm** — viền dưới, nền trong suốt, nhãn eyebrow phía trên. Tìm không dấu qua `src/lib/vietnamese.ts` đã có, quét mã mẫu, SKU và mô tả.

**Thẻ** — `bg-hp-card border border-hp-rule`, không bo góc, không đổ bóng:

- Khung ảnh tỉ lệ 4:5, nền `hp-inset`
- Chất liệu ở dạng eyebrow muted
- `MÃ MẪU` làm tiêu đề, `font-title text-xl`. Dùng mã mẫu chứ không dùng SKU vì bảng tính không có tên sản phẩm và một phần đáng kể số dòng không có SKU
- Trọng lượng và size ở dòng dưới, `tabular-nums`
- Nhãn cảnh báo 10px in hoa muted, chỉ hiện khi có cờ
- Liên kết mở thư mục ảnh trên Drive, dạng chữ muted gạch chân khi rê chuột

Thẻ mất ảnh hiện khối `hp-inset` với chữ `CHƯA CÓ ẢNH` in hoa muted, theo mẫu empty state của hệ thiết kế.

Lưới 2 cột trên điện thoại, 3 ở `md`, 4 ở `lg`.

**Chuyển động:** chỉ `transition-colors duration-150`. Không trượt, không phóng, không hiệu ứng khi cuộn.

### 8.5 Hai lựa chọn khác mẫu chuẩn

- **Ảnh dùng `object-contain`** thay vì `object-cover` như mẫu thẻ. Ảnh nguồn là nhẫn nhỏ nằm giữa khung rộng; cắt theo tỉ lệ 4:5 sẽ xén mất sản phẩm.
- **Trọng lượng viết theo chuẩn tiếng Việt** (`2,99 g`) dù bảng tính ghi dấu chấm.

### 8.6 Hệ quả lên các trang cũ

Đặt token vào `globals.css` khiến **toàn bộ ứng dụng đổi theo**. Các trang `/admin/products`, `/admin/categories`, `/login` hiện là boilerplate nền trắng sẽ chuyển sang nền be và font serif. Chúng vẫn chạy đúng nhưng bố cục chưa được thiết kế lại theo hệ này.

Chấp nhận có chủ đích: đặt token toàn cục ngay, thiết kế kỹ trang mới ở giai đoạn 1, rà lại các trang cũ ở một lượt riêng.

### 8.7 Chuỗi hiển thị

Mọi chuỗi vào `src/messages/vi.ts`, không viết thẳng vào JSX — luật số 3 của dự án.

---

## 9. Cấu hình

Thêm vào `src/lib/env.ts`, nơi duy nhất được đọc `process.env`:

| Biến | Ý nghĩa |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Địa chỉ tài khoản máy |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Khoá riêng PEM |
| `CATALOGUE_SHEET_ID` | ID bảng tính nguồn |
| `CATALOGUE_SHEET_TAB` | Tên tab, mặc định `test` |

Cả bốn đều bắt buộc trừ `CATALOGUE_SHEET_TAB` có giá trị mặc định. Bổ sung vào `.env.example`.

Khoá riêng chứa ký tự xuống dòng; lưu dạng một dòng với `\n` và khôi phục khi đọc. Không commit khoá — `.gitignore` đã chặn `.env*.local`.

---

## 10. Kiểm thử

**`catalogue.mapper.ts`** là bộ test chính, chạy trên bản chụp dữ liệu thật lưu thành fixture. Khẳng định:

- Đếm đúng số dòng, số dòng theo từng chất liệu, số dòng theo loại xoàn
- Tách đúng `fileId` từ công thức `=IMAGE`
- Bắt đúng những dòng thiếu SKU, thiếu ảnh, thiếu mô tả
- Bắt đúng những dòng lệch trọng lượng vàng, và **không** báo nhầm dòng hợp lệ
- Suy đúng `size` khi cột trống nhưng mô tả có
- Thiếu cột bắt buộc thì ném lỗi nêu tên cột

Không chạm mạng, không chập chờn.

**`anh-drive.ts`** — ảnh giả sinh bằng `sharp`; kiểm kích thước sau resize và khoá lưu. Dọn bằng `try/finally` kèm `xoaTep` theo quy ước vận hành của dự án.

**Client Google** — một test tích hợp, tự bỏ qua khi thiếu biến môi trường, để bộ test vẫn chạy trên máy chưa có khoá.

### 10.1 Tiêu chí nghiệm thu

1. Mở `/admin/catalogue-sheet` thấy đủ số thẻ bằng số dòng dữ liệu trong tab nguồn
2. Dải số khớp đúng số liệu mapper tính ra
3. Thẻ không có ảnh hiện khối `CHƯA CÓ ẢNH`, không phải icon vỡ
4. Lọc theo một chất liệu cho ra đúng số thẻ ghi trên nhãn bộ lọc
5. Tìm không dấu ra đúng kết quả khi gõ có dấu lẫn không dấu
6. Mở trang lần thứ hai, ảnh về từ Storage chứ không gọi lại Drive
7. Truy cập `/api/anh-drive/<id>` khi chưa đăng nhập bị từ chối
8. Đổi `CATALOGUE_SHEET_TAB` sang tab khác, trang đọc tab mới mà không sửa code

---

## 11. Rủi ro và việc phải làm trước

### 11.1 Chốt chặn: service account có vào được Shared Drive không

Việc đầu tiên **không phải viết code** mà là chứng minh đường vào:

1. Tạo service account, bật Sheets API và Drive API, tải khoá JSON
2. Thêm địa chỉ `…@….gserviceaccount.com` vào Shared Drive với quyền **Người xem**
3. Chạy script nhỏ đọc thử một dòng và tải thử một ảnh

Service account là **tài khoản ngoài miền công ty**. Nếu Workspace cấm chia sẻ ra ngoài miền, bước 2 bị từ chối và phải nhờ quản trị viên bật ngoại lệ cho đúng tài khoản đó.

Gặp trường hợp này thì **dừng lại báo người dùng**, không đi vòng bằng cách nhúng tài khoản cá nhân của nhân viên vào ứng dụng.

### 11.2 Rủi ro khác

| Rủi ro | Xử lý |
|---|---|
| Bảng tính đổi tên cột | Nhận cột theo tên, thiếu thì ném lỗi nêu đích danh |
| Quy luật trọng lượng vàng sai ở dữ liệu tương lai | Cờ là cảnh báo hiển thị, không chặn dòng lên lưới |
| Tab nguồn có hàng nghìn dòng | Đọc một lần vẫn trong hạn mức API; ảnh tải lười nên số dòng không ảnh hưởng lần vẽ đầu |
| Hạn mức Drive API khi đệm nguội | Mỗi ảnh chỉ tải một lần trong đời; đợt đầu là đỉnh duy nhất |

---

## 12. Ghi chú cho giai đoạn 2

Bộ đệm ảnh ở mục 7 chính là mầm của việc đồng bộ: khi cần ghi vào cơ sở dữ liệu, dữ liệu đã có sẵn ở dạng `DongCatalogue[]` và ảnh đã nằm trong Storage. Phần thêm mới sẽ là ánh xạ sang bảng `products`, màn hình đối soát theo PRD A3, và luật khử trùng.
