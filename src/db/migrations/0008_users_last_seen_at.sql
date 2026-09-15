-- Lan cuoi nguoi nay DUNG he thong, cho cham mau o trang Tai khoan.
--
-- Ghi trong getSessionUser (auth/guard.ts) toi da 10 phut mot lan, khong phai moi
-- yeu cau. Cho phep NULL: nguoi chua mo trang nao tu khi co cot. Code cu khong doc
-- cot nay, nen chay migration TRUOC khi day code moi len la an toan — lam nguoc lai
-- thi moi trang co dang nhap loi 500.

ALTER TABLE "users" ADD COLUMN "last_seen_at" timestamp with time zone;
