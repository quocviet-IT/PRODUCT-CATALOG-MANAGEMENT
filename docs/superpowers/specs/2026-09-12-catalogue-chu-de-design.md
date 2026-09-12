# Chủ đề trình bày + bố cục, tông nền, màu nhấn mới — thiết kế

Ngày: 12/09/2026. Trang: `/catalogue/tao` (khung "Kiểu trình bày"), trang khách
`/catalogue/<slug>`, bản Xem trước, trang Hướng dẫn.

## 1. Yêu cầu

Anh yêu cầu "bổ sung thêm template, Colour và Accent colour". Nguồn: góp ý 09:22
11/09/2026 của sale — "thêm nhiều lựa chọn Theme để chọn theo từng nhóm sản
phẩm hoặc phong cách". Hôm 11/09 đã thêm 4 tông (commit 6cfa6d7); lần này mở rộng cả
ba chiều.

Anh chốt (12/09/2026):

- Hướng: **theo dịp**, **theo nhóm hàng**, **theo khách**.
- Dịp: **Valentine**, **Ngày của Mẹ**, **Giáng sinh & cuối năm** (không làm Tết).
- Nhóm hàng: **Trang sức nam**, **Đồ cưới**, **Ngọc trai**.
- Khách: **Khách Mỹ bản xứ**, **Khách Việt kiều**, **Khách sỉ / tiệm khác**, **Khách VIP**.
- Cách tổ chức: **A — Chủ đề sẵn**: một hàng chủ đề, bấm một lần là đặt bố cục + tông
  + màu nhấn; ba danh sách bên dưới vẫn chỉnh tay. Không làm hoạ tiết nền theo dịp.

## 2. Hiện trạng

- `giao-dien.model.ts`: `BO_CUC` 6, `TONE` 8, `NHAN` 4 (`MAU_NHAN` mỗi màu `nhat` +
  `dam`), `NHAN_GOI_Y` cho 4 tông mới. `docGiaoDien` không bao giờ ném lỗi; giá trị lạ
  rơi về mặc định. Danh sách chỉ THÊM VÀO CUỐI.
- Tông = một khối `.tone-<khoá>` trong `globals.css` định nghĩa lại `--color-hp-*`.
  `tests/app/tone-tuong-phan.test.ts` đọc thẳng CSS: body/muted ≥ 4.5:1, ink ≥ 7:1 trên
  nền và thẻ. Tông tối (`toi`, `reu`) có khối `@media print` ép về nền sáng.
- Màu nhấn: `bienMauNhan()` gắn `--color-hp-pink` / `--color-hp-pink-strong` bằng
  `style` trên CÙNG phần tử mang class tông (`page.tsx`, `xem-truoc.tsx`). Biến gắn
  trực tiếp thắng class, nên khối `.tone-toi { --color-hp-pink: #E8559A }` không có tác
  dụng ở trang khách: tông tối đang dùng sắc nhấn thường, chỉ đạt 2.89–4.15:1 (Mận chín
  trên Xanh rêu 2.89:1).
- Bố cục = component trong `src/app/catalogue/[slug]/bo-cuc.tsx` (bảng `BANG`), hình
  minh hoạ `HinhBoCuc` trong `chon-giao-dien.tsx`. Chưa có test hiển thị bố cục. Phóng
  to ảnh tìm theo `data-anh` (fileId) trong mảng ảnh phẳng — bố cục chỉ hiện một phần
  ảnh vẫn lướt đủ ảnh.

## 3. Thiết kế

### 3.1 Chủ đề sẵn (`CHU_DE`)

Chủ đề là LỐI TẮT GIAO DIỆN, không lưu xuống bản ghi: bấm chủ đề đặt `boCuc`, `tone`,
`nhan`; chủ đề "đang chọn" suy ra bằng cách so ba giá trị đó. Không đổi `docGiaoDien`,
không migration, catalogue đã gửi không bị ảnh hưởng.

