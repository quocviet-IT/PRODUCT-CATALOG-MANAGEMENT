import type { Tx } from "@/db/client";
import { dungSearchText } from "@/lib/vietnamese";
import * as repo from "./products.repo";
import type { SanPham } from "./products.repo";
import type { BoLoc, ThamSoTrang, TrangThaiSanPham } from "./search-query";

export type { SanPham };
export const timSanPham = repo.tim;
export const layTheoId = repo.layTheoId;

export class LoiSkuTrung extends Error {
  constructor(sku: string) {
    super(`Mã sản phẩm "${sku}" đã tồn tại.`);
    this.name = "LoiSkuTrung";
  }
}

export type TaoSanPhamInput = {
  /** Cho phep nguoi goi tu sinh id truoc, de ghi Storage xong roi moi mo giao dich. */
  id?: string;
  sku: string;
  name: string;
  description?: string;
  listPrice?: number | null;
  currency?: string;
  categoryId?: string | null;
  attributes?: Record<string, unknown>;
  status?: TrangThaiSanPham;
  createdBy?: string | null;
};

/**
 * Drizzle boc loi Postgres that vao trong DrizzleQueryError, ma khong dua thong
 * diep goc (vd "duplicate key value violates unique constraint...") vao
 * `message` cua no — thong diep goc va ma loi ("23505" = unique_violation) nam
 * o `.cause`. Vi vay phai lan theo chuoi `cause` thay vi chi doc `e.message`.
 */
function laLoiTrungKhoa(e: unknown): boolean {
  let hien: unknown = e;
  for (let i = 0; i < 5 && hien instanceof Error; i++) {
    if ((hien as { code?: unknown }).code === "23505") return true;
    if (/duplicate key|products_sku_idx|unique/i.test(hien.message)) return true;
    hien = (hien as { cause?: unknown }).cause;
  }
  return false;
}

export async function taoSanPham(input: TaoSanPhamInput, tx?: Tx): Promise<SanPham> {
  try {
    const r = await repo.chen({
      ...(input.id ? { id: input.id } : {}),
      sku: input.sku,
      name: input.name,
      description: input.description ?? "",
      searchText: dungSearchText(input),
      listPrice: input.listPrice === null || input.listPrice === undefined
        ? null : String(input.listPrice),
      currency: input.currency ?? "VND",
      categoryId: input.categoryId ?? null,
      attributes: input.attributes ?? {},
      status: input.status ?? "active",
      createdBy: input.createdBy ?? null,
    }, tx);
    return { ...r, attributes: r.attributes as Record<string, unknown>, anhDaiDien: null };
  } catch (e) {
    if (laLoiTrungKhoa(e)) throw new LoiSkuTrung(input.sku);
    throw e;
  }
}

/** Cap nhat mot san pham. Tu tinh lai searchText khi sku/ten/mo ta doi. */
export async function capNhatSanPham(
  id: string, input: Partial<TaoSanPhamInput>, tx?: Tx,
): Promise<void> {
  const hien_tai = await repo.layTheoId(id, tx);
  if (!hien_tai) throw new Error(`Không tìm thấy sản phẩm ${id}`);

  const gt: Record<string, unknown> = {};
  if (input.sku !== undefined) gt.sku = input.sku;
  if (input.name !== undefined) gt.name = input.name;
  if (input.description !== undefined) gt.description = input.description;
  if (input.currency !== undefined) gt.currency = input.currency;
  if (input.categoryId !== undefined) gt.categoryId = input.categoryId;
  if (input.attributes !== undefined) gt.attributes = input.attributes;
  if (input.status !== undefined) gt.status = input.status;
  if (input.listPrice !== undefined) {
    gt.listPrice = input.listPrice === null ? null : String(input.listPrice);
  }

  const doi_van_ban = input.sku !== undefined || input.name !== undefined
    || input.description !== undefined;
  if (doi_van_ban) {
    gt.searchText = dungSearchText({
      sku: input.sku ?? hien_tai.sku,
      name: input.name ?? hien_tai.name,
      description: input.description ?? hien_tai.description,
    });
  }

  try {
    await repo.capNhat(id, gt, tx);
  } catch (e) {
    if (laLoiTrungKhoa(e) && input.sku) throw new LoiSkuTrung(input.sku);
    throw e;
  }
}

/**
 * Gan chung mot vai truong cho nhieu san pham.
 * Khong nhan sku/name/description vi nhung truong do phai duy nhat theo tung san pham.
 */
export async function capNhatHangLoat(
  ids: string[],
  input: Pick<TaoSanPhamInput, "categoryId" | "status" | "currency"> & { listPrice?: number | null },
  tx?: Tx,
): Promise<number> {
  const gt: Record<string, unknown> = {};
  if (input.categoryId !== undefined) gt.categoryId = input.categoryId;
  if (input.status !== undefined) gt.status = input.status;
  if (input.currency !== undefined) gt.currency = input.currency;
  if (input.listPrice !== undefined) {
    gt.listPrice = input.listPrice === null ? null : String(input.listPrice);
  }
  if (Object.keys(gt).length === 0) return 0;
  return repo.capNhatNhieu(ids, gt, tx);
}
