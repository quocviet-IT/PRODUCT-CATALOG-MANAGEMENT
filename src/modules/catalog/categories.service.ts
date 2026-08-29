import { randomUUID } from "node:crypto";
import type { Tx } from "@/db/client";
import { dungPath, doiPathKhiChuyenNhanh, taoVongLap } from "./category-path";
import * as repo from "./categories.repo";
import type { DanhMuc } from "./categories.repo";

export type { DanhMuc };
export const layTatCa = repo.layTatCa;

export class LoiVongLap extends Error {
  constructor() {
    super("Không thể chuyển một danh mục vào chính nó hoặc vào nhánh con của nó.");
    this.name = "LoiVongLap";
  }
}

export type NutCay = DanhMuc & { con: NutCay[] };

/**
 * Ham thuan — dung cay tu danh sach phang.
 *
 * Sap xep theo sortOrder truoc khi dung cay (sort on dinh cua JS) de nut con
 * luon dung thu tu du dau vao co the khong sap xep san — xem test
 * "gom nut con vao dung cha va giu thu tu sortOrder".
 */
export function dungCay(ds: DanhMuc[]): NutCay[] {
  const daySapXep = [...ds].sort((a, b) => a.sortOrder - b.sortOrder);
  const bang = new Map<string, NutCay>();
  for (const d of daySapXep) bang.set(d.id, { ...d, con: [] });
  const goc: NutCay[] = [];
  for (const d of daySapXep) {
    const nut = bang.get(d.id)!;
    const cha = d.parentId ? bang.get(d.parentId) : undefined;
    if (cha) cha.con.push(nut);
    else goc.push(nut);
  }
  return goc;
}

export async function taoDanhMuc(
  input: { name: string; parentId: string | null },
  tx?: Tx,
): Promise<DanhMuc> {
  const id = randomUUID();
  let pathCha: string | null = null;
  if (input.parentId !== null) {
    const cha = await repo.layTheoId(input.parentId, tx);
    if (!cha) throw new Error(`Không tìm thấy danh mục cha ${input.parentId}`);
    pathCha = cha.path;
  }
  // Sinh id o day de tinh path trong cung mot lan ghi — khong chen roi sua lai.
  return repo.chen({
    id,
    name: input.name,
    parentId: input.parentId,
    path: dungPath(pathCha, id),
  }, tx);
}

export async function doiTen(id: string, name: string, tx?: Tx): Promise<void> {
  await repo.capNhat(id, { name }, tx);
}

export async function chuyenNhanh(
  id: string,
  parentIdMoi: string | null,
  tx?: Tx,
): Promise<void> {
  const nut = await repo.layTheoId(id, tx);
  if (!nut) throw new Error(`Không tìm thấy danh mục ${id}`);

  let pathChaMoi: string | null = null;
  if (parentIdMoi !== null) {
    const cha = await repo.layTheoId(parentIdMoi, tx);
    if (!cha) throw new Error(`Không tìm thấy danh mục cha ${parentIdMoi}`);
    // Chieu goi bat buoc: (path cua DICH DEN, id cua nut DANG DI CHUYEN).
    // Goi nguoc lai se tra ve false dung o truong hop vong lap that.
    // Truong hop keo nut vao chinh no cung da nam trong phep kiem tra nay,
    // vi khi do cha.path chinh la nut.path va da chua id.
    if (taoVongLap(cha.path, id)) throw new LoiVongLap();
    pathChaMoi = cha.path;
  }

  const pathGocMoi = dungPath(pathChaMoi, id);
  const nhanh = await repo.layCaNhanh(nut.path, tx);
  for (const n of nhanh) {
    await repo.capNhat(n.id, { path: doiPathKhiChuyenNhanh(n.path, nut.path, pathGocMoi) }, tx);
  }
  await repo.capNhat(id, { parentId: parentIdMoi }, tx);
}

export async function xoaDanhMuc(
  id: string,
  chuyenSanIdSanPham: string | null,
  tx?: Tx,
): Promise<void> {
  const nut = await repo.layTheoId(id, tx);
  if (!nut) return;
  const nhanh = await repo.layCaNhanh(nut.path, tx);
  const ids = nhanh.map((n) => n.id);
  await repo.chuyenSanPhamSangDanhMuc(ids, chuyenSanIdSanPham, tx);
  // Xoa tu la len goc de khong vi pham rang buoc parent_id.
  const theoDoSau = [...nhanh].sort((a, b) => b.path.length - a.path.length);
  await repo.xoaNhieu(theoDoSau.map((n) => n.id), tx);
}