```ts
export const NHOM_CHU_DE = ["dip", "nhom-hang", "khach"] as const;
export const CHU_DE = [
  { khoa: "valentine",   nhom: "dip",       boCuc: "lookbook",      tone: "do-ruou",    nhan: "hong" },
  { khoa: "ngay-cua-me", nhom: "dip",       boCuc: "trien-lam",     tone: "oai-huong",  nhan: "man" },
  { khoa: "giang-sinh",  nhom: "dip",       boCuc: "khung-co-dien", tone: "reu",        nhan: "ruby" },
  { khoa: "nam",         nhom: "nhom-hang", boCuc: "tap-chi",       tone: "than-chi",   nhan: "sapphire" },
  { khoa: "cuoi",        nhom: "nhom-hang", boCuc: "thu-moi",       tone: "trang",      nhan: "dong" },
  { khoa: "ngoc-trai",   nhom: "nhom-hang", boCuc: "lookbook",      tone: "suong-bien", nhan: "luc" },
  { khoa: "khach-my",    nhom: "khach",     boCuc: "trien-lam",     tone: "trang",      nhan: "sapphire" },
  { khoa: "viet-kieu",   nhom: "khach",     boCuc: "danh-sach",     tone: "beige",      nhan: "ruby" },
  { khoa: "khach-si",    nhom: "khach",     boCuc: "bang-mau",      tone: "trang",      nhan: "hong" },
  { khoa: "vip",         nhom: "khach",     boCuc: "thu-moi",       tone: "xanh-dem",   nhan: "dong" },
] as const;
export function chuDeDangChon(g): ChuDe["khoa"] | null; // khớp đủ 3 giá trị, không thì null
```

Ràng buộc (có test): mọi giá trị nằm trong `BO_CUC`/`TONE`/`NHAN`; 10 bộ ba đôi một
khác nhau; không bộ nào trùng mặc định (danh-sach, beige, hong) — nếu trùng, catalogue
không chọn gì sẽ hiện như đang chọn một chủ đề; mỗi nhóm có ít nhất một chủ đề.

**Tên và mô tả:**

| Khoá | Tên vi | Mô tả vi | Tên en | Mô tả en |
|---|---|---|---|---|
| valentine | Valentine | Đỏ rượu, ảnh lớn kiểu Lookbook. Nhẫn đôi, quà người thương. | Valentine's Day | Wine red with big Lookbook pictures. Couple rings, gifts for a loved one. |
| ngay-cua-me | Ngày của Mẹ | Oải hương dịu dàng, ảnh tràn kiểu Triển lãm. | Mother's Day | Soft lavender with full-width Gallery pictures. |
| giang-sinh | Giáng sinh & cuối năm | Xanh rêu với đỏ ruby, khung cổ điển như tấm thiếp. | Christmas & holidays | Moss green with ruby red in a Classic frame, like a greeting card. |
| nam | Trang sức nam | Than chì với xanh sapphire, bố cục Tạp chí mạnh mẽ. | Men's jewellery | Graphite with sapphire blue in a bold Magazine layout. |
| cuoi | Đồ cưới | Trắng với vàng đồng, mỗi mẫu một trang như thiếp mời. | Bridal | White with antique gold, each model on its own page like an invitation. |
| ngoc-trai | Ngọc trai | Sương biển với xanh cổ vịt, ảnh lớn kiểu Lookbook. | Pearls | Sea mist with teal, big Lookbook pictures. |
| khach-my | Khách Mỹ | Trắng tối giản, ảnh tràn, nhấn xanh sapphire. | US clients | Minimal white, full-width pictures, sapphire accent. |
| viet-kieu | Khách Việt kiều | Nền kem quen thuộc, đỏ ruby, thông số rõ để so sánh. | Vietnamese clients | Familiar cream with ruby red and clear details to compare. |
| khach-si | Khách sỉ / tiệm khác | Bảng mẫu gọn: nhiều mẫu mỗi trang, in gọn. | Wholesale buyers | Compact Line sheet: many models per page, prints tight. |
| vip | Khách VIP | Xanh đêm với vàng đồng, mỗi mẫu một trang, có tên khách. | VIP clients | Midnight blue with antique gold, one page per model with the client's name. |

Nhãn nhóm: Theo dịp / By occasion · Theo nhóm hàng / By product · Theo khách / By
client. Tiêu đề fieldset: Chủ đề / Theme; dòng mô tả: "Bấm một chủ đề để đặt sẵn bố
cục, tông và màu nhấn hợp nhau — vẫn chỉnh tay được bên dưới." / "Pick a theme to set a
matching layout, colour and accent in one go — you can still adjust them below."

**Giao diện:** fieldset **Chủ đề** ở đầu khung Kiểu trình bày, trên Bố cục. Ba nhóm có
nhãn nhỏ; mỗi chủ đề là một ô radio: ô màu nhỏ (nền của tông lấy từ `O_MAU` + chấm màu
nhấn `MAU_NHAN.nhat`) + tên + một dòng mô tả. Chủ đề khớp thì ô được chọn; chỉnh tay
một chiều bên dưới thì không ô nào được chọn. Không có nút "bỏ chủ đề". Không chọn chủ
đề nào thì mọi thứ như hôm nay.

