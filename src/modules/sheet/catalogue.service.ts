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

export async function layDanhSachCatalogue(): Promise<DongCatalogue[]> {
  if (boDem !== null && Date.now() - boDem.luc < HAN_BO_DEM_MS) return boDem.ds;

  const env = getEnv();
  const tho = await docBangTho(env.CATALOGUE_SHEET_ID, env.CATALOGUE_SHEET_TAB);
  const ds = anhXaBang(tho);
  // Chi ghi bo dem SAU khi ca hai buoc thanh cong — khong dem ket qua loi.
  boDem = { luc: Date.now(), ds };
  return ds;
}
