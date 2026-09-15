# Ba bố cục xu hướng 2026 — Khung Art Deco, Thẻ tiêu bản, Chữ lớn — thiết kế

Ngày: 15/09/2026. Trang: `/catalogue/tao` (khung Kiểu trình bày), trang khách `/catalogue/<slug>`,
bản Xem trước, trang Hướng dẫn.

## 1. Yêu cầu

Anh yêu cầu: "tạo thêm 3 mẫu template trending. Search trên mạng để tìm ra 3 mẫu thật trending
và bổ sung thêm".

Nghiên cứu ngày 15/09/2026 (bản đầy đủ trong scratchpad `template-trending-research.md`). Nguồn
dưới đây đã được mở lại và kiểm nội dung:

| Bố cục | Bằng chứng xu hướng (đã kiểm) |
|---|---|
| Khung Art Deco | Pinterest Predicts 2026 qua nss magazine (19/12/2025) — xu hướng "Neodeco": chevron, vòm quạt, hình học. Le Vian — Art Deco là xu hướng trang sức 2026. |
| Thẻ tiêu bản | It's Nice That (12/01/2026) — "The visual index": đồ vật xếp lưới như bộ tiêu bản. Kittl (22/04/2026) — "Trinket design": nhãn đánh số, kiểu catalogue bảo tàng. |
| Chữ lớn | Fontfabric (09/12/2025, cập nhật 13/08/2026) — "Typographic Maximalism": chữ là hình ảnh chính. (Bài Creative Bloq không đọc được nội dung — không tính.) |

Anh chốt (15/09/2026):

- Ba bố cục: **Khung Art Deco**, **Thẻ tiêu bản**, **Chữ lớn**. Không làm Sổ tay sưu tầm và Lưới
  Bento.
- **Chỉ thêm 3 bố cục** — không thêm chủ đề sẵn cho chúng.
- Cách **A**: ba bố cục hoàn chỉnh trong tệp riêng, phần dùng chung tách ra một tệp chung.

## 2. Hiện trạng

- `src/modules/catalogue-share/giao-dien.model.ts`: `BO_CUC` có 8 khoá, danh sách CHỈ THÊM VÀO
  CUỐI; `docGiaoDien` không bao giờ ném lỗi, khoá lạ rơi về mặc định. `GIAO_DIEN_MAC_DINH` là
  danh-sach / beige / hong. `CHU_DE` 10 chủ đề.
- `src/app/catalogue/[slug]/bo-cuc.tsx` (~870 dòng): 8 component bố cục nhận
  `DoiSo = { muc: MucCatalogue[]; g: GiaoDienCatalogue; t: BoChu }`, đăng ký trong bảng `BANG`;
  gốc mỗi bố cục là `<ul data-bo-cuc="<khoá>">`, mỗi mẫu một `<li>`. Các hàm dùng chung đang
  là hàm riêng của tệp: `gam`, `thongSo`, `Anh`, `MaMau`, `ThongSoDong`, `ThongSoBang`,
  `DuongTrangTri`, `GioiThieu`, `mocAnh`. Tệp còn chứa `LOP_TONE`, `bienMauNhan`,
  `ThanCatalogue`, `TrangBia`, `KhoiLienHe`, `ThanhLienHe` (được `page.tsx`, `xem-truoc.tsx` import).
- Duyệt mẫu và ảnh phải theo đúng thứ tự gốc (khung phóng to tìm theo `data-anh` trong mảng ảnh
  phẳng). Bố cục chỉ hiện một phần ảnh vẫn được — khách vẫn lướt đủ ảnh trong khung phóng to
  (Bảng mẫu đang làm vậy).
