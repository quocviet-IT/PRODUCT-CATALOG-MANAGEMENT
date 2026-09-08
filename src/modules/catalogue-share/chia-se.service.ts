import { randomBytes } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { catalogues, users } from "@/db/schema";
import { layAnhCuaMau, layDanhSachCatalogue } from "@/modules/sheet/catalogue.service";
import type { AnhTrongThuMuc } from "@/modules/sheet/drive.client";
import {
  docNoiDung,
  dungNoiDung,
  dungSlug,
  khoaMau,
  tenHienThi,
  type LuaChon,
  type NguonMau,
  type NoiDungCatalogue,
} from "./chia-se.model";
import { docGiaoDien, type GiaoDienCatalogue } from "./giao-dien.model";

/**
 * Bang chu cai cua slug. Bo 0/O/1/I/l: slug nay duoc doc qua dien thoai va go
 * lai bang tay, mot cap ky tu nhin giong nhau la mot cu goi lai cho sale.
 */
const CHU_CAI = "23456789abcdefghjkmnpqrstuvwxyz";
const DAI_DUOI = 8;

/**
 * Duoi ngau nhien gan sau phan ten trong duong dan.
 *
 * 8 ky tu tren 31 chu cai ~ 40 bit. Ke muon do phai thu hang ty lan de trung
 * MOT catalogue — trong khi phan ten dung truoc lai giup nguoi nhan doc hieu
 * link. Do la ly do co ca hai phan.
 */
export function sinhDuoi(): string {
  const b = randomBytes(DAI_DUOI);
  let s = "";
  for (let i = 0; i < DAI_DUOI; i++) s += CHU_CAI[b[i] % CHU_CAI.length];
  return s;
}

export const DAI_TEN_TOI_DA = 120;

export class LoiCatalogueRong extends Error {
  constructor() {
    super("Catalogue phải có ít nhất một mẫu.");
    this.name = "LoiCatalogueRong";
  }
}

/**
 * Lay dong bang tinh + thu vien anh cho mot loat ma mau.
 *
 * Doc thu vien anh SONG SONG: 20 mau ma goi tuan tu thi man hinh tao catalogue
 * doi hang chuc giay. layAnhCuaMau co bo dem 10 phut nen goi lai khong ton kem.
 */
export async function layNguonTheoMa(ma: string[]): Promise<NguonMau[]> {
  const canLay = new Set(ma);
  const ds = (await layDanhSachCatalogue()).filter((d) => canLay.has(khoaMau(d)));

  return Promise.all(
    ds.map(async (d) => {
      if (!d.idThuMuc) return { d, anh: [] as AnhTrongThuMuc[] };
      try {
        return { d, anh: await layAnhCuaMau(d.idThuMuc) };
      } catch (loi) {
        // Mot thu muc hong khong duoc lam hong ca man hinh tao catalogue —
        // sale van chon duoc cac mau khac.
        console.error(`[chia-se] loi doc thu muc anh ${d.idThuMuc}:`, loi);
        return { d, anh: [] as AnhTrongThuMuc[] };
      }
    }),
  );
}

export type CatalogueDaLuu = {
  slug: string;
  /** Da qua tenHienThi() — noi nao hien ten thi dung thang cai nay. */
  ten: string;
  so: number;
  taoLuc: Date;
  noiDung: NoiDungCatalogue;
  giaoDien: GiaoDienCatalogue;
};

/**
 * Tao mot catalogue moi va tra ve slug.
 *
 * Anh chup duoc dung LAI O DAY tu du lieu that, khong nhan tu trinh duyet:
 * trinh duyet chi noi CHON MAU NAO va GIU ANH NAO. Nho vay khong ai gui len
 * duoc mot catalogue ghi sai trong luong vang hay bia ra mot ma mau.
 */
