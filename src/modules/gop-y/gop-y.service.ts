import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { gopY, users } from "@/db/schema";
import { ghiTep, taiVe } from "@/modules/media/storage";
import { tachDataUrl, type LoaiGopY, type TrangThaiGopY } from "./gop-y.model";

export type GopYHang = {
  id: string;
  loai: LoaiGopY;
  noiDung: string;
  trangThai: TrangThaiGopY;
  duongDan: string;
  /** Email chep luc gui — con doc duoc ke ca khi tai khoan da bi xoa. */
  nguoiGuiEmail: string;
  /** Ho ten hien tai; null khi tai khoan da bi xoa. */
  hoTen: string | null;
  /** true khi co anh chup man hinh — KHONG tra khoa ra ngoai. */
  coAnh: boolean;
  taoLuc: Date;
};

/**
 * Ghi mot gop y, kem anh chup man hinh neu co.
 *
 * Ghi dong TRUOC roi moi up anh: neu up anh hong (Storage tra loi, anh sai
 * dang) thi gop y VAN duoc luu, chi mat cai anh. Lam nguoc lai — up truoc, hong
 * thi bo ca — la vut di dung cai thong tin nguoi ta bo cong go.
 */
export async function taoGopY(v: {
  loai: LoaiGopY;
  noiDung: string;
  duongDan: string;
  nguoiGuiId: string;
  nguoiGuiEmail: string;
  /** Data URL tu canvas, hoac chuoi rong. */
  anh?: string;
}): Promise<{ luuDuocAnh: boolean }> {
  const [dong] = await db
    .insert(gopY)
    .values({
      loai: v.loai,
      noiDung: v.noiDung.trim(),
      duongDan: v.duongDan,
      nguoiGuiId: v.nguoiGuiId,
      nguoiGuiEmail: v.nguoiGuiEmail,
    })
    .returning({ id: gopY.id });

  const tho = v.anh ?? "";
  if (tho === "") return { luuDuocAnh: false };

  const tach = tachDataUrl(tho);
  if (!tach) {
    console.error("[gop-y] anh khong dung dang data URL, bo qua");
    return { luuDuocAnh: false };
  }

  const duoi = tach.kieu.split("/")[1];
  const khoa = `gop-y/${dong.id}.${duoi}`;
  try {
    await ghiTep(khoa, tach.byte, tach.kieu);
    await db.update(gopY).set({ anh: khoa }).where(eq(gopY.id, dong.id));
    return { luuDuocAnh: true };
  } catch (e) {
    console.error("[gop-y] khong luu duoc anh:", e);
    return { luuDuocAnh: false };
  }
}

/**
 * Doc anh cua mot gop y. Tra null khi gop y khong co anh.
 *
 * Nguoi goi PHAI tu chan quyen truoc — ham nay khong biet ai dang hoi.
 */
export async function docAnhGopY(
  id: string,
): Promise<{ byte: Buffer; kieu: string } | null> {
  const [dong] = await db.select({ anh: gopY.anh }).from(gopY).where(eq(gopY.id, id)).limit(1);
  if (!dong?.anh) return null;
  const duoi = dong.anh.split(".").pop() ?? "png";
  return { byte: await taiVe(dong.anh), kieu: `image/${duoi === "jpg" ? "jpeg" : duoi}` };
}

/**
 * Danh sach gop y, moi nhat truoc.
 *
 * Noi sang bang users de lay ho ten cho de doc, nhung dung LEFT JOIN: khoa
 * ngoai la SET NULL nen mot gop y cua nguoi da nghi viec van phai hien ra —
 * INNER JOIN o day la lang le nuot mat chinh nhung gop y cu nhat.
 */
export async function danhSachGopY(): Promise<GopYHang[]> {
  const hang = await db
    .select({
      id: gopY.id,
      loai: gopY.loai,
      noiDung: gopY.noiDung,
      trangThai: gopY.trangThai,
      duongDan: gopY.duongDan,
      nguoiGuiEmail: gopY.nguoiGuiEmail,
      hoTen: users.fullName,
      anh: gopY.anh,
      taoLuc: gopY.createdAt,
    })
    .from(gopY)
    .leftJoin(users, eq(users.id, gopY.nguoiGuiId))
    .orderBy(desc(gopY.createdAt));
  // Chi tra CO hay KHONG, khong tra khoa Storage: khoa lot ra man hinh la mot
  // buoc gan hon toi cho co nguoi doan duong dan that cua anh.
  return hang.map(({ anh, ...con }) => ({ ...con, coAnh: anh !== null }));
}

export async function datTrangThaiGopY(id: string, trangThai: TrangThaiGopY): Promise<void> {
  await db.update(gopY).set({ trangThai }).where(eq(gopY.id, id));
}
