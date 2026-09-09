/**
 * Cach dat ten anh bang tinh trong bo dem.
 *
 * Tach khoi storage.ts vi tep do dung client Supabase NGAY LUC NAP: ai chi can
 * biet mot khoa duoc dat ten the nao thi khong nen bi bat phai co day du cau
 * hinh Storage. Va vi quy uoc nay phai chi ton tai o MOT noi — hai noi la co
 * ngay ngay ben ghi mot dang, ben doc mot dang, khong ai bao loi gi.
 */

/** Tien to rieng, tach khoi anh san pham do nguoi dung tai len. */
export function dungKhoaAnhSheet(fileId: string, canhDai: number): string {
  return `sheet-cache/${fileId}-${canhDai}.webp`;
}

/** Thu muc chua toan bo bo dem anh bang tinh. */
export const THU_MUC_DEM_ANH = "sheet-cache";
