/**
 * Duong dan cay danh muc luu dang "/id-goc/id-con/id-nay/".
 * Dinh dang nay cho phep loc toan bo nhanh con bang mot dieu kien LIKE '/a/%',
 * khong can truy van de quy.
 */

export function dungPath(pathCha: string | null, id: string): string {
  return pathCha === null ? `/${id}/` : `${pathCha}${id}/`;
}

export function laToTien(path: string): string[] {
  const phan = path.split("/").filter(Boolean);
  return phan.slice(0, -1);
}

export function laConCua(path: string, pathCha: string): boolean {
  return path.startsWith(pathCha) && path.length > pathCha.length;
}

export function doiPathKhiChuyenNhanh(
  pathCu: string,
  pathGocCu: string,
  pathGocMoi: string,
): string {
  return pathGocMoi + pathCu.slice(pathGocCu.length);
}

/**
 * Kiem tra viec chuyen mot nut vao mot vi tri dich co tao vong lap khong.
 *
 * CHIEU GOI RAT QUAN TRONG — RAT DE BI GOI NGUOC. Dung dung thu tu nay:
 *   taoVongLap(<path cua DICH DEN>, <id cua nut DANG DI CHUYEN>)
 *
 * Vong lap xay ra khi dich den chinh la nut do, hoac la CON CHAU cua no —
 * tuc id cua nut dang di chuyen xuat hien trong path cua dich den.
 *
 * Vi du cay a -> b:
 *   taoVongLap("/a/b/", "a") === true   // keo a xuong duoi con b cua no: vong lap
 *   taoVongLap("/a/", "b")   === false  // keo b len duoi cha a: hop le
 *
 * Goi nguoc thu tu se tra ve false cho dung truong hop vong lap that,
 * tuc la mo cong cho cay tu tach nhanh ma khong bao loi.
 */
export function taoVongLap(pathDich: string, idNutDangDi: string): boolean {
  return pathDich.split("/").filter(Boolean).includes(idNutDangDi);
}
