/**
 * Nhung anh ma duong dong bo phai nap vao bo dem. Ham THUAN — test duoc.
 *
 * QUY TAC: anh cot HINH, va anh trong thu muc cot "Hinh da xu ly", cua nhung
 * dong DANG CO trong bang tinh. Khong anh raw, khong anh concept, khong clip.
 *
 * Anh cot HINH duoc nap lai tu 05/11/2026, dao lai quyet dinh 11/09: o anh tren
 * bang gio lay tam o cot HINH (xem anh-dai-dien.ts). Tam do thuong KHONG nam
 * trong thu muc da xu ly — do 05/11: 34/180 tam chua tung duoc nap — ma web lai
 * khong tu keo tu Drive duoc, nen bo qua no o day la o anh ra 502.
 *
 * Vi sao phai loc theo dong DANG CO trong bang, khong lay ca ban do thu muc:
 * ban do anh-thu-muc.json chi GOP THEM, khong bao gio tu xoa. Hom tab
 * Catalogue-OL rut tu 1.839 dong xuong 12, ban do van con 1.464 thu muc cu,
 * va tuyen thieu-anh — lap qua MOI thu muc trong ban do — cu the nap tiep anh
 * cua hang nghin mau da bi bo, dot han muc vao dung thu vua duoc yeu cau bo.
 *
 * Thu tu tra ve: theo thu tu dong trong bang; trong moi dong thi anh cot HINH
 * truoc roi toi anh trong thu muc — tam hien tren bang phai ve som nhat.
 * Mau o dau bang xong truoc.
 */
export function anhCanDongBo(
  dong: readonly { idThuMuc: string | null; fileIdAnh?: string | null }[],
  anhThuMuc: Readonly<Record<string, readonly { fileId: string }[]>>,
): string[] {
  const ketQua: string[] = [];
  const daCoAnh = new Set<string>();
  const daXetThuMuc = new Set<string>();

  const them = (fileId: string) => {
    if (daCoAnh.has(fileId)) return;
    daCoAnh.add(fileId);
    ketQua.push(fileId);
  };

  for (const d of dong) {
    // Anh cot HINH TRUOC anh trong thu muc: do la tam hien tren bang, tuc tam
    // nguoi dung thay dau tien. Nap sau thi o anh con vo trong luc ca thu muc
    // vai chuc tam da ve xong — dung thu tu nguoc voi cai mat nhin vao.
    //
    // Tam nay thuong KHONG nam trong thu muc da xu ly, nen bo qua no o day la
    // no khong bao gio duoc nap: web khong tu keo tu Drive duoc.
    if (d.fileIdAnh) them(d.fileIdAnh);

    if (!d.idThuMuc || daXetThuMuc.has(d.idThuMuc)) continue;
    daXetThuMuc.add(d.idThuMuc);
    // Thu muc chua duoc liet ke thi chua co gi de nap — khong phai loi, luot
    // dong bo thu muc sau se bo sung.
    for (const a of anhThuMuc[d.idThuMuc] ?? []) them(a.fileId);
  }
  return ketQua;
}
