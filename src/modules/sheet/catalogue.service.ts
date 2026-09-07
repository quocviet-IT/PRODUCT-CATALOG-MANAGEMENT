import { getEnv } from "@/lib/env";
import { anhXaBang, type DongCatalogue } from "./catalogue.mapper";
import { docBangTho } from "./sheet.client";

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

export async function layDanhSachCatalogue(): Promise<DongCatalogue[]> {
  if (boDem !== null && Date.now() - boDem.luc < HAN_BO_DEM_MS) return boDem.ds;

  const env = getEnv();
  if (!env.CATALOGUE_SHEET_ID) throw new LoiThieuSheetId();
  const tho = await docBangTho(env.CATALOGUE_SHEET_ID, env.CATALOGUE_SHEET_TAB);
  const ds = anhXaBang(tho);
  // Chi ghi bo dem SAU khi ca hai buoc thanh cong — khong dem ket qua loi.
  boDem = { luc: Date.now(), ds };
  return ds;
}