- Ảnh sản phẩm chụp ngang 4:3, nền gần trắng (`--color-hp-plate` #FCFAF7). Sale giữ trung vị 5
  ảnh/mẫu.
- Font: Cormorant Garamond (tiêu đề, 400/500) và EB Garamond (thân bài), cả hai có bộ chữ tiếng
  Việt. Không tải font đơn cách riêng.
- Tông: 13; `TONE_TOI` 5 tông nền tối; lớp `.mau-nhan` trên phần tử bọc ngoài chọn sắc màu nhấn
  (`text-hp-pink`). Bẫy đã gặp: chữ màu nhấn đè lên ảnh thì trên tông tối khó đọc.
- Thông số chỉ hiện theo lựa chọn `g.hien`; hướng dẫn cam kết lời giới thiệu hiện ở mọi bố cục.
- Bảng chọn `src/app/catalogue/tao/chon-giao-dien.tsx`: `nhanBoCuc(t)` là `Record<BoCuc, …>`,
  `HinhBoCuc` vẽ hình minh hoạ bằng các ô màu (khoá lạ rơi về hình Danh sách dọc).
- Test `tests/modules/catalogue-share/giao-dien.model.test.ts` khoá đúng thứ tự `BO_CUC`
  (khoảng dòng 397–400) và kiểm `docGiaoDien` nhận mọi khoá.
- Hướng dẫn: `bo_cuc_mau.chu[0]` liệt kê "Tám bố cục…"; `anh_mau.chu[2]` nói bố cục nào dùng ảnh
  chính; script `scripts/chup-huong-dan.mts` bước 7b chụp khung Bố cục ở khung nhìn cao 1600px.

## 3. Thiết kế

### 3.1 Mô hình

- `BO_CUC` thêm vào cuối, kèm chú thích ngày: `"art-deco"`, `"tieu-ban"`, `"chu-lon"`.
  Không đổi `GIAO_DIEN_MAC_DINH`, `CHU_DE`, `docGiaoDien`.
- Hàm thuần mới trong `giao-dien.model.ts` — chữ cỡ poster của bố cục Chữ lớn:

  ```ts
  export function chuLonCuaMau(
    m: { loaiSp: string | null; chatLieu: string | null; maMau: string | null },
    hien: { loaiSp: boolean; chatLieu: boolean },
  ): string | null;
  ```

  Thứ tự: Loại SP (nếu `hien.loaiSp` và có giá trị) → Chất liệu (nếu `hien.chatLieu` và có giá
  trị) → Mã mẫu → `null`. Giá trị chỉ có khoảng trắng coi như trống; trả về chuỗi đã cắt khoảng
  trắng hai đầu. Lý do: không bao giờ in cỡ poster một thông số sale đã bỏ tích.

### 3.2 Tách tệp

- Tệp mới `src/app/catalogue/[slug]/bo-cuc-chung.tsx`: CHUYỂN NGUYÊN (không sửa nội dung)
  `DoiSo` (export type), `gam`, `thongSo`, `mocAnh`, `Anh`, `MaMau`, `ThongSoDong`, `ThongSoBang`,
  `DuongTrangTri`, `GioiThieu` sang đây và export. `bo-cuc.tsx` import lại từ tệp này. Hành vi
  8 bố cục cũ không đổi một pixel.
- Tệp mới `src/app/catalogue/[slug]/bo-cuc-xu-huong.tsx`: `KhungArtDeco`, `TheTieuBan`, `ChuLon`
  và các hoạ tiết SVG của chúng. Import từ `bo-cuc-chung.tsx`, không import từ `bo-cuc.tsx`
  (tránh vòng lặp import).
- `bo-cuc.tsx`: `BANG` thêm ba khoá trỏ tới ba component mới.

### 3.3 Khung Art Deco (`art-deco`)

- Gốc `<ul data-bo-cuc="art-deco">`, các mẫu cách nhau rộng; bản in mỗi mẫu một trang.
- Mỗi `<li>`: khung **kẻ đôi** (hai viền `border-hp-rule` lồng nhau cách một khoảng nhỏ). Bốn góc
  khung trong có hoạ tiết **bậc thang ba bậc** vẽ bằng SVG nét mảnh màu nhấn (`text-hp-pink`,
  `aria-hidden`).
- Trên cùng, căn giữa: **khiên nhỏ** SVG nét mảnh chứa số thứ tự `01`.
- **Ảnh chính** (`Anh`, 4:3) căn giữa, rộng tối đa khoảng `max-w-xl`. Nếu mẫu có ảnh thứ hai:
  **huy hiệu** tròn (khung tròn viền `border-hp-rule`, lót nền trang) chứa ảnh thứ hai, đặt đè
  lên góc dưới bên phải ảnh chính. Chỉ ảnh đè ảnh, không có chữ đè ảnh.
- Dưới ảnh: **nét quạt toả tia** (nửa mặt trời) SVG nét mảnh màu nhấn, căn giữa.
- Mã mẫu làm tiêu đề: chữ tiêu đề in hoa, giãn chữ rộng (~0.28em), cỡ ~22px, căn giữa (cùng lý
  do Thư mời không dùng `MaMau`).
- Thông số: lưới **hai cột đối xứng**, căn giữa, nhãn nhỏ in hoa trên giá trị (component riêng
  trong tệp mới — `ThongSoBang` có sẵn luôn thành 4 cột trên màn hình lớn).
- `GioiThieu` căn giữa dưới thông số.
- Mẫu có hơn một ảnh: dòng nhỏ `chia_se.bang_mau_so_anh` ("{n} ảnh") căn giữa ở cuối khung.
- Điện thoại: khoảng đệm khung nhỏ lại, huy hiệu nhỏ lại, hoạ tiết góc thu nhỏ theo.

### 3.4 Thẻ tiêu bản (`tieu-ban`)

- Gốc `<ul data-bo-cuc="tieu-ban">`, `ul > li` đúng bằng số mẫu. KHÔNG có dòng đếm riêng (anh
  chốt 15/09/2026): đầu trang khách và bản Xem trước đã hiện "{n} mẫu".
- Lưới **2 cột** trên điện thoại, **3 cột** từ màn hình vừa trở lên và trên bản in. Mỗi thẻ
  `break-inside-avoid`, ngăn dưới bằng một vạch chấm mảnh (`border-dotted border-hp-rule`) như
  khay trưng bày.
- Mỗi thẻ: **ảnh chính** 4:3 đặt thẳng trên nền (không khung) → vạch kẻ mảnh → **nhãn** chữ đơn
  cách (`font-mono`, cỡ 11px, in hoa, màu phụ): `Nº 001 · <mã mẫu>` và thêm ` · {n} ảnh` khi mẫu
  có hơn một ảnh → `ThongSoDong` → `GioiThieu`.
- Số trong nhãn đệm ba chữ số. Chữ `Nº {n}` là khoá `chia_se.tieu_ban_so`.

### 3.5 Chữ lớn (`chu-lon`)

- Gốc `<ul data-bo-cuc="chu-lon">`; mỗi mẫu cách nhau bằng kẻ mảnh; bản in mỗi mẫu một trang.
- Dòng đầu: số thứ tự màu nhấn `01 / 12` (chữ tiêu đề, cỡ ~18px) + kẻ mảnh kéo hết bề ngang.
- **Chữ lớn**: `chuLonCuaMau(m, g.hien)` (null → `catalogue_sheet.chua_co_ma_mau`), chữ tiêu đề
  in hoa, cỡ `clamp(3rem, 13vw, 9.5rem)`, khoảng cách dòng ≥ 1.12 để dấu tiếng Việt chồng nhiều
  tầng không bị cắt, xuống dòng khi dài (`break-words`), màu `text-hp-ink`. Bản in giới hạn cỡ
  (~64pt).
- **Chữ không bao giờ đè lên ảnh**: ảnh nằm dưới khối chữ.
- Dưới chữ: lưới hai cột trên màn hình lớn — trái là ảnh chính 4:3 và dải ảnh phụ (ảnh 2–5, lưới
  4 ô nhỏ); phải là `MaMau`, `DuongTrangTri`, `ThongSoDong`, `GioiThieu`, căn đáy. Điện thoại: một
  cột theo đúng thứ tự đó.

### 3.6 Bảng chọn

- `chon-giao-dien.tsx`: `nhanBoCuc` thêm ba mục; `HinhBoCuc` thêm ba hình minh hoạ:
  - Art Deco: khung kẻ đôi, bốn chấm góc màu chữ, ô ảnh giữa, chấm tròn nhỏ góc dưới, vạch tên.
  - Tiêu bản: lưới 3×2 ô ảnh nhỏ, dưới mỗi ô một vạch mảnh.
  - Chữ lớn: một khối chữ đậm cao ngang hết bề rộng, ô ảnh bên dưới, vạch nhỏ bên phải.
- Chữ mới (`vi.ts` / `en.ts`):

  | Khoá | vi | en |
  |---|---|---|
  | `mau_giao_dien.bo_cuc_art_deco` | Khung Art Deco | Art Deco frame |
  | `mau_giao_dien.bo_cuc_art_deco_mo_ta` | Khung kẻ đôi, góc bậc thang, ảnh lớn kèm huy hiệu ảnh chi tiết. Xu hướng 2026 — hợp nhẫn cưới, kim cương, khách VIP. | Double-ruled frame with stepped corners, a large picture and a detail medallion. A 2026 trend — suits bridal, diamonds and VIP clients. |
  | `mau_giao_dien.bo_cuc_tieu_ban` | Thẻ tiêu bản | Specimen sheet |
  | `mau_giao_dien.bo_cuc_tieu_ban_mo_ta` | Nhiều mẫu một trang như tủ trưng bày bảo tàng: ảnh nền trắng, nhãn số Nº. Xu hướng 2026 — lướt nhanh, gửi nhiều mẫu. | Many models per page, like a museum case: white-ground pictures with Nº labels. A 2026 trend — quick to browse, good for many models. |
  | `mau_giao_dien.bo_cuc_chu_lon` | Chữ lớn | Big type |
  | `mau_giao_dien.bo_cuc_chu_lon_mo_ta` | Mỗi mẫu một trang, loại sản phẩm viết cỡ poster phía trên ảnh. Xu hướng 2026 — mở đầu ấn tượng, hợp ít mẫu. | One page per model, with the product type set poster-size above the picture. A 2026 trend — a bold first impression, best for a few models. |
  | `chia_se.tieu_ban_so` | Nº {n} | Nº {n} |

### 3.7 Hướng dẫn

- `bo_cuc_mau.chu[0]` (vi/en): "Tám bố cục…" → "Mười một bố cục…" giữ nguyên tám mô tả cũ và thêm:
  "Khung Art Deco (nhẫn cưới, kim cương), Thẻ tiêu bản (nhiều mẫu một trang), Chữ lớn (ít mẫu,
  mở đầu ấn tượng)". Bản tiếng Anh: "Eleven layouts…" với "Art Deco frame (bridal, diamonds),
  Specimen sheet (many models per page), Big type (few models, bold opening)".
