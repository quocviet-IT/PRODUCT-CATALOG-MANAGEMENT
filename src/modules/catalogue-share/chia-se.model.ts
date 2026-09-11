import { boDau } from "@/lib/vietnamese";
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
  // Cung mot phep chon dong voi man hinh chon (chonDongTotNhat): sale xem
  // truoc thay gi thi khach phai thay dung the.
  const theoKhoa = new Map(chonDongTotNhat(nguon).map((n) => [khoaMau(n.d), n]));
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

/** Do dai toi da cua PHAN TEN trong duong dan. Du de doc, khong lam dai link. */
export const DAI_PHAN_TEN = 60;

/**
 * Doi mot cau tieng Viet thanh phan duong dan doc duoc: bo dau, chu thuong,
 * moi cum ky tu khong phai chu-so thanh mot dau gach.
 *
 * Tra ve chuoi RONG khi khong con gi (ten toan ky tu la, hay toan emoji) —
 * nguoi goi phai tu lo truong hop do.
 */
export function chuanHoaSlug(s: string): string {
  return boDau(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, DAI_PHAN_TEN)
    // Cat theo do dai co the de lai mot dau gach o cuoi.
    .replace(/-+$/g, "");
}

/**
 * Duong dan cua mot catalogue: <phan doc duoc>-<duoi ngau nhien>.
 *
 * Vi sao van phai co duoi ngau nhien du da co phan doc duoc: link nay gui rieng
 * cho MOT khach. Neu duong dan doan duoc (vi du chi la so thu tu, hay dung ten
 * khach khong kem gi) thi mot nguoi co the mo catalogue cua nguoi khac chi bang
 * cach sua thanh dia chi.
 *
 * Catalogue khong dat ten thi goi theo so — trung voi cach no hien tren trang.
 */
export function dungSlug(ten: string, so: number, duoi: string): string {
  const phanTen = chuanHoaSlug(ten) || `catalogue-${so}`;
  return `${phanTen}-${duoi}`;
}

/**
 * Ma khong doan duoc cua mot duong dan: cum ky tu sau dau gach CUOI CUNG.
 *
 * Day moi la phan DINH DANH cua catalogue — phan ten dung truoc chi de doc. Nho
 * vay sale doi ten link duoc ma link cu da gui khach van tim ra dung catalogue:
 * hai duong dan cung ma la cung mot catalogue.
 *
 * Slug doi cu ("zxhpnhyrtpu3", 12 ky tu lien, khong dau gach): ca chuoi la ma.
 */
export function maCuaSlug(slug: string): string {
  const i = slug.lastIndexOf("-");
  return i === -1 ? slug : slug.slice(i + 1);
}

/** Phan ten doc duoc cua duong dan, de dien san vao o doi ten. Slug doi cu: rong. */
export function phanTenCuaSlug(slug: string): string {
  const i = slug.lastIndexOf("-");
  return i === -1 ? "" : slug.slice(0, i);
}

/**
 * Ma ngan nhat duoc dem di tim catalogue. Ma that dai 8 (slug moi) hoac 12 (slug
 * doi cu); chan duoi 8 de mot duong dan go bay kieu "abc-x" khong thanh mot lan do
 * tren ca bang.
 */
export const DAI_MA_TOI_THIEU = 8;

/**
 * Duong dan moi khi sale doi ten link: ten moi + GIU NGUYEN ma cu.
 *
 * null khi ten moi khong con chu hay so nao sau khi bo dau (toan ky tu la, toan
 * emoji) — khong tu bia mot ten thay sale.
 */
export function slugDoiTen(slugCu: string, tenLink: string): string | null {
  const phanTen = chuanHoaSlug(tenLink);
  return phanTen ? `${phanTen}-${maCuaSlug(slugCu)}` : null;
}

/** Mot muc tren man hinh tao catalogue: nhu muc khach xem, kem TOAN BO thu vien. */
export type MucDeChon = MucCatalogue & { ma: string };

/**
 * Nhieu dong bang tinh CUNG mot ma mau thi chon lay MOT dong.
 *
 * VI SAO CO TINH HUONG NAY: khoa chon la ma mau (xem khoaMau), nhung bang tinh
 * co 202/1.591 ma mau trai tren nhieu dong — cung mot mau, khac trong luong hay
 * khac size. Man hinh chon va trang khach deu hien MOT the cho moi ma.
 *
 * VI SAO PHAI CHON CO CHU DICH: truoc day hai cho deu dung
 * `new Map(nguon.map(n => [khoaMau(n.d), n]))`, ma Map thi giu lai cai CUOI
 * CUNG. Dong cuoi trong bang tinh khong co ly do gi de la dong tot nhat — va
 * that su thi mau C10045 co hai dong: dong 69 co thu muc 4 anh, dong 615 co
 * mot thu muc rong. Sale tich chon, mo ra thay "Mau nay chua co anh nao",
 * trong khi anh van nam day. Bon ma mau dang bi nhu vay.
 *
 * Thu tu uu tien: CO ANH truoc — day la thu nguoi dung mat khi chon nham dong;
 * roi den dong khai bao day du hon; cuoi cung la dong dau trong bang tinh, de
 * ket qua on dinh chu khong doi theo tung lan doc.
 */
function doDayDu(d: DongCatalogue): number {
  return [d.sku, d.so, d.mo, d.chiTiet, d.loaiSp, d.dongSp, d.chatLieu, d.mau, d.size,
          d.tlVang, d.moTa1, d.moTa2, d.urlThuMuc]
    .filter((v) => v !== null && v !== "").length;
}

export function chonDongTotNhat(nguon: NguonMau[]): NguonMau[] {
  const nhom = new Map<string, NguonMau[]>();
  for (const n of nguon) {
    const k = khoaMau(n.d);
    const cu = nhom.get(k);
    if (cu) cu.push(n);
    else nhom.set(k, [n]);
  }

  return [...nhom.values()].map((ds) =>
    ds.reduce((tot, n) =>
      n.anh.length !== tot.anh.length ? (n.anh.length > tot.anh.length ? n : tot)
      : doDayDu(n.d) !== doDayDu(tot.d) ? (doDayDu(n.d) > doDayDu(tot.d) ? n : tot)
      : n.d.dongSheet < tot.d.dongSheet ? n : tot,
    ),
  );
}

/**
 * Du lieu cho man hinh tao catalogue.
 *
 * Dung CHUNG hinh dang voi muc khach xem — khong phai de tiet kiem code, ma de
 * sale nhin thay dung nhung gi khach se thay. Neu man nay hien them cot noi bo
 * thi sale se tuong khach cung thay chung.
 */
export function dungMucDeChon(nguon: NguonMau[]): MucDeChon[] {
  return chonDongTotNhat(nguon).map(({ d, anh }) => ({
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
