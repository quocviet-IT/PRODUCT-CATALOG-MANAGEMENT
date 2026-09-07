import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";
import type { TenBienThe } from "./image-processor";

const env = getEnv();

/** Dung khoa secret vi moi thao tac deu chay o phia may chu. */
const kho = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
}).storage.from(env.SUPABASE_STORAGE_BUCKET);

export function dungKhoa(
  productId: string,
  imageId: string,
  bienThe: TenBienThe | "goc",
  duoi: string,
): string {
  return `products/${productId}/${imageId}/${bienThe}.${duoi}`;
}

export async function ghiTep(khoa: string, noiDung: Buffer, contentType: string): Promise<void> {
  const { error } = await kho.upload(khoa, noiDung, { contentType, upsert: true });
  if (error) throw new Error(`Không ghi được tệp ${khoa}: ${error.message}`);
}

export async function xoaTep(khoa: string[]): Promise<void> {
  if (khoa.length === 0) return;
  const { error } = await kho.remove(khoa);
  if (error) throw new Error(`Không xoá được tệp: ${error.message}`);
}

export async function layUrlCoKy(khoa: string, hanGiay = 3600): Promise<string> {
  const { data, error } = await kho.createSignedUrl(khoa, hanGiay);
  if (error || !data) throw new Error(`Không ký được URL cho ${khoa}: ${error?.message}`);
  return data.signedUrl;
}

/** Tien to rieng, tach khoi anh san pham do nguoi dung tai len. */
export function dungKhoaAnhSheet(fileId: string, canhDai: number): string {
  return `sheet-cache/${fileId}-${canhDai}.webp`;
}

export async function tepTonTai(khoa: string): Promise<boolean> {
  const cat = khoa.lastIndexOf("/");
  const thuMuc = cat === -1 ? "" : khoa.slice(0, cat);
  const ten = cat === -1 ? khoa : khoa.slice(cat + 1);
  const { data, error } = await kho.list(thuMuc, { search: ten, limit: 100 });
  if (error) throw new Error(`Không liệt kê được ${thuMuc}: ${error.message}`);
  return (data ?? []).some((t) => t.name === ten);
}

export async function taiVe(khoa: string): Promise<Buffer> {
  const { data, error } = await kho.download(khoa);
  if (error || !data) throw new Error(`Không tải được tệp ${khoa}: ${error?.message}`);
  return Buffer.from(await data.arrayBuffer());
}