### 3.2 Năm tông mới

Thêm vào CUỐI `TONE`: `do-ruou`, `than-chi`, `xanh-dem`, `oai-huong`, `suong-bien`.
Giá trị đã đo (body/muted ≥ 4.5:1, ink ≥ 7:1 trên nền và thẻ):

| Khoá | Tên (vi / en) | foundation | card | inset | ink | body | muted | rule | Tối |
|---|---|---|---|---|---|---|---|---|---|
| do-ruou | Đỏ rượu / Wine red | #2A1418 | #331A1F | #3D2126 | #F6ECEA | #E2D1CF | #B39A98 | #4A2C31 | có |
| than-chi | Than chì / Graphite | #1B1E22 | #23272C | #2B3036 | #EEF1F4 | #D0D5DB | #99A1AA | #363C43 | có |
| xanh-dem | Xanh đêm / Midnight blue | #141B2B | #1B2336 | #232C41 | #EEF1F7 | #CFD6E3 | #98A2B6 | #2E3850 | có |
| oai-huong | Oải hương / Lavender | #EFE9F6 | #F9F6FC | #E4DCEE | #25202D | #423B4C | #62596E | #D9CFE6 | |
| suong-bien | Sương biển / Sea mist | #E6F0EE | #F5FAF9 | #D9E7E4 | #1A2624 | #344543 | #536563 | #C9DBD7 | |

- `--color-hp-plate` giữ #FCFAF7 ở cả năm tông (như `toi`/`reu`): ảnh studio đã hoà
  vào đúng màu đó, đổi nền ảnh là hiện khung chữ nhật quanh món hàng.
- Ba tông tối vào khối `@media print` ép nền sáng như `toi`/`reu`.
- `NHAN_GOI_Y` thêm: do-ruou→hong, than-chi→sapphire, xanh-dem→dong, oai-huong→man,
  suong-bien→luc (đúng màu nhấn của chủ đề dùng tông đó). Bốn tông cũ vẫn không gợi ý.

Dòng gợi ý:

| Khoá | vi | en |
|---|---|---|
| do-ruou | Đỏ rượu trầm và ấm. Hợp Valentine, nhẫn đôi, quà tặng người thương. | Deep, warm wine red. Suits Valentine's, couple rings, gifts for a loved one. |
| than-chi | Xám than lạnh, mạnh mẽ. Hợp trang sức nam. | Cool charcoal grey, strong and clean. Suits men's jewellery. |
| xanh-dem | Xanh đêm sâu, sang trọng. Hợp khách VIP, trang sức cao cấp. | Deep midnight blue, understated luxury. Suits VIP clients and fine jewellery. |
| oai-huong | Tím oải hương nhạt, dịu dàng. Hợp Ngày của Mẹ, quà tặng nữ. | Soft lavender. Suits Mother's Day and gifts for her. |
| suong-bien | Xanh sương biển nhạt, trong trẻo. Hợp ngọc trai. | Pale sea mist, clear and fresh. Suits pearls. |

### 3.3 Ba màu nhấn mới + sắc sáng cho nền tối

Thêm vào CUỐI `NHAN`: `ruby`, `luc-bao`, `sapphire` (oklch L .58, C tối đa .19 trong
gamut, chỉ khác sắc — lấp ba khoảng trống 25°, 150°, 258° của vòng màu hiện có).
`MAU_NHAN` có thêm sắc `sang` (oklch L .72, C .15) cho CẢ BẢY màu:

| Khoá | Tên (vi / en) | nhat | dam | sang |
|---|---|---|---|---|
| hong | Hồng thương hiệu (giữ) | #E91D79 | #C4165F | #EF799D |
| dong | Vàng đồng (giữ) | #A96A00 | #8A5600 | #E0911B |
| luc | Xanh cổ vịt (giữ) | #00806B | #006956 | #07BFA1 |
| man | Mận chín (giữ) | #A0439B | #873781 | #D87FD1 |
| ruby | Đỏ ruby / Ruby red | #D33A3C | #B02A2D | #F47B74 |
| luc-bao | Xanh lục bảo / Emerald | #009342 | #007835 | #53BE70 |
| sapphire | Xanh sapphire / Sapphire blue | #2275E8 | #145EC1 | #68A5FF |

Đã đo: chữ trắng trên `dam` ≥ 5.6:1; `nhat` trên nền mọi tông sáng ≥ 3.36:1 (chữ lớn,
số thứ tự, logo); `sang` trên nền mọi tông tối ≥ 6.0:1.

