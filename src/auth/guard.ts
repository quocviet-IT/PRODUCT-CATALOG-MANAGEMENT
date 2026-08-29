import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { taoSupabaseServer } from "./supabase-server";

export type NguoiDung = {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "sale";
  isActive: boolean;
};

export type KetQuaQuyen =
  | { cho_phep: true; user: NguoiDung }
  | { cho_phep: false; ly_do: "chua_dang_nhap" | "bi_vo_hieu_hoa" | "khong_du_quyen" };

/** Toan bo quy tac phan quyen nam o day — ham thuan, khong cham Next.js. */
export function kiemTraQuyen(user: NguoiDung | null, canAdmin: boolean): KetQuaQuyen {
  if (user === null) return { cho_phep: false, ly_do: "chua_dang_nhap" };
  if (!user.isActive) return { cho_phep: false, ly_do: "bi_vo_hieu_hoa" };
  if (canAdmin && user.role !== "admin") return { cho_phep: false, ly_do: "khong_du_quyen" };
  return { cho_phep: true, user };
}

export async function getSessionUser(): Promise<NguoiDung | null> {
  const supabase = await taoSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const [ho_so] = await db.select().from(users).where(eq(users.id, data.user.id)).limit(1);
  if (!ho_so) return null;
  return {
    id: ho_so.id,
    email: ho_so.email,
    fullName: ho_so.fullName,
    role: ho_so.role,
    isActive: ho_so.isActive,
  };
}

async function chot(canAdmin: boolean): Promise<NguoiDung> {
  const kq = kiemTraQuyen(await getSessionUser(), canAdmin);
  if (kq.cho_phep) return kq.user;
  if (kq.ly_do === "khong_du_quyen") redirect("/admin?loi=khong_du_quyen");
  redirect(`/login?loi=${kq.ly_do}`);
}

export const requireUser = () => chot(false);
export const requireAdmin = () => chot(true);
