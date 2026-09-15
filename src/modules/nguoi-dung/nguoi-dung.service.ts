import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { getEnv } from "@/lib/env";
import {
  gopLanCuoiVao,
  mucHoatDong,
  suyRaCachDangNhap,
  type CachDangNhap,
  type MucHoatDong,
} from "./nguoi-dung.model";

/**
 * Quan tri tai khoan. CHI chay o may chu — "server-only" o dau tep khien build
 * gay ngay neu co ai lo import tep nay vao mot client component, vi no cam
 * khoa SUPABASE_SECRET_KEY (quyen cao nhat cua du an).
 */

let kho: SupabaseClient | null = null;

function layKho(): SupabaseClient {
  if (kho) return kho;
  const env = getEnv();
  kho = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return kho;
}

export type NguoiDungHang = {
  id: string;
  email: string;
  hoTen: string;
  /** Ma vai tro (vai_tro.ma). Ten hien thi tra trong danh sach vai tro. */
  vaiTro: string;
  dangHoatDong: boolean;
  taoLuc: Date;
  /** Suy ra tu Supabase Auth; null khi khong doc duoc phia Auth. */
  cachDangNhap: CachDangNhap | null;
  /**
   * Moc muon hon giua lan cuoi dung he thong (users.last_seen_at) va lan cuoi dang
   * nhap (Supabase Auth). null khi chua co ca hai.
   */
  lanCuoiVao: Date | null;
  /** Tinh san o may chu — bang tai khoan la client component, chi hien thi. */
  mucHoatDong: MucHoatDong;
};

/** Toi da mot trang danh sach nguoi dung — cong ty nay khong toi muc do. */
const MOI_TRANG_AUTH = 200;

/**
 * Danh sach tai khoan.
 *
 * Ghep hai nguon: bang `users` (vai tro, trang thai, lan cuoi hoat dong — do minh
 * quan ly) va Supabase Auth (cach dang nhap, lan cuoi dang nhap — do Supabase quan
 * ly). Bang `users` la nguon THAT cua danh sach; Auth chi bo sung. Neu goi Auth
 * hong thi van hien du danh sach: cot cach dang nhap de trong, lan cuoi vao va cham
 * mau chi con dua vao lan cuoi hoat dong — mot man hinh quan tri khong duoc trang
 * chi vi mot loi phu.
 */
export async function danhSachNguoiDung(): Promise<NguoiDungHang[]> {
  const hoSo = await db.select().from(users).orderBy(asc(users.email));

  let theoId = new Map<string, { providers: string[]; lanCuoi: string | null }>();
  try {
    const { data, error } = await layKho().auth.admin.listUsers({
      page: 1,
      perPage: MOI_TRANG_AUTH,
    });
    if (error) throw error;
    theoId = new Map(
      data.users.map((u) => [
        u.id,
        {
          providers: (u.app_metadata?.providers as string[] | undefined) ?? [],
          lanCuoi: u.last_sign_in_at ?? null,
        },
      ]),
    );
  } catch (loi) {
    console.error("[nguoi-dung] khong doc duoc Supabase Auth:", loi);
  }

  // MOT moc bayGio cho ca danh sach, tinh o may chu: bang la client component, tinh
  // lai o trinh duyet thi luc dung o may chu va luc nap lai co the lech nhau mot muc.
  const bayGio = new Date();
  return hoSo.map((h) => {
    const a = theoId.get(h.id);
    const lanCuoiVao = gopLanCuoiVao(h.lastSeenAt, a?.lanCuoi ? new Date(a.lanCuoi) : null);
    return {
      id: h.id,
      email: h.email,
      hoTen: h.fullName,
      vaiTro: h.role,
      dangHoatDong: h.isActive,
      taoLuc: h.createdAt,
      cachDangNhap: a ? suyRaCachDangNhap(a.providers) : null,
      lanCuoiVao,
      mucHoatDong: mucHoatDong(lanCuoiVao, bayGio),
    };
  });
}

export class LoiEmailDaTonTai extends Error {
  constructor() {
    super("Email này đã có tài khoản.");
    this.name = "LoiEmailDaTonTai";
  }
}

/**
 * Tao tai khoan dang nhap bang mat khau.
 *
 * email_confirm: true — admin tu tay tao thi khong bat nguoi ta di xac nhan
 * email; ho nhan mat khau truc tiep tu admin.
 *
 * Hai buoc (Auth roi bang users) khong nam trong mot giao dich: neu buoc hai
 * hong thi Auth con lai mot tai khoan khong co ho so — nguoi do dang nhap
 * duoc nhung getSessionUser tra null nen KHONG vao duoc, va admin tao lai se
 * gap LoiEmailDaTonTai. Do la ly do thong bao loi phai noi ro dieu do.
 */
export async function taoTaiKhoan(v: {
  email: string;
  matKhau: string;
  hoTen: string;
  /** Ma vai tro. Khoa ngoai se tu choi neu vai tro nay khong ton tai. */
  vaiTro: string;
}): Promise<void> {
  const email = v.email.trim().toLowerCase();
  const { data, error } = await layKho().auth.admin.createUser({
    email,
    password: v.matKhau,
    email_confirm: true,
  });
  if (error) {
    if (/already|exists|registered/i.test(error.message)) throw new LoiEmailDaTonTai();
    throw error;
  }

  await db
    .insert(users)
    .values({ id: data.user.id, email, fullName: v.hoTen.trim(), role: v.vaiTro })
    .onConflictDoNothing({ target: users.id });
}

/**
 * Dat mat khau moi cho mot tai khoan.
 *
 * Dung duoc ca cho tai khoan dang chi dang nhap bang Google: sau buoc nay ho
 * co CA HAI duong vao, khong mat duong nao.
 */
export async function doiMatKhau(id: string, matKhau: string): Promise<void> {
  const { error } = await layKho().auth.admin.updateUserById(id, { password: matKhau });
  if (error) throw error;
}

/**
 * Khoa / mo khoa mot tai khoan.
 *
 * Nguon that la cot is_active cua bang `users`: guard doc no o MOI yeu cau nen
 * nguoi bi khoa mat quyen ngay lap tuc, khong phai cho phien het han.
 */
export async function datTrangThai(id: string, dangHoatDong: boolean): Promise<void> {
  await db.update(users).set({ isActive: dangHoatDong }).where(eq(users.id, id));
}

export async function datVaiTro(id: string, vaiTro: string): Promise<void> {
  await db.update(users).set({ role: vaiTro }).where(eq(users.id, id));
}
