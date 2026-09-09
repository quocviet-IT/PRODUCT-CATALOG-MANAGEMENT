import { readFile } from "node:fs/promises";
import { getEnv } from "@/lib/env";
import { anhXaBang, type DongCatalogue, type OTho } from "./catalogue.mapper";
import { docBangTho } from "./sheet.client";
import { lietKeAnhTrongThuMuc, type AnhTrongThuMuc } from "./drive.client";
import { NGUON_BANG_DONG_BO } from "./dong-bo.khoa";

/**
 * mau       — tep JSON tren dia, dung khi xem thu
 * dong-bo   — ban chup that do Google Apps Script day len (xem dong-bo.ts)
 * bang-tinh — goi thang Google Sheets API
 */
export type NguonDuLieu = "mau" | "dong-bo" | "bang-tinh";

/** Tien to bao rang gia tri la KHOA trong Supabase Storage, khong phai duong dan tep. */
const TIEN_TO_STORAGE = "storage:";

/**
 * Doc tep du lieu mau. Chap nhan hai dang nguon:
 *   - duong dan tep tren dia            -> chay tren may nha
 *   - "storage:<khoa>" trong Storage    -> chay tren Vercel
 *
 * Vi sao khong commit thang tep vao repo: no chua ma hang, trong luong vang va
 * ID tep Drive cua cong ty — du lieu kinh doanh khong thuoc ve lich su git, va
 * sua no thi phai deploy lai. De trong Storage thi doi du lieu la xong.
 *
 * Nap module storage bang import dong, khong phai import dau tep: storage.ts
 * dung client Supabase ngay luc nap, nen import tinh se bat MOI nguoi dung
 * catalogue.service phai co cau hinh Supabase — ke ca khi doc tep tren dia.
 */
async function docTepMau(nguon: string): Promise<string> {
  if (nguon.startsWith(TIEN_TO_STORAGE)) {
    const { taiVe } = await import("@/modules/media/storage");
    const buf = await taiVe(nguon.slice(TIEN_TO_STORAGE.length));
    return buf.toString("utf8");
  }
  return readFile(nguon, "utf8");
}

// Do tre nguoi dung cam nhan duoc = chu ky day cua Apps Script + bo dem nay.
// Script day bang tinh moi phut, nen giu bo dem o 60 giay la tu bien mot phut
// thanh hai. 20 giay van gom duoc nhieu lan mo trang lien tiep vao mot lan doc.
export const HAN_BO_DEM_MS = 20_000;

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
 * cua cong ty. Xem .gitignore.
 */
async function docBangTuTep(nguon: string): Promise<OTho[][]> {
  return JSON.parse(await docTepMau(nguon)) as OTho[][];
}

/**
 * Nguon du lieu dang dung. Trang hien thi cho nguoi dung biet, vi mot man hinh
 * chay bang du lieu mau ma trong y het ban that la cach de nguoi ta nham nhat.
 *
 * Ba trang thai, khong phai hai: ban do Apps Script day len cung di qua duong
 * "tep mau" ve mat ky thuat, nhung do la du lieu THAT cua bang tinh. Goi no la
 * "du lieu mau" thi dong chu tro thanh loi noi doi.
 */
export function nguonDangDung(): NguonDuLieu {
  const nguon = getEnv().CATALOGUE_TEP_MAU;
  if (!nguon) return "bang-tinh";
  return nguon === NGUON_BANG_DONG_BO ? "dong-bo" : "mau";
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
      await docTepMau(env.CATALOGUE_TEP_ANH_MAU),
    ) as Record<string, AnhTrongThuMuc[]>;
    ds = bang[idThuMuc] ?? [];
  } else {
    ds = await lietKeAnhTrongThuMuc(idThuMuc);
  }

  boDemAnh.set(idThuMuc, { luc: Date.now(), ds });
  return ds;
}
