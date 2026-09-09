import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";
import type { TenBienThe } from "./image-processor";

export { dungKhoaAnhSheet } from "./khoa-anh";

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

export async function tepTonTai(khoa: string): Promise<boolean> {
  const cat = khoa.lastIndexOf("/");
  const thuMuc = cat === -1 ? "" : khoa.slice(0, cat);
  const ten = cat === -1 ? khoa : khoa.slice(cat + 1);
  const { data, error } = await kho.list(thuMuc, { search: ten, limit: 100 });
  if (error) throw new Error(`Không liệt kê được ${thuMuc}: ${error.message}`);
  return (data ?? []).some((t) => t.name === ten);
}

/**
 * Ten cua MOI tep trong mot thu muc.
 *
 * tepTonTai() goi mot lan cho moi khoa. Khi can doi chieu hang nghin anh cung
 * luc (duong dong bo hoi "nhung ID nao chua co bo dem") thi bay nhieu luot goi
 * la khong the chap nhan — o day lay het mot lan roi doi chieu trong bo nho.
 *
 * Supabase tra toi da mot trang moi lan nen phai lat trang cho toi khi het.
 * Chan cung SO_TRANG_TOI_DA de mot phan hoi la khong bien vong lap thanh vo tan.
 */
const MOI_TRANG = 1000;
const SO_TRANG_TOI_DA = 50;

export async function lietKeTen(thuMuc: string): Promise<Set<string>> {
  const ten = new Set<string>();
  for (let trang = 0; trang < SO_TRANG_TOI_DA; trang++) {
    const { data, error } = await kho.list(thuMuc, {
      limit: MOI_TRANG,
      offset: trang * MOI_TRANG,
    });
    if (error) throw new Error(`Không liệt kê được ${thuMuc}: ${error.message}`);
    const lo = data ?? [];
    for (const t of lo) ten.add(t.name);
    if (lo.length < MOI_TRANG) return ten;
  }
  throw new Error(`Thư mục ${thuMuc} có quá nhiều tệp để liệt kê hết.`);
}

export async function taiVe(khoa: string): Promise<Buffer> {
  const { data, error } = await kho.download(khoa);
  if (error || !data) throw new Error(`Không tải được tệp ${khoa}: ${error?.message}`);
  return Buffer.from(await data.arrayBuffer());
}