export async function taoCatalogue(
  ten: string,
  chon: LuaChon[],
  giaoDien: GiaoDienCatalogue,
  ownerId: string | null,
): Promise<{ slug: string; ten: string }> {
  const nguon = await layNguonTheoMa(chon.map((c) => c.ma));
  const noiDung = dungNoiDung(nguon, chon);
  if (noiDung.muc.length === 0) throw new LoiCatalogueRong();

  // Ten RONG duoc phep luu nguyen: khong bia ten thay sale o day. Cho hien thi
  // se goi no theo so thu tu — xem tenHienThi().
  //
  // Ghi TRUOC roi moi dat duong dan, vi duong dan cua catalogue khong ten can
  // biet `so` — ma `so` chi co sau khi Postgres cap. Duoi ngau nhien duoc dung
  // lam duong dan tam: no da duy nhat va da khong doan duoc, nen neu buoc dat
  // ten ben duoi that bai thi link van chay, chi la kem dep.
  const duoi = sinhDuoi();
  const [moi] = await db
    .insert(catalogues)
    .values({
      slug: duoi,
      ten: ten.trim().slice(0, DAI_TEN_TOI_DA),
      noiDung,
      giaoDien,
      ownerId,
    })
    .returning({ id: catalogues.id, so: catalogues.so, ten: catalogues.ten });

  const slug = dungSlug(moi.ten, moi.so, duoi);
  try {
    await db.update(catalogues).set({ slug }).where(eq(catalogues.id, moi.id));
  } catch (loi) {
    console.error(`[chia-se] khong dat duoc duong dan cho catalogue #${moi.so}:`, loi);
    return { slug: duoi, ten: tenHienThi(moi.ten, moi.so) };
  }
  return { slug, ten: tenHienThi(moi.ten, moi.so) };
}

export async function layTheoSlug(slug: string): Promise<CatalogueDaLuu | null> {
  const [d] = await db.select().from(catalogues).where(eq(catalogues.slug, slug)).limit(1);
  if (!d) return null;
  const noiDung = docNoiDung(d.noiDung);
  if (!noiDung) {
    console.error(`[chia-se] noi dung catalogue ${slug} khong doc duoc`);
    return null;
  }
  return {
    slug: d.slug,
    ten: tenHienThi(d.ten, d.so),
    so: d.so,
    taoLuc: d.createdAt,
    noiDung,
    giaoDien: docGiaoDien(d.giaoDien),
  };
}

/** Mot dong tren man hinh "catalogue da tao". */
export type DongDanhSach = {
  slug: string;
  ten: string;
  so: number;
  taoLuc: Date;
  soMuc: number;
  soAnh: number;
  /** Email nguoi tao. null khi catalogue tao thoi chua bat dang nhap. */
  nguoiTao: string | null;
};

/** Toi da mot trang danh sach. Sale nao vuot con so nay thi tinh tiep. */
export const MOI_TRANG = 200;

/**
 * Danh sach catalogue da tao.
 *
 * `xemHet` la quyen, khong phai tuy chon giao dien: admin thay moi catalogue,
 * sale chi thay cua minh. Loc ngay trong cau truy van chu khong loc sau khi
 * lay ve — lay het roi mai an di la mot cach ro ri du lieu.
 *
 * Dem so muc va so anh doc tu ban chup nen luon dung voi cai khach dang thay,
 * ke ca khi bang tinh da doi tu do den nay.
 */
export async function danhSachCatalogue(
  idNguoi: string,
  xemHet: boolean,
): Promise<DongDanhSach[]> {
  const truyVan = db
    .select({
      slug: catalogues.slug,
      ten: catalogues.ten,
      so: catalogues.so,
      taoLuc: catalogues.createdAt,
      noiDung: catalogues.noiDung,
      nguoiTao: users.email,
    })
    .from(catalogues)
    .leftJoin(users, eq(users.id, catalogues.ownerId))
    .orderBy(desc(catalogues.createdAt))
    .limit(MOI_TRANG);

  const ds = xemHet
    ? await truyVan
    : await truyVan.where(eq(catalogues.ownerId, idNguoi));

  return ds.map((d) => {
    const nd = docNoiDung(d.noiDung);
    const muc = nd?.muc ?? [];
    return {
      slug: d.slug,
      ten: tenHienThi(d.ten, d.so),
      so: d.so,
      taoLuc: d.taoLuc,
      soMuc: muc.length,
      soAnh: muc.reduce((t, m) => t + m.anh.length, 0),
      nguoiTao: d.nguoiTao,
    };
  });
}
