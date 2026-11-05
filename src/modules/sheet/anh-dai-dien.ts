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
    const anh = d.idThuMuc ? (banDo[d.idThuMuc] ?? []) : [];
    const anhDaiDien = anh[0]?.fileId ?? null;
    // Dem luon o day thay vi mot luot map rieng: ham nay la cho DUY NHAT cam ca
    // dong lan ban do anh, nen moi thu suy ra tu ban do nen nam chung mot cho.
    const soAnh = anh.length;
    const co: CoBatThuong[] = d.co.filter((c) => c !== "thieu-anh");
    // Co "thieu-anh" phai di theo dung tam ANH THU NHO dang hien, khong theo
    // rieng mot nguon nao. Xet rieng thu muc Q thi dong co anh cot HINH van bi
    // bao thieu — mot man hinh tu mau thuan: cai nhan "thieu anh" nam ngay canh
    // mot o dang hien anh ro rang.
    if (anhThuNho({ fileIdAnh: d.fileIdAnh, anhDaiDien }) === null) {
      // Dat dung cho mapper van dat: ngay sau "thieu-sku" neu co.
      co.splice(co.indexOf("thieu-sku") + 1, 0, "thieu-anh");
    }
    return { ...d, anhDaiDien, soAnh, co };
  });
}

/**
 * Anh thu nho de HIEN: COT HINH truoc, khong co thi lui ve anh dau thu muc Q.
 *
 * CHOT 05/11/2026, dao lai quyet dinh 11/09. Cot HINH la tam nguoi ban hang TU
 * CHON lam dai dien cho mau; anh dau thu muc chi la tam Drive tinh co tra ve
 * truoc, khong ai ngam qua. Lay tam duoc chon la dung y nguoi dung bang tinh.
 *
 * Duong lui ton tai cho 29 dong chua dien cot HINH (do 05/11): bo han duong lui
 * thi 7 mau dang hien anh binh thuong se trang o — mat mot thu dang chay de doi
 * lay su thuan nhat, khong dang.
 *
 * KEM THEO, va khong duoc quen: anh cot HINH phai duoc duong dong bo nap vao bo
 * dem (xem anh-can-dong-bo.ts). Web khong tu keo anh tu Drive duoc — tai khoan
 * may bi chinh sach Workspace chan — nen tam nao khong co trong bo dem thi
 * /api/anh-drive tra 502 va o anh vo.
 */
export function anhThuNho(d: Pick<DongCatalogue, "fileIdAnh" | "anhDaiDien">): string | null {
  return d.fileIdAnh ?? d.anhDaiDien ?? null;
}
