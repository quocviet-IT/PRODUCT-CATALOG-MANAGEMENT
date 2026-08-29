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

/** Keo nut vao chinh no hoac vao mot to tien cua no se tao vong lap. */
export function taoVongLap(pathNut: string, idChaMoi: string): boolean {
  return pathNut.split("/").filter(Boolean).includes(idChaMoi);
}
