import { readFile } from "node:fs/promises";
import { getEnv } from "@/lib/env";
import { anhXaBang, type DongCatalogue, type OTho } from "./catalogue.mapper";
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
