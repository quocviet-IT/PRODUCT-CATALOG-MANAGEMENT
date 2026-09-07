import { afterEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { LoiAnhKhongHopLe } from "@/modules/media/image-processor";

const taiTepDrive = vi.fn();
vi.mock("@/modules/sheet/drive.client", () => ({ taiTepDrive }));

const { layUrlAnhSheet, CANH_DAI_ANH_SHEET } = await import("@/modules/media/anh-drive");
const { dungKhoaAnhSheet, tepTonTai, xoaTep } = await import("@/modules/media/storage");

// randomUUID, khong dung Date.now(): bucket la that va dung chung giua cac lan
// chay (ke ca CI), do phan giai mili-giay co the trung nhau. Xem anh-url.test.ts.
const FILE_ID = `test-${randomUUID()}`;
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

  it("tu choi voi loi mien nguyen khi Drive tra ve du lieu khong phai anh", async () => {
    taiTepDrive.mockResolvedValue(Buffer.from("khong phai anh"));

    await expect(layUrlAnhSheet(FILE_ID)).rejects.toBeInstanceOf(LoiAnhKhongHopLe);
  }, 30000);

  it("tu choi voi loi mien nguyen khi anh bi cat ngang giua chung (metadata doc duoc nhung toBuffer vo)", async () => {
    const to = await sharp({
      create: { width: 800, height: 600, channels: 3, background: "#ffffff" },
    }).jpeg().toBuffer();
    // Cat con khoang nua: header JPEG van doc duoc kich thuoc (metadata() pass)
    // nhung du lieu quet dong bi thieu, lam toBuffer() nem loi libvips tho.
    const catNgang = to.subarray(0, Math.floor(to.length / 2));
    taiTepDrive.mockResolvedValue(catNgang);

    await expect(layUrlAnhSheet(FILE_ID)).rejects.toBeInstanceOf(LoiAnhKhongHopLe);
  }, 30000);
});
