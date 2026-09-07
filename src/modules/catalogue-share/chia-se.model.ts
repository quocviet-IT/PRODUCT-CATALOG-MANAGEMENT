import type { DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import type { AnhTrongThuMuc } from "@/modules/sheet/drive.client";

/**
 * Kieu du lieu cua mot catalogue gui khach, va ham thuan dung no.
 *
 * KHONG cham co so du lieu, khong cham mang. Nho vay moi quy tac "khach duoc
 * thay gi" deu kiem tra duoc bang test thay vi phai mo trinh duyet.
 */

export type AnhTrongCatalogue = { fileId: string; ten: string };

/**
 * Mot muc trong catalogue khach xem.
 *
 * Danh sach truong nay la RANH GIOI RIENG TU, khong phai tien tay chep tu
 * DongCatalogue. Nhung thu CO TINH bi bo lai: sku, mo, so (ma kho noi bo),
 * chiTiet (chuoi ky thuat kieu "DIARI: 18KW 11RD/0.637cts"), co (canh bao
 * chat luong du lieu), idThuMuc va urlThuMuc (loi vao Drive cong ty).
 * Them truong vao day la mot quyet dinh ve rieng tu, khong phai viec go them
 * mot dong cho tien.
 */
export type MucCatalogue = {
  maMau: string | null;
  loaiSp: string | null;
  chatLieu: string | null;
  mau: string | null;
  size: string | null;
  tlVang: number | null;
  anh: AnhTrongCatalogue[];
};

/**
 * phienBan de sau nay doi hinh dang van doc duoc catalogue cu. Catalogue da
 * gui cho khach thi khong sua duoc nua — no nam trong tin nhan Zalo cua ho —
 * nen bat buoc phai doc duoc mai ve sau.
 */
export type NoiDungCatalogue = { phienBan: 1; muc: MucCatalogue[] };

/** Mot lua chon cua sale: mot mau, kem nhung anh ho giu lai. */
export type LuaChon = { ma: string; anh: string[] };

/** Nguon de dung anh chup: dong bang tinh + thu vien anh cua no. */
export type NguonMau = { d: DongCatalogue; anh: AnhTrongThuMuc[] };

/**
 * Khoa dinh danh mot mau xuyen suot phien lam viec cua sale.
 *
 * Dung MA MAU chu khong dung so dong: bang tinh bi chen/xoa dong thuong xuyen,
 * chi can mot dong moi o giua la moi so dong ben duoi lech het, va gio hang
 * cua sale tro sang nhung mau khac ma khong bao gi.
 *
 * Dong khong co ma mau moi phai lui ve so dong — chap nhan duoc vi do la dong
 * du lieu chua hoan chinh, va no cung khong ton tai lau.
 */
export function khoaMau(d: DongCatalogue): string {
  return d.maMau ?? `dong-${d.dongSheet}`;
}

export const SO_MUC_TOI_DA = 100;

/**
 * Dung noi dung catalogue tu lua chon cua sale.
 *
 * Giu THU TU sale da chon, khong sap xep lai: ho xep mau theo y do khi tu van.
 *
 * Loc anh theo thu vien that su cua mau. Danh sach fileId den tu trinh duyet
 * nen khong tin duoc — khong loc thi mot yeu cau nguy tao co the nhet fileId
 * bat ky vao anh chup, bien catalogue thanh cho tro toi tep la.
 */
export function dungNoiDung(nguon: NguonMau[], chon: LuaChon[]): NoiDungCatalogue {
  const theoKhoa = new Map(nguon.map((n) => [khoaMau(n.d), n]));
  const muc: MucCatalogue[] = [];
  const daCo = new Set<string>();

  for (const c of chon) {
    if (muc.length >= SO_MUC_TOI_DA) break;
    // Chon trung mot mau hai lan thi chi lay lan dau — khach khong can thay
    // cung mot chiec nhan hai lan.
    if (daCo.has(c.ma)) continue;
    const n = theoKhoa.get(c.ma);
    if (!n) continue;
    daCo.add(c.ma);

    const giu = new Set(c.anh);
    muc.push({
      maMau: n.d.maMau,
      loaiSp: n.d.loaiSp,
      chatLieu: n.d.chatLieu,
      mau: n.d.mau,
      size: n.d.size,
      tlVang: n.d.tlVang,
      anh: n.anh.filter((a) => giu.has(a.fileId)).map((a) => ({ fileId: a.fileId, ten: a.ten })),
    });
  }

  return { phienBan: 1, muc };
}

/**
 * Ten hien cho nguoi doc.
 *
 * Sale duoc quyen khong dat ten — luc tu van gap gap, go them mot cai ten la
 * mot buoc thua. Khi do he thong goi no bang SO THU TU do co so du lieu cap.
 *
 * Truoc day ten mac dinh la "Catalogue <ngay>", va hai catalogue tao cung mot
 * ngay mang y het mot cai ten: mo danh sach ra khong biet cai nao la cai nao.
 * So thu tu thi khong bao gio trung, ke ca khi hai nguoi bam cung mot luc.
 */
export function tenHienThi(ten: string, so: number): string {
  const t = ten.trim();
  return t === "" ? `Catalogue #${so}` : t;
}

/** Mot muc tren man hinh tao catalogue: nhu muc khach xem, kem TOAN BO thu vien. */
export type MucDeChon = MucCatalogue & { ma: string };

/**
 * Du lieu cho man hinh tao catalogue.
 *
 * Dung CHUNG hinh dang voi muc khach xem — khong phai de tiet kiem code, ma de
 * sale nhin thay dung nhung gi khach se thay. Neu man nay hien them cot noi bo
 * thi sale se tuong khach cung thay chung.
 */
export function dungMucDeChon(nguon: NguonMau[]): MucDeChon[] {
  return nguon.map(({ d, anh }) => ({
    ma: khoaMau(d),
    maMau: d.maMau,
    loaiSp: d.loaiSp,
    chatLieu: d.chatLieu,
    mau: d.mau,
    size: d.size,
    tlVang: d.tlVang,
    anh: anh.map((a) => ({ fileId: a.fileId, ten: a.ten })),
  }));
}

/**
 * Doc lai noi dung tu cot JSONB. Du lieu trong cot do la thu CHINH ta ghi ra,
 * nhung van phai kiem: mot ban ghi cu hong hoac bi sua tay khong duoc phep lam
 * sap trang khach dang mo.
 */
export function docNoiDung(tho: unknown): NoiDungCatalogue | null {
  if (typeof tho !== "object" || tho === null) return null;
  const o = tho as { phienBan?: unknown; muc?: unknown };
  if (o.phienBan !== 1 || !Array.isArray(o.muc)) return null;
  return { phienBan: 1, muc: o.muc as MucCatalogue[] };
}
