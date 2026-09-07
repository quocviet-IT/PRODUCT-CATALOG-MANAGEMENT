import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bangMau } from "./fixtures/bang-mau";

const docBangTho = vi.fn();
vi.mock("@/modules/sheet/sheet.client", () => ({ docBangTho }));
vi.mock("@/lib/env", () => ({
  getEnv: () => ({ CATALOGUE_SHEET_ID: "id-gia", CATALOGUE_SHEET_TAB: "test" }),
}));

const { layDanhSachCatalogue, xoaBoDem } = await import("@/modules/sheet/catalogue.service");

beforeEach(() => {
  docBangTho.mockReset();
  docBangTho.mockResolvedValue(bangMau);
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
});
