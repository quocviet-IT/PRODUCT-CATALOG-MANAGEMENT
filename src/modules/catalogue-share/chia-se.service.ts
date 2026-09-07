import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { catalogues } from "@/db/schema";
import { layAnhCuaMau, layDanhSachCatalogue } from "@/modules/sheet/catalogue.service";
import type { AnhTrongThuMuc } from "@/modules/sheet/drive.client";
import {
  docNoiDung,
  dungNoiDung,
  khoaMau,
  type LuaChon,
  type NguonMau,
  type NoiDungCatalogue,
} from "./chia-se.model";

/**
 * Bang chu cai cua slug. Bo 0/O/1/I/l: slug nay duoc doc qua dien thoai va go
 * lai bang tay, mot cap ky tu nhin giong nhau la mot cu goi lai cho sale.
 */
const CHU_CAI = "23456789abcdefghjkmnpqrstuvwxyz";
const DAI_SLUG = 12;

/** 12 ky tu tren 31 chu cai ~ 59 bit — khong ai do trung duoc. */
export function sinhSlug(): string {
  const b = randomBytes(DAI_SLUG);
  let s = "";
  for (let i = 0; i < DAI_SLUG; i++) s += CHU_CAI[b[i] % CHU_CAI.length];
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
  ten: string;
  taoLuc: Date;
  noiDung: NoiDungCatalogue;
};

/**
 * Tao mot catalogue moi va tra ve slug.
 *
 * Anh chup duoc dung LAI O DAY tu du lieu that, khong nhan tu trinh duyet:
 * trinh duyet chi noi CHON MAU NAO va GIU ANH NAO. Nho vay khong ai gui len
 * duoc mot catalogue ghi sai trong luong vang hay bia ra mot ma mau.
 */
export async function taoCatalogue(ten: string, chon: LuaChon[]): Promise<string> {
  const nguon = await layNguonTheoMa(chon.map((c) => c.ma));
  const noiDung = dungNoiDung(nguon, chon);
  if (noiDung.muc.length === 0) throw new LoiCatalogueRong();

  const slug = sinhSlug();
  await db.insert(catalogues).values({
    slug,
    ten: ten.trim().slice(0, DAI_TEN_TOI_DA) || tenMacDinh(),
    noiDung,
  });
  return slug;
}

/** Ten goi y khi sale khong dat ten — van phai phan biet duoc trong danh sach. */
export function tenMacDinh(luc: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `Catalogue ${p(luc.getDate())}/${p(luc.getMonth() + 1)}/${luc.getFullYear()}`;
}

export async function layTheoSlug(slug: string): Promise<CatalogueDaLuu | null> {
  const [d] = await db.select().from(catalogues).where(eq(catalogues.slug, slug)).limit(1);
  if (!d) return null;
  const noiDung = docNoiDung(d.noiDung);
  if (!noiDung) {
    console.error(`[chia-se] noi dung catalogue ${slug} khong doc duoc`);
    return null;
  }
  return { slug: d.slug, ten: d.ten, taoLuc: d.createdAt, noiDung };
}
