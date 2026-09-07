import { afterEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";

const taiTepDrive = vi.fn();
vi.mock("@/modules/sheet/drive.client", () => ({ taiTepDrive }));

const { layUrlAnhSheet, CANH_DAI_ANH_SHEET } = await import("@/modules/media/anh-drive");
const { dungKhoaAnhSheet, tepTonTai, xoaTep } = await import("@/modules/media/storage");

const FILE_ID = `test-${Date.now()}`;
const khoa = dungKhoaAnhSheet(FILE_ID, CANH_DAI_ANH_SHEET);

afterEach(async () => {
  // Bucket la that va dung chung — khong duoc bo lai rac.
  await xoaTep([khoa]).catch(() => {});
  taiTepDrive.mockReset();
});

describe("dungKhoaAnhSheet", () => {
  it("dat duoi tien to rieng, khong lan vao anh san pham", () => {
    expect(dungKhoaAnhSheet("abc", 600)).toBe("sheet-cache/abc-600.webp");
  });
});

describe("layUrlAnhSheet", () => {
  it("tai tu Drive, thu nho, ghi vao Storage roi tra URL co ky", async () => {
    const to = await sharp({
      create: { width: 2000, height: 1500, channels: 3, background: "#ffffff" },
    }).jpeg().toBuffer();
    taiTepDrive.mockResolvedValue(to);

    const url = await layUrlAnhSheet(FILE_ID);

    expect(url).toContain("http");
    expect(await tepTonTai(khoa)).toBe(true);
    expect(taiTepDrive).toHaveBeenCalledOnce();
  }, 30000);

  it("lan thu hai KHONG goi lai Drive", async () => {
    const to = await sharp({
      create: { width: 800, height: 800, channels: 3, background: "#ffffff" },
    }).jpeg().toBuffer();
    taiTepDrive.mockResolvedValue(to);

    await layUrlAnhSheet(FILE_ID);
    await layUrlAnhSheet(FILE_ID);

    expect(taiTepDrive).toHaveBeenCalledOnce();
  }, 30000);

  it("thu nho ve dung canh dai 600 va chuyen sang webp", async () => {
    const to = await sharp({
      create: { width: 2000, height: 1000, channels: 3, background: "#ffffff" },
    }).jpeg().toBuffer();
    taiTepDrive.mockResolvedValue(to);

    await layUrlAnhSheet(FILE_ID);

    // Doc lai chinh tep da ghi de kiem, thay vi tin vao gia tri trung gian.
    const { taiVe } = await import("@/modules/media/storage");
    const meta = await sharp(await taiVe(khoa)).metadata();
    expect(meta.width).toBe(600);
    expect(meta.height).toBe(300);
    expect(meta.format).toBe("webp");
  }, 30000);
});
