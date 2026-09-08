"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { taoSupabaseServer } from "./supabase-server";

/**
 * Dia chi goc that su nguoi dung dang mo (hpcatalogue.app, ban preview cua
 * Vercel, hay localhost khi chay thu).
 *
 * Phai lay tu header chu khong ghi cung: Google se tra nguoi dung ve dung dia
 * chi nay, ghi cung mot cai thi dang nhap tu may nha se nhay sang ban that.
 */
async function layGoc(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const giaoThuc = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${giaoThuc}://${host}`;
}

export async function dangNhapGoogle(): Promise<void> {
  const supabase = await taoSupabaseServer();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await layGoc()}/auth/callback`,
      // prompt=select_account: nguoi dung co nhieu tai khoan Google (ca nhan va
      // cong ty) thi phai duoc CHON, khong bi Google tu dong dung cai dang mo.
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) redirect("/login?loi=loi_google");
  redirect(data.url);
}

export async function dangNhap(_truoc: string | null, form: FormData): Promise<string | null> {
  const email = String(form.get("email") ?? "");
  const matKhau = String(form.get("mat_khau") ?? "");
  const supabase = await taoSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password: matKhau });
  if (error) return "sai_thong_tin";
  redirect("/admin");
}

export async function dangXuat(): Promise<void> {
  const supabase = await taoSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
