import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";
import type { TenBienThe } from "./image-processor";
import { sql } from "@/db/client";
import { mauLikeDuoiThuMuc, tenTrucTiep } from "./ten-trong-kho";

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
 * Ten cua MOI tep nam truc tiep trong mot thu muc.
 *
 * tepTonTai() goi mot lan cho moi khoa. Khi can doi chieu hang chuc nghin anh
 * cung luc (duong dong bo hoi "nhung ID nao chua co bo dem") thi bay nhieu luot
 * goi la khong the chap nhan — o day lay het mot lan roi doi chieu trong bo nho.
 *
 * DOC BANG SQL TREN storage.objects, KHONG goi list() cua Storage. Truoc day
 * ham nay lat list() 1.000 tep moi trang, chan cung o 50 trang. Ngay 11/09/2026
 * thu muc bo dem anh cham 50.216 tep: ham nem loi, /api/dong-bo/thieu-anh tra
 * 500, va duong nap anh cua Apps Script chet tu 04:14 sang. Nang tran chi hoan
 * binh — con khoang 70.000 tep khi nap du, tuc 70 luot goi mat hon 40 giay moi
 * 5 phut. Mot cau SQL lay het 50.216 ten trong 755ms (Index Only Scan tren
 * bucketid_objname, phia may chu 31ms), va khong co tran nao de cham.
 *
 * Chi mot truy van, chay tuan tu — khong goi song song voi truy van khac tren
 * ket noi max:1 (xem chu thich trong db/client.ts).
 */
export async function lietKeTen(thuMuc: string): Promise<Set<string>> {
  const hang = await sql<{ name: string }[]>`
    select name from storage.objects
    where bucket_id = ${env.SUPABASE_STORAGE_BUCKET}
      and name like ${mauLikeDuoiThuMuc(thuMuc)}`;
  const ten = new Set<string>();
  for (const h of hang) {
    const t = tenTrucTiep(h.name, thuMuc);
    if (t !== null) ten.add(t);
  }
  return ten;
}

export async function taiVe(khoa: string): Promise<Buffer> {
  const { data, error } = await kho.download(khoa);
  if (error || !data) throw new Error(`Không tải được tệp ${khoa}: ${error?.message}`);
  return Buffer.from(await data.arrayBuffer());
}
