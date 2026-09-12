/**
 * Nhung anh ma duong dong bo phai nap vao bo dem. Ham THUAN — test duoc.
 *
 * QUY TAC (chot ngay 11/09/2026): CHI anh trong thu muc cot "Hinh da xu ly"
 * cua nhung dong DANG CO trong bang tinh. Khong anh cot HINH, khong anh raw,
 * khong anh concept, khong clip.
 *
 * Vi sao phai loc theo dong DANG CO trong bang, khong lay ca ban do thu muc:
 * ban do anh-thu-muc.json chi GOP THEM, khong bao gio tu xoa. Hom tab
 * Catalogue-OL rut tu 1.839 dong xuong 12, ban do van con 1.464 thu muc cu,
 * va tuyen thieu-anh — lap qua MOI thu muc trong ban do — cu the nap tiep anh
 * cua hang nghin mau da bi bo, dot han muc vao dung thu vua duoc yeu cau bo.
 *
 * Thu tu tra ve: theo thu tu dong trong bang, roi theo thu tu anh trong thu muc.
 * Mau o dau bang xong truoc.
 */
export function anhCanDongBo(
  dong: readonly { idThuMuc: string | null }[],
  anhThuMuc: Readonly<Record<string, readonly { fileId: string }[]>>,
): string[] {
  const ketQua: string[] = [];
  const daCoAnh = new Set<string>();
  const daXetThuMuc = new Set<string>();

  for (const d of dong) {
    if (!d.idThuMuc || daXetThuMuc.has(d.idThuMuc)) continue;
    daXetThuMuc.add(d.idThuMuc);
    // Thu muc chua duoc liet ke thi chua co gi de nap — khong phai loi, luot
    // dong bo thu muc sau se bo sung.
    for (const a of anhThuMuc[d.idThuMuc] ?? []) {
      if (daCoAnh.has(a.fileId)) continue;
      daCoAnh.add(a.fileId);
      ketQua.push(a.fileId);
    }
  }
  return ketQua;
}
