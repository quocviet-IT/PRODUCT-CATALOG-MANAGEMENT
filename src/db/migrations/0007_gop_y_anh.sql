-- Anh chup man hinh kem theo gop y.
--
-- Chi luu KHOA trong Storage, khong luu ca anh trong bang. Anh la du lieu that
-- (gia, ma mau, duong dan link khach) nen no nam trong bucket rieng va chi doc
-- duoc qua /api/gop-y/anh/[id] — tuyen do goi requireAdmin(). Khong bao gio
-- duoc phep tro thanh mot duong dan cong khai.

ALTER TABLE "gop_y" ADD COLUMN "anh" text;
