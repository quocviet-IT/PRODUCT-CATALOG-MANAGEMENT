import type { CoBatThuong, DongCatalogue } from "./catalogue.mapper";

/**
 * Danh dau nhung dong co thu muc anh da bi bo vao Thung rac. Ham THUAN — test duoc.
 *
 * VI SAO PHAI LA MOT CO RIENG, khong gop vao "thieu-anh". Hai tinh huong nay
 * dan toi hai hanh dong khac nhau cua sale:
 *   - "thieu anh"          -> cho hau ky giao anh
 *   - "thu muc da bi xoa"  -> phai gan lai chip cot Q, hoac khoi phuc thu muc
 * Gop chung thi nguoi doc khong biet minh dang cho ai.
 *
 * Nguon du lieu la dong-bo/thu-muc-da-xoa.json, do duong dong bo ghi khi Apps
 * Script bao thu muc co co isTrashed (xem gopAnhThuMuc).
 */
export function ganCoThuMucDaXoa(
  ds: readonly DongCatalogue[],
  daXoa: Readonly<Record<string, string>>,
): DongCatalogue[] {
  return ds.map((d) => {
    if (!d.idThuMuc || !(d.idThuMuc in daXoa)) return d;
    if (d.co.includes("thu-muc-da-xoa")) return d;

    // Dat ngay sau "thieu-anh": co nay la LY DO cua co do, doc lien nhau moi
    // thanh mot cau. Khong co "thieu-anh" thi dat o dau danh sach.
    const co: CoBatThuong[] = [...d.co];
    co.splice(co.indexOf("thieu-anh") + 1, 0, "thu-muc-da-xoa");
    return { ...d, co };
  });
}
