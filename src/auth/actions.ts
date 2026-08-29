"use server";

import { redirect } from "next/navigation";
import { taoSupabaseServer } from "./supabase-server";

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