**Cơ chế chọn sắc theo tông (sửa lỗi hiện trạng ở mục 2):**

- `bienMauNhan(nhan)` chỉ gắn ba biến `--nhan-nhat`, `--nhan-dam`, `--nhan-sang`.
- Phần tử ngoài cùng (trang khách, Xem trước) có thêm class `mau-nhan`:

```css
.mau-nhan { --color-hp-pink: var(--nhan-nhat); --color-hp-pink-strong: var(--nhan-dam); }
.mau-nhan:is(.tone-toi, .tone-reu, .tone-do-ruou, .tone-than-chi, .tone-xanh-dem) {
  --color-hp-pink: var(--nhan-sang);
}
@media print {
  .mau-nhan:is(.tone-toi, .tone-reu, .tone-do-ruou, .tone-than-chi, .tone-xanh-dem) {
    --color-hp-pink: var(--nhan-nhat);
  }
}
```

- `--color-hp-pink-strong` (nút chữ trắng) luôn là `dam` ở mọi tông.
- `TONE_TOI` khai trong model; test đối chiếu danh sách đó với bộ chọn `:is(...)` trong
  CSS (cả khối màn hình lẫn khối in), để thêm tông tối mà quên CSS là đỏ test.
- Trang "link hết hiệu lực" không có `mau-nhan` → giữ nguyên như hôm nay.
- **Hệ quả đã biết:** catalogue ĐÃ GỬI dùng Nền tối / Xanh rêu sẽ đổi sang sắc nhấn
  sáng hơn (dễ đọc hơn). Mọi tông sáng — kể cả mặc định — hiện y như cũ. (Chờ anh
  chốt, xem mục 6.)

### 3.4 Hai bố cục mới

Thêm vào CUỐI `BO_CUC`: `bang-mau`, `thu-moi`. Dùng chung `Anh`, `MaMau`, `thongSo`,
`GioiThieu`; duyệt mục và ảnh theo đúng thứ tự gốc.

**Bảng mẫu (`bang-mau`) — Line sheet, cho khách sỉ, danh sách dài.**

- Mỗi mẫu một hàng: cột ảnh chính 4:3 (rộng 120px điện thoại / 180px máy tính,
  `rong` 600) | mã mẫu + thông số dạng nhãn nhỏ (lưới 2 cột điện thoại, 4 cột máy
  tính) + lời giới thiệu chữ nhỏ | số thứ tự bên phải (chỉ máy tính).
- Dưới ảnh chính: dòng chữ nhỏ "N ảnh" khi mẫu có hơn 1 ảnh — bấm ảnh chính mở khung
  phóng to, lướt được mọi ảnh của catalogue như các bố cục khác.
- Ngăn cách hàng bằng đường kẻ mảnh; `break-inside-avoid` từng hàng; bản in dồn nhiều
  mẫu một trang.

**Thư mời (`thu-moi`) — mỗi mẫu một trang riêng, cho khách VIP và đồ cưới.**

- Mỗi mẫu cao tối thiểu 85% chiều cao màn hình, nội dung căn giữa; bản in mỗi mẫu một
  tờ (`print:break-after-page`).
- Từ trên xuống: dòng "Dành riêng cho {tên khách}" (chỉ khi trang bìa có tên khách;
  chữ theo ngôn ngữ catalogue) · "01 / 06" · ảnh chính 4:3 trong khung kẻ mảnh có lề ·
  mã mẫu chữ tiêu đề cỡ lớn · đường trang trí ngắn (vạch–hạt thoi–vạch, màu nhấn) ·
  thông số một dòng căn giữa · lời giới thiệu căn giữa · các ảnh còn lại, lưới 4 cột.
- Khác Khung cổ điển (xếp liền nhau, khung kẻ đôi, 2 ảnh cạnh nhau) và Lookbook (ảnh tràn
  bề ngang, bảng thông số): Thư mời là từng trang riêng như một tấm thiếp.

Hình minh hoạ trong ô chọn (`HinhBoCuc`): Bảng mẫu = 3 hàng [ô vuông nhỏ + 2 vạch];
Thư mời = vạch nhỏ trên cùng + ảnh trong khung + 2 vạch căn giữa.

