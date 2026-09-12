import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

describe("anh thu nho tu thu muc cot Hinh da xu ly", () => {
  it("gan anh dai dien khi nguon co ban do anh", async () => {
    const thuMuc = await mkdtemp(join(tmpdir(), "catalogue-test-"));
    const tepBang = join(thuMuc, "bang.json");
    const tepAnh = join(thuMuc, "anh.json");
    await writeFile(tepBang, JSON.stringify(bangMau), "utf8");
    // Dong thu hai cua bangMau tro toi thu muc cot "Hinh da xu ly" nay.
    await writeFile(
      tepAnh,
      JSON.stringify({ "1QqXuLy0000000000000000000000": [{ fileId: "q-dau", ten: "a.jpg" }] }),
      "utf8",
    );
    getEnv.mockReturnValue({
      ...CAU_HINH_MAC_DINH,
      CATALOGUE_TEP_MAU: tepBang,
      CATALOGUE_TEP_ANH_MAU: tepAnh,
    });

    const ds = await layDanhSachCatalogue();
    expect(ds[1].anhDaiDien).toBe("q-dau");
    // Dong dau chi co cot raw -> khong co thu muc cot Q -> khong anh, bao thieu.
    expect(ds[0].anhDaiDien).toBeNull();
    expect(ds[0].co).toContain("thieu-anh");
    expect(docBangTho).not.toHaveBeenCalled();
  });

  it("nguon khong co ban do anh thi khong gan — luoi lui ve cot HINH nhu cu", async () => {
    const ds = await layDanhSachCatalogue();
    expect(ds[0].anhDaiDien).toBeUndefined();
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
