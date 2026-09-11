import type { CoBatThuong, DongCatalogue } from "./catalogue.mapper";

/**
 * Anh thu nho tren luoi catalogue-sheet. Ham THUAN — test duoc.
 *
 * CHOT 11/09/2026: anh thu nho = anh DAU TIEN trong thu muc cot "Hinh da xu ly".
 *
 * Truoc day lay anh cot HINH. Nhung tu 9d41095 duong dong bo chi nap anh cot
 * "Hinh da xu ly", ma web KHONG tu keo duoc anh tu Drive (anh chua co trong bo
 * dem thi /api/anh-drive tra 502). Giu cot HINH la moi dong THEM MOI se trong
 * anh thu nho vinh vien. Lay tu cot Q thi ca he thong chi con phu thuoc mot cot,
 * va anh tren luoi cung la anh da xu ly.
 *
 * Co "thieu-anh" phai di theo: no la con so tren bang dieu khien va bo loc. De no
 * xet cot HINH trong khi luoi lay cot Q la mot man hinh tu mau thuan — dem "0
 * thieu anh" ngay canh mot o anh trong.
 */
export function ganAnhDaiDien(
  ds: readonly DongCatalogue[],
  banDo: Readonly<Record<string, readonly { fileId: string }[]>>,
): DongCatalogue[] {
  return ds.map((d) => {
    const anhDaiDien = (d.idThuMuc ? banDo[d.idThuMuc]?.[0]?.fileId : undefined) ?? null;
    const co: CoBatThuong[] = d.co.filter((c) => c !== "thieu-anh");
    // Dat "thieu-anh" dung cho mapper van dat: ngay sau "thieu-sku" neu co.
    if (anhDaiDien === null) co.splice(co.indexOf("thieu-sku") + 1, 0, "thieu-anh");
    return { ...d, anhDaiDien, co };
  });
}

/**
 * Anh thu nho de HIEN.
 *
 * undefined = chua tinh vi nguon khong co ban do anh (chay thu bang Drive API
 * truc tiep) -> lui ve cot HINH nhu cu. null = da tinh va thu muc cot Q khong co
 * anh -> KHONG lui ve cot HINH: anh do khong duoc nap, hien ra chi la mot o vo.
 */
export function anhThuNho(d: Pick<DongCatalogue, "fileIdAnh" | "anhDaiDien">): string | null {
  return d.anhDaiDien === undefined ? d.fileIdAnh : d.anhDaiDien;
}
