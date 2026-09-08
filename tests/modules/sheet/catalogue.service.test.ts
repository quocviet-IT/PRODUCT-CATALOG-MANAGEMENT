import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bangMau } from "./fixtures/bang-mau";

const docBangTho = vi.fn();
// getEnv la vi.fn() thay vi mot arrow co dinh, de test rieng cho
// LoiThieuSheetId co the doi ket qua tra ve (thieu CATALOGUE_SHEET_ID) ma
// khong dung lai vi.mock (vi.mock chi chay MOT lan luc module duoc resolve).
const getEnv = vi.fn();
vi.mock("@/modules/sheet/sheet.client", () => ({ docBangTho }));
vi.mock("@/lib/env", () => ({ getEnv }));

const CAU_HINH_MAC_DINH = { CATALOGUE_SHEET_ID: "id-gia", CATALOGUE_SHEET_TAB: "test" };

const { layDanhSachCatalogue, nguonDangDung, xoaBoDem, LoiThieuSheetId } =
  await import("@/modules/sheet/catalogue.service");

beforeEach(() => {
  docBangTho.mockReset();
  docBangTho.mockResolvedValue(bangMau);
  getEnv.mockReset();
  getEnv.mockReturnValue(CAU_HINH_MAC_DINH);
  xoaBoDem();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("layDanhSachCatalogue", () => {
  it("goi Sheets API dung mot lan cho nhieu lan doc lien tiep", async () => {
    await layDanhSachCatalogue();
    await layDanhSachCatalogue();
    await layDanhSachCatalogue();
    expect(docBangTho).toHaveBeenCalledTimes(1);
  });

  it("doc lai sau khi bo dem het han", async () => {
    await layDanhSachCatalogue();
    vi.advanceTimersByTime(60_001);
    await layDanhSachCatalogue();
    expect(docBangTho).toHaveBeenCalledTimes(2);
  });

  it("truyen dung ID va tab tu cau hinh", async () => {
    await layDanhSachCatalogue();
    expect(docBangTho).toHaveBeenCalledWith("id-gia", "test");
  });

  it("khong dem ket qua loi — lan sau van goi lai", async () => {
    docBangTho.mockRejectedValueOnce(new Error("mang hong"));
    await expect(layDanhSachCatalogue()).rejects.toThrow("mang hong");
    await layDanhSachCatalogue();
    expect(docBangTho).toHaveBeenCalledTimes(2);
  });

  it("nem LoiThieuSheetId khi thieu CATALOGUE_SHEET_ID, khong goi Sheets API", async () => {
    // CATALOGUE_SHEET_ID la tuy chon o muc getEnv() — mot deploy quen khai
    // bao no khong duoc phep khien loi tho tu fetch/JWT lot ra ngoai, ma phai
    // dung lai o day voi mot loi co ten ro rang, de trang catalogue-sheet bat
    // duoc va hien thong bao an toan.
    getEnv.mockReturnValue({ CATALOGUE_SHEET_ID: undefined, CATALOGUE_SHEET_TAB: "test" });
    await expect(layDanhSachCatalogue()).rejects.toBeInstanceOf(LoiThieuSheetId);
    expect(docBangTho).not.toHaveBeenCalled();
  });
});

describe("nguonDangDung", () => {
  it("phan biet ban do Apps Script day len voi du lieu mau", () => {
    // Ca hai deu di qua duong "tep mau" ve mat ky thuat, nhung mot ben la du
    // lieu THAT cua bang tinh. Goi no la "du lieu mau" thi dong chu tren man
    // hinh tro thanh mot loi noi doi — va nguoi dung se di sua nham thu.
    getEnv.mockReturnValue({ ...CAU_HINH_MAC_DINH, CATALOGUE_TEP_MAU: "storage:dong-bo/bang.json" });
    expect(nguonDangDung()).toBe("dong-bo");

    getEnv.mockReturnValue({ ...CAU_HINH_MAC_DINH, CATALOGUE_TEP_MAU: "du-lieu/bang.json" });
    expect(nguonDangDung()).toBe("mau");

    getEnv.mockReturnValue(CAU_HINH_MAC_DINH);
    expect(nguonDangDung()).toBe("bang-tinh");
  });
});