- `anh_mau.chu[2]` (vi/en): thêm Chữ lớn vào nhóm dùng ảnh chính làm ảnh lớn, và "Khung Art Deco
  lấy ảnh thứ hai làm huy hiệu nhỏ" / "Art Deco frame shows the second one as a small medallion".
- `gioi_thieu.meo[0]` giữ nguyên — vẫn đúng (lời giới thiệu nằm dưới thông số ở cả ba bố cục mới).
- Chụp lại `07-bo-cuc-mau` cả hai bộ ảnh (bảng chọn thêm một hàng thẻ). Nếu khung Bố cục → Màu
  nhấn vượt khung nhìn 1600px, tăng chiều cao khung nhìn ở bước 7b cho vừa. Soát bằng mắt: ô số
  không đè chữ ở cả hai ngôn ngữ. Chỉ commit ảnh có khoá `diem.json` đổi, trả về ảnh chỉ đổi byte.

### 3.8 Kiểm tra

- Unit (`giao-dien.model.test.ts`): cập nhật test thứ tự `BO_CUC` (11 khoá, ba khoá mới ở cuối);
  `chuLonCuaMau`: Loại SP hiện và có → Loại SP; Loại SP ẩn → Chất liệu; Loại SP hiện nhưng trống
  → Chất liệu; cả hai ẩn → Mã mẫu; chỉ khoảng trắng coi như trống; tất cả trống → `null`.
