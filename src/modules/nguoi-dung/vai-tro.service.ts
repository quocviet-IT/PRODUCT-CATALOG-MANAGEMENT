import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, vaiTro as bangVaiTro } from "@/db/schema";
import {
  MA_ADMIN,
  MA_SALE,
  maTuTen,
  type MucQuyen,
  type VaiTro,
} from "./nguoi-dung.model";

/**
 * Doc va sua DANH MUC vai tro. Tach khoi nguoi-dung.service.ts vi day la mot
 * bang khac va mot man hinh khac; tron vao mot tep thi tep do phinh ra thanh
 * "moi thu ve tai khoan".
 *
 * Khong dung Supabase Auth o day — vai tro thuan tuy la du lieu cua minh.
 */

export class LoiVaiTroDaTonTai extends Error {
  constructor(public readonly ma: string) {
    super(`Vai trò "${ma}" đã có rồi.`);
    this.name = "LoiVaiTroDaTonTai";
  }
}

export class LoiVaiTroDangCoNguoiGiu extends Error {
  constructor(public readonly soNguoi: number) {
    super(`Còn ${soNguoi} tài khoản đang giữ vai trò này.`);
    this.name = "LoiVaiTroDangCoNguoiGiu";
  }
}

export class LoiVaiTroHeThong extends Error {
  constructor() {
    super("Vai trò gốc của hệ thống không sửa hay xoá được.");
    this.name = "LoiVaiTroHeThong";
  }
}

export async function danhSachVaiTro(): Promise<VaiTro[]> {
  const hang = await db
    .select()
    .from(bangVaiTro)
    .orderBy(asc(bangVaiTro.thuTu), asc(bangVaiTro.ma));
  return hang.map((h) => ({
    ma: h.ma,
    ten: h.ten,
    tenEn: h.tenEn,
    mucQuyen: h.mucQuyen,
    heThong: h.heThong,
    thuTu: h.thuTu,
  }));
}

/** Bao nhieu tai khoan dang giu tung vai tro — man hinh can de canh bao truoc khi xoa. */
export async function demTheoVaiTro(): Promise<Record<string, number>> {
  const hang = await db.select({ ma: users.role }).from(users);
  const dem: Record<string, number> = {};
  for (const h of hang) dem[h.ma] = (dem[h.ma] ?? 0) + 1;
  return dem;
}

/**
 * Them mot vai tro moi.
 *
 * Ma suy ra tu ten va la khoa chinh, nen hai vai tro cung ten se dung do o
 * day chu khong lang le tao ban trung. Thong bao phai noi ro la TRUNG, vi
 * "Giám sát nội bộ" va "Giam sat noi bo" ra cung mot ma.
 */
export async function themVaiTro(v: {
  ten: string;
  tenEn: string;
  mucQuyen: MucQuyen;
}): Promise<string> {
  const ma = maTuTen(v.ten);
  const [da] = await db
    .select({ ma: bangVaiTro.ma })
    .from(bangVaiTro)
    .where(eq(bangVaiTro.ma, ma))
    .limit(1);
  if (da) throw new LoiVaiTroDaTonTai(ma);

  // Vai tro moi xep sau cung. Lay max+1 thay vi dem so hang: xoa mot vai tro
  // giua chung roi them cai moi thi dem se tra ve mot thu tu da co nguoi dung.
  const hang = await db.select({ thuTu: bangVaiTro.thuTu }).from(bangVaiTro);
  const sau = hang.reduce((m, h) => Math.max(m, h.thuTu), 0) + 1;

  await db.insert(bangVaiTro).values({
    ma,
    ten: v.ten.trim(),
    tenEn: v.tenEn.trim(),
    mucQuyen: v.mucQuyen,
    heThong: false,
    thuTu: sau,
  });
  return ma;
}

/**
 * Sua ten / muc quyen cua mot vai tro.
 *
 * Ma KHONG doi theo ten: ma nam trong cot users.role cua nhung nguoi dang giu
 * vai tro do, va doi ten hien thi khong phai la ly do de dong loat viet lai ho
 * so cua ho. Doi ten "Sale" thanh "Kinh doanh" chi doi cai hien tren man hinh.
 *
 * Vai tro he thong chi cho doi TEN, khong cho doi muc quyen — ha muc quyen cua
 * `admin` la khong con ai vao duoc man hinh quan tri nua.
 */
export async function suaVaiTro(
  ma: string,
  v: { ten: string; tenEn: string; mucQuyen: MucQuyen },
): Promise<void> {
  const [cu] = await db.select().from(bangVaiTro).where(eq(bangVaiTro.ma, ma)).limit(1);
  if (!cu) throw new LoiVaiTroDaTonTai(ma);
  if (cu.heThong && v.mucQuyen !== cu.mucQuyen) throw new LoiVaiTroHeThong();

  await db
    .update(bangVaiTro)
    .set({
      ten: v.ten.trim(),
      tenEn: v.tenEn.trim(),
      mucQuyen: cu.heThong ? cu.mucQuyen : v.mucQuyen,
    })
    .where(eq(bangVaiTro.ma, ma));
}

/**
 * Xoa mot vai tro.
 *
 * Khoa ngoai o users.role la ON DELETE RESTRICT, nen Postgres cung se chan.
 * Kiem o day truoc de admin nhan duoc cau "con 3 nguoi dang giu" thay vi mot
 * loi rang buoc khoa ngoai khong ai doc duoc.
 */
export async function xoaVaiTro(ma: string): Promise<void> {
  if (ma === MA_ADMIN || ma === MA_SALE) throw new LoiVaiTroHeThong();

  const [cu] = await db.select().from(bangVaiTro).where(eq(bangVaiTro.ma, ma)).limit(1);
  if (!cu) return;
  if (cu.heThong) throw new LoiVaiTroHeThong();

  const dem = await demTheoVaiTro();
  const soNguoi = dem[ma] ?? 0;
  if (soNguoi > 0) throw new LoiVaiTroDangCoNguoiGiu(soNguoi);

  await db.delete(bangVaiTro).where(eq(bangVaiTro.ma, ma));
}