| Khoá chữ | vi | en |
|---|---|---|
| bo_cuc_bang_mau | Bảng mẫu | Line sheet |
| bo_cuc_bang_mau_mo_ta | Mỗi mẫu một hàng gọn: ảnh nhỏ cạnh thông số. Hợp khách sỉ, gửi nhiều mẫu, in gọn. | One compact row per model: a small picture beside its details. Suits wholesale buyers and long lists; prints tight. |
| bo_cuc_thu_moi | Thư mời | Invitation |
| bo_cuc_thu_moi_mo_ta | Mỗi mẫu một trang riêng, căn giữa, có dòng "Dành riêng cho" tên khách. Hợp khách VIP, đồ cưới. | Each model on its own page, centred, with a "Specially for" line using the client's name. Suits VIP clients and bridal. |
| thu_moi_danh_cho | Dành riêng cho {ten} | Specially for {ten} |
| bang_mau_so_anh | {n} ảnh | {n} images |

### 3.5 Chữ trên màn hình và trang Hướng dẫn

- Tên 3 màu nhấn mới như bảng 3.3; `nhan_mau_mo_ta`: "Bảy màu cùng độ sáng và độ tươi,
  chỉ khác sắc — ghép với nền nào cũng không chỏi; trên nền tối tự dùng sắc sáng hơn." /
  "Seven colours at the same lightness and saturation, differing only in hue — none of
  them clash with any background; on dark backgrounds a lighter shade is used."
- Hướng dẫn: thêm bước mới **Chọn nhanh một chủ đề** (khoá `chu_de`, ảnh `07-chu-de`,
  3 chú thích + 2 mẹo, vi/en) ngay trước bước bố cục. Gộp vào bước bố cục thì khung
  Kiểu trình bày cao ~1700px, vượt khung chụp. Tổng 22 bước.
- Bước bố cục (`bo_cuc_mau`): "Sáu bố cục" → tám bố cục (thêm Bảng mẫu, Thư mời); "Tám
  tông" → mười ba tông; chú thích màu nhấn thêm ý nền tối; mẹo bản in liệt kê năm tông
  tối. Bước giới thiệu: "cả sáu bố cục" → "mọi bố cục" (vi/en). Chụp lại cả hai bộ
  ảnh, soát bằng mắt trên trang.

## 4. Kiểm thử

- `giao-dien.model.test.ts`: nhận đủ 8 bố cục / 13 tông / 7 màu nhấn; mặc định không
  đổi; `MAU_NHAN` đủ ba sắc, khác nhau; `CHU_DE` tham chiếu hợp lệ, bộ ba khác nhau,
  không trùng mặc định, đủ ba nhóm; `chuDeDangChon` khớp đúng và trả null khi lệch một
  chiều.
- `goi-y-nhan.test.ts`: gợi ý cho 5 tông mới đúng như 3.2; 4 tông cũ vẫn không có.
- `tone-tuong-phan.test.ts`: tự phủ 5 tông mới (đọc CSS).
- Test mới `mau-nhan-tuong-phan.test.ts`: `dam` với chữ trắng ≥ 4.5:1; `nhat` trên nền
  + thẻ mọi tông sáng ≥ 3:1; `sang` trên nền + thẻ mọi tông tối ≥ 4.5:1; `TONE_TOI` khớp
  bộ chọn `.mau-nhan:is(...)` ở khối màn hình và khối in trong `globals.css`.
- tsc, lint, vitest, build.
- E2E (Playwright, tài khoản tạm xoá trong `finally`, có hẹn giờ), cục bộ rồi production:
  bấm lần lượt 10 chủ đề → đúng radio bố cục/tông/màu nhấn; chỉnh tay một chiều → không
  chủ đề nào chọn; Xem trước Bảng mẫu và Thư mời có đúng cấu trúc; tạo catalogue chủ đề
  VIP → trang khách có `.tone-xanh-dem.mau-nhan`, dòng "Dành riêng cho", `--color-hp-pink`
  tính ra = `sang` của Vàng đồng; giả lập in → = `nhat`; xoá catalogue tạm.

## 5. Ngoài phạm vi

Hoạ tiết nền theo dịp; Tết; lưu khoá chủ đề vào bản ghi; tự đổi chủ đề theo ngày; thêm
trường mới cho khách (giá, mã nội bộ — Bảng mẫu vẫn chỉ các trường của `MucCatalogue`);
ô chọn màu tự do.

## 6. Quyết định của anh (12/09/2026)

Thiết kế được duyệt. Sắc nhấn sáng cho tông tối **áp cả cho catalogue ĐÃ GỬI** dùng
Nền tối / Xanh rêu (hiện Mận chín trên Xanh rêu chỉ 2.89:1, khó đọc). Tông sáng —
kể cả mặc định — không đổi.
