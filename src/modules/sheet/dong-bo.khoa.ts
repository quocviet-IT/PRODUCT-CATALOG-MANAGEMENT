/**
 * Ten cac doi tuong ma duong dong bo ghi vao Supabase Storage.
 *
 * Tach rieng khoi dong-bo.ts vi tep nay phai KHONG co phu thuoc nao: nguon
 * dang dung (catalogue.service.ts) can so sanh voi KHOA_BANG de biet du lieu
 * den tu Apps Script hay tu tep mau, ma no khong duoc phep keo theo client
 * Supabase — mot tep mau tren dia phai doc duoc ma khong can cau hinh Storage.
 */

/** Bang tho cua bang tinh, dung hinh dang ma anhXaBang() doi. */
export const KHOA_BANG = "dong-bo/bang.json";
/** idThuMuc -> danh sach anh trong thu muc do. */
export const KHOA_ANH_THU_MUC = "dong-bo/anh-thu-muc.json";
/** Moc thoi gian lan day gan nhat. */
export const KHOA_TRANG_THAI = "dong-bo/trang-thai.json";

/** Gia tri phai dat cho CATALOGUE_TEP_MAU de doc ban do Apps Script day len. */
export const NGUON_BANG_DONG_BO = `storage:${KHOA_BANG}`;
/** Gia tri phai dat cho CATALOGUE_TEP_ANH_MAU. */
export const NGUON_ANH_DONG_BO = `storage:${KHOA_ANH_THU_MUC}`;
