import { describe, it, expect } from "vitest";
import sharp from "sharp";
import {
  xuLyAnh, tinhKichThuocMoi, LoiAnhKhongHopLe, BIEN_THE,
} from "@/modules/media/image-processor";

async function anhMau(w: number, h: number): Promise<Buffer> {
  return sharp({
    create: { width: w, height: h, channels: 3, background: { r: 200, g: 30, b: 30 } },
  }).jpeg().toBuffer();
}

describe("tinhKichThuocMoi", () => {
  it("thu nho theo chieu rong khi anh nam ngang", () => {
    expect(tinhKichThuocMoi(2000, 1000, 400)).toEqual({ width: 400, height: 200 });
  });
  it("thu nho theo chieu cao khi anh nam doc", () => {
    expect(tinhKichThuocMoi(1000, 2000, 400)).toEqual({ width: 200, height: 400 });
  });
  it("khong phong to anh nho hon nguong", () => {
    expect(tinhKichThuocMoi(300, 200, 400)).toEqual({ width: 300, height: 200 });
  });
  it("lam tron ve so nguyen", () => {
    expect(tinhKichThuocMoi(1000, 333, 400)).toEqual({ width: 400, height: 133 });
  });
});

describe("xuLyAnh", () => {
  it("sinh du ba bien the", async () => {
    const kq = await xuLyAnh(await anhMau(3000, 2000));
    expect(Object.keys(kq.bienThe).sort()).toEqual(["large", "medium", "thumb"]);
  });

  it("moi bien the dung canh dai quy dinh va giu ti le", async () => {
    const kq = await xuLyAnh(await anhMau(3000, 2000));
    for (const { ten, canhDai } of BIEN_THE) {
      const meta = await sharp(kq.bienThe[ten]).metadata();
      expect(meta.width).toBe(canhDai);
      expect(meta.height).toBe(Math.round((canhDai * 2000) / 3000));
    }
  });

  it("anh nam doc: bien the large dung chieu cao lam canh rang buoc", async () => {
    const kq = await xuLyAnh(await anhMau(2000, 3000));
    const meta = await sharp(kq.bienThe.large).metadata();
    expect(meta.width).toBe(1333);
    expect(meta.height).toBe(2000);
  });

  it("xuat WebP", async () => {
    const kq = await xuLyAnh(await anhMau(800, 600));
    const meta = await sharp(kq.bienThe.thumb).metadata();
    expect(meta.format).toBe("webp");
  });

  it("ghi lai kich thuoc that cua anh goc", async () => {
    const kq = await xuLyAnh(await anhMau(1234, 567));
    expect(kq.width).toBe(1234);
    expect(kq.height).toBe(567);
  });

  it("ma bam on dinh voi cung mot anh", async () => {
    const goc = await anhMau(500, 500);
    const a = await xuLyAnh(goc);
    const b = await xuLyAnh(goc);
    expect(a.contentHash).toBe(b.contentHash);
    expect(a.contentHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("ma bam khac nhau voi hai anh khac nhau", async () => {
    const a = await xuLyAnh(await anhMau(500, 500));
    const b = await xuLyAnh(await anhMau(500, 501));
    expect(a.contentHash).not.toBe(b.contentHash);
  });

  it("xoa sach EXIF khoi bien the", async () => {
    const co_exif = await sharp({
      create: { width: 800, height: 600, channels: 3, background: { r: 0, g: 0, b: 0 } },
    }).withMetadata({ exif: { IFD0: { Copyright: "ABC" } } }).jpeg().toBuffer();
    const kq = await xuLyAnh(co_exif);
    const meta = await sharp(kq.bienThe.large).metadata();
    expect(meta.exif).toBeUndefined();
  });

  it("nem loi ro rang khi du lieu khong phai anh", async () => {
    await expect(xuLyAnh(Buffer.from("day khong phai anh"))).rejects.toThrow(LoiAnhKhongHopLe);
  });
});