- Tương phản: chữ lớn dùng `hp-ink`, nhãn tiêu bản dùng `hp-muted` — test tông hiện có đã khoá
  (≥ 7:1 và ≥ 4.5:1 trên nền và thẻ). Số thứ tự màu nhấn là chữ lớn, `.mau-nhan` đã khoá ≥ 3:1 /
  ≥ 4.5:1. Hoạ tiết SVG là trang trí (`aria-hidden`), không mang thông tin.
- `npx tsc --noEmit`, `npx eslint`, vitest cả bộ, `npm run build`.
- E2E (script tạm, tài khoản tạm xoá trong `finally`, có hẹn giờ), chạy cục bộ rồi trên production
  sau khi push. Với mỗi bố cục mới, chọn 3 mẫu có ảnh:
  - Xem trước: `[data-bo-cuc="<khoá>"] > li` đúng bằng số mẫu.
  - Art Deco: số huy hiệu bằng số mẫu có ≥ 2 ảnh.
  - Tiêu bản: nhãn mẫu đầu bắt đầu bằng `Nº 001`.
  - Chữ lớn: chữ lớn mẫu đầu bằng Loại SP của mẫu đó; bỏ tích Loại SP → chữ lớn đổi sang Chất liệu.
  - Tạo link, mở trang khách: đúng `data-bo-cuc`; mô phỏng in: `li` của Art Deco và Chữ lớn có
    `break-after: page`.
  - Chụp ảnh Xem trước ở tông Be cổ điển và tông Xanh đêm để soát bằng mắt: hoạ tiết không đè
    chữ, chữ lớn không tràn ngang, dấu tiếng Việt không bị cắt, trên tông tối vẫn đọc rõ.

### 3.9 Triển khai

- Không migration. Catalogue đã gửi không đổi (danh sách chỉ thêm, bố cục cũ không đổi pixel).
- Push chỉ khi anh cho phép; sau push kiểm trên hpcatalogue.app.

## 4. Ngoài phạm vi

- Chủ đề sẵn "Xu hướng 2026" cho ba bố cục (anh chọn không làm).
- Sổ tay sưu tầm (zine/scrapbook), Lưới Bento.
- Hiệu ứng chuyển động, font mới.
