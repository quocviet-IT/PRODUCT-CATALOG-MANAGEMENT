import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { gopY, users } from "@/db/schema";
import type { LoaiGopY, TrangThaiGopY } from "./gop-y.model";

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
  taoLuc: Date;
};

export async function taoGopY(v: {
  loai: LoaiGopY;
  noiDung: string;
  duongDan: string;
  nguoiGuiId: string;
  nguoiGuiEmail: string;
}): Promise<void> {
  await db.insert(gopY).values({
    loai: v.loai,
    noiDung: v.noiDung.trim(),
    duongDan: v.duongDan,
    nguoiGuiId: v.nguoiGuiId,
    nguoiGuiEmail: v.nguoiGuiEmail,
  });
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
      taoLuc: gopY.createdAt,
    })
    .from(gopY)
    .leftJoin(users, eq(users.id, gopY.nguoiGuiId))
    .orderBy(desc(gopY.createdAt));
  return hang;
}

export async function datTrangThaiGopY(id: string, trangThai: TrangThaiGopY): Promise<void> {
  await db.update(gopY).set({ trangThai }).where(eq(gopY.id, id));
}
