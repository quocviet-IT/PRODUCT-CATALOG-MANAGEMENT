import { readFile } from "node:fs/promises";
import { getEnv } from "@/lib/env";
import { anhXaBang, type DongCatalogue, type OTho } from "./catalogue.mapper";
import { docBangTho } from "./sheet.client";
import { lietKeAnhTrongThuMuc, type AnhTrongThuMuc } from "./drive.client";

// Bang tinh do nguoi sua tay, tan suat thay doi tinh bang gio. 60 giay du de
// nhieu nguoi mo trang lien tiep khong tao ra nhieu lan goi API.
export const HAN_BO_DEM_MS = 60_000;

let boDem: { luc: number; ds: DongCatalogue[] } | null = null;

/** Chi dung trong test. */
export function xoaBoDem(): void {
  boDem = null;
}

/**
 * CATALOGUE_SHEET_ID la tuy chon o muc getEnv() (xem src/lib/env.ts) de
 * thieu no khong lam sap ca ung dung. Day la noi DUY NHAT thuc su can no,
 * nen tu kiem tra va nem loi co ten rieng.
 */
export class LoiThieuSheetId extends Error {
  constructor() {
    super("Thiếu cấu hình CATALOGUE_SHEET_ID.");
    this.name = "LoiThieuSheetId";
  }
}

/**
 * Doc bang tho tu tep JSON thay vi goi Google. Chi dung khi chua co service
 * account, de xem duoc man hinh that voi du lieu that.
 *
 * Tep nay KHONG duoc commit: no chua ma hang, trong luong vang va ID tep Drive
 * cua cong ty, ma repo thi cong khai. Xem .gitignore.
 */
async function docBangTuTep(duongDan: string): Promise<OTho[][]> {
  return JSON.parse(await readFile(duongDan, "utf8")) as OTho[][];
}

/**
 * Nguon du lieu dang dung. Trang hien thi cho nguoi dung biet, vi mot man hinh
 * chay bang du lieu mau ma trong y het ban that la cach de nguoi ta nham nhat.
 */
export function nguonDangDung(): "mau" | "bang-tinh" {
  return getEnv().CATALOGUE_TEP_MAU ? "mau" : "bang-tinh";
}

export async function layDanhSachCatalogue(): Promise<DongCatalogue[]> {
  if (boDem !== null && Date.now() - boDem.luc < HAN_BO_DEM_MS) return boDem.ds;

  const env = getEnv();
  // Di qua DUNG mot mapper nhu duong that, chi khac cho lay bang tho.
  // Nho vay man hinh xem thu khong bao gio lech voi man hinh chay that.
  let tho: OTho[][];
  if (env.CATALOGUE_TEP_MAU) {
    tho = await docBangTuTep(env.CATALOGUE_TEP_MAU);
  } else {
    if (!env.CATALOGUE_SHEET_ID) throw new LoiThieuSheetId();
    tho = await docBangTho(env.CATALOGUE_SHEET_ID, env.CATALOGUE_SHEET_TAB);
  }
  const ds = anhXaBang(tho);
  // Chi ghi bo dem SAU khi ca hai buoc thanh cong — khong dem ket qua loi.
  boDem = { luc: Date.now(), ds };
  return ds;
}

// ---------------------------------------------------------------------------
// Anh cua mot mau: toan bo tep trong thu muc ma cot FOLDER HINH tro toi.
// ---------------------------------------------------------------------------

/** Danh sach thu muc doi cham hon bang tinh nhieu, nen dem lau hon. */
const HAN_BO_DEM_ANH_MS = 10 * 60_000;

const boDemAnh = new Map<string, { luc: number; ds: AnhTrongThuMuc[] }>();

/** Chi dung trong test. */
export function xoaBoDemAnh(): void {
  boDemAnh.clear();
}

export async function layAnhCuaMau(idThuMuc: string): Promise<AnhTrongThuMuc[]> {
  const cu = boDemAnh.get(idThuMuc);
  if (cu && Date.now() - cu.luc < HAN_BO_DEM_ANH_MS) return cu.ds;

  const env = getEnv();
  let ds: AnhTrongThuMuc[];
  if (env.CATALOGUE_TEP_ANH_MAU) {
    // Cung co che voi CATALOGUE_TEP_MAU: xem thu duoc khi chua co service account.
    // Thu muc khong co trong tep mau thi tra ve rong, khong nem loi — trang chi
    // tiet van hien thong tin, chi thieu thu vien anh.
    const bang = JSON.parse(
      await readFile(env.CATALOGUE_TEP_ANH_MAU, "utf8"),
    ) as Record<string, AnhTrongThuMuc[]>;
    ds = bang[idThuMuc] ?? [];
  } else {
    ds = await lietKeAnhTrongThuMuc(idThuMuc);
  }

  boDemAnh.set(idThuMuc, { luc: Date.now(), ds });
  return ds;
}
