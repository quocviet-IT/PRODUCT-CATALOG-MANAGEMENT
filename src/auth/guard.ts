import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, vaiTro } from "@/db/schema";
import type { MucQuyen } from "@/modules/nguoi-dung/nguoi-dung.model";
import { taoSupabaseServer } from "./supabase-server";

export type NguoiDung = {
  id: string;
  email: string;
  fullName: string;
  /** Ma vai tro — de HIEN THI. Dung no de phan quyen la sai; xem mucQuyen. */
  role: string;
  /**
   * Bac quyen thuc su, tra tu bang vai_tro.
   *
   * Tach khoi `role` vi tu 09/2026 vai tro la du lieu: admin tu them duoc
   * "GSNB", "R&D"... Moi cua gac PHAI hoi cot nay, khong duoc so sanh `role`
   * voi chuoi "admin" — mot vai tro moi ten khac nhung mang muc quyen admin se
   * bi cho ra ngoai, con nguoc lai thi te hon.
   */
  mucQuyen: MucQuyen;
  isActive: boolean;
};

export type KetQuaQuyen =
  | { cho_phep: true; user: NguoiDung }
  | { cho_phep: false; ly_do: "chua_dang_nhap" | "bi_vo_hieu_hoa" | "khong_du_quyen" };

/** Toan bo quy tac phan quyen nam o day — ham thuan, khong cham Next.js. */
export function kiemTraQuyen(user: NguoiDung | null, canAdmin: boolean): KetQuaQuyen {
  if (user === null) return { cho_phep: false, ly_do: "chua_dang_nhap" };
  if (!user.isActive) return { cho_phep: false, ly_do: "bi_vo_hieu_hoa" };
  if (canAdmin && user.mucQuyen !== "admin") return { cho_phep: false, ly_do: "khong_du_quyen" };
  return { cho_phep: true, user };
}

/**
 * Ho so nguoi dang dang nhap. MOT lan cho MOI yeu cau — `cache` cua React ghi
 * nho ket qua trong pham vi mot yeu cau.
 *
 * Vi sao phai boc: Next dung khung (layout) va trang SONG SONG, ma ca hai deu
 * goi cua gac — layout goi requireUser(), trang goi requireAdmin(). Khong boc
 * thi moi lan mo mot trang quan tri la HAI cau truy vấn y het nhau chay cung
 * luc tren CUNG MOT ket noi (db/client.ts giu max: 1).
 *
 * Ngay 10/09/2026 chinh cho nay da lam sap khu quan tri tren ban chay that:
 * tren production con lai nhung phien Postgres ket cung o trang thai
 * `active / Client:ClientRead`, chay dung cau truy van nay, ket chin phut khong
 * tu thoat. Moi phien ket la mot ban ham nhiem doc, va MOI yeu cau roi vao ban
 * do deu treo — ke ca trang cong khai khong lien quan. Chay rieng le thi cau
 * nay luon duoi 550ms; chi vo khi don cung luc tren mot ket noi.
 *
 * Bot mot truy van moi yeu cau la bot mot nua co hoi don cung luc.
 */
export const getSessionUser = cache(async (): Promise<NguoiDung | null> => {
  const supabase = await taoSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  // Noi bang vai_tro ngay tai day: muc quyen phai di cung ho so trong CUNG
  // mot luot doc, khong phai mot truy van thu hai co the that bai rieng va de
  // lai mot nguoi dung khong ai biet duoc phep lam gi.
  const [ho_so] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      mucQuyen: vaiTro.mucQuyen,
      isActive: users.isActive,
    })
    .from(users)
    .innerJoin(vaiTro, eq(vaiTro.ma, users.role))
    .where(eq(users.id, data.user.id))
    .limit(1);
  if (!ho_so) return null;
  return ho_so;
});

async function chot(canAdmin: boolean): Promise<NguoiDung> {
  const kq = kiemTraQuyen(await getSessionUser(), canAdmin);
  if (kq.cho_phep) return kq.user;
  if (kq.ly_do === "khong_du_quyen") redirect("/admin?loi=khong_du_quyen");
  redirect(`/login?loi=${kq.ly_do}`);
}

export const requireUser = () => chot(false);
export const requireAdmin = () => chot(true);
