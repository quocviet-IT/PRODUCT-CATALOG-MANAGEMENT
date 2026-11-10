/**
 * Link gui khach va tin nhan kem link — ham thuan, khong cham trinh duyet.
 *
 * Vi sao co tep nay (06/11/2026): tin SMS chi gom mot link hpcatalogue.app gui
 * tu RingCentral bi nha mang My tu choi ("Undelivered - Rejected"), trong khi
 * tin chu cung so, cung khach van toi. Ten mien hpcatalogue.app moi dang ky
 * (07/09/2026) va khong phai ten mien thuong hieu da khai voi nha mang
 * (hungphatusa.com, tu 2002) — bo loc spam chan dung kieu link do.
 *
 * Nen link gui khach duoc phep nam tren ten mien KHAC voi ten mien sale dang
 * mo: sale van dang nhap o hpcatalogue.app, con link chep ra thi nam o
 * NEXT_PUBLIC_DIA_CHI_LINK_KHACH (vi du https://catalogue.hungphatusa.com).
 */

/**
 * Goc (scheme + ten mien) cua link gui khach.
 *
 * Khai bao sai thi LUI ve ten mien trinh duyet chu khong nem loi: day la ham
 * chay tren man hinh cua sale, nem loi o day la sap ca bang danh sach. Viec
 * bao loi ro rang nam o parseEnv (src/lib/env.ts), phia may chu.
 */
export function chonGocLink(khaiBao: string | undefined, gocTrinhDuyet: string): string {
  if (!khaiBao) return gocTrinhDuyet;
  try {
    const url = new URL(khaiBao);
    if (url.protocol !== "https:" && url.protocol !== "http:") return gocTrinhDuyet;
    return url.origin;
  } catch {
    return gocTrinhDuyet;
  }
}

/**
 * Duong dan day du, khong dung /c/: /c/ van song de nhung link da gui khong
 * chet, nhung no la duong CHUYEN HUONG — chep no cho khach la vut di chinh cai
 * ten sale vua dat.
 */
export function duongDanCatalogue(goc: string, slug: string): string {
  return `${goc}/catalogue/${slug}`;
}

/**
 * Tin nhan mau de dan vao RingCentral, thay cho viec gui tran mot cai link.
 *
 * Moi chi tiet deu vi bo loc cua nha mang:
 * - Mo dau bang ten thuong hieu, giong cac tin hen lich van toi noi.
 * - Link dung rieng, khong dinh dau cau phia sau: may dien thoai gop dau "."
 *   vao link thi khach mo ra trang loi.
 * - Co cau "Reply STOP" — tin ban hang khong co cach tu choi rat de bi chan.
 * - Toan ASCII, tieng Anh: khach o My. Mot ky tu co dau la ca tin chuyen sang
 *   ma Unicode, 70 ky tu/doan thay vi 160.
 */
export function tinNhanGuiKhach(link: string): string {
  return `Hung Phat: here is the catalogue we prepared for you\n${link}\nReply STOP to opt out`;
}
