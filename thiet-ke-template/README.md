# Bản vẽ ba template trang sức

Bản vẽ dùng để chốt hướng trước khi code (08/09/2026). Ba template
**Triển lãm**, **Khung cổ điển**, **Tạp chí** trong này đã được dựng vào ứng
dụng — xem `src/app/catalogue/[slug]/bo-cuc.tsx`.

Giữ lại vì nó ghi lại *vì sao* chọn ba hướng đó, và vì bộ màu nền × nhấn ở đây
là nguồn của `MAU_NHAN` trong `giao-dien.model.ts`.

## Dựng lại bảng vẽ

Tệp `.html` sinh ra không nằm trong git (2 MB). Dựng lại bằng skill `design`:

```
node <skill>/seed-canvas.mjs --template <skill>/payload.template.html \
  --out template-trang-suc.html --title "Template catalogue trang sức" \
  --artboard Main.dc.html --artboard KhungCoDien.dc.html --artboard TapChi.dc.html \
  --artboard MauSac.dc.html --artboard TrenMayTinh.dc.html --canvas canvas.json
```

Ảnh nhẫn trong bản vẽ là hình vẽ SVG tạm — bảng vẽ không tải được ảnh Drive.
