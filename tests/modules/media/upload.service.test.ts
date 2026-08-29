import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { kiemTraTep, napNhieuTep, TOI_DA_BYTE } from "@/modules/media/upload.service";
import { xoaTep } from "@/modules/media/storage";
import { db } from "@/db/client";
import { products, productImages } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

async function anh(w: number, h: number): Promise<Buffer> {
  return sharp({ create: { width: w, height: h, channels: 3, background: { r: 1, g: 2, b: 3 } } })
    .jpeg().toBuffer();
}

/** Xoa het anh + san pham cua mot productId khoi ha tang that. */
async function donDep(productId: string): Promise<void> {
  const anhs = await db.select().from(productImages).where(eq(productImages.productId, productId));
  await xoaTep(anhs.flatMap((a) => [...Object.values(a.variants as Record<string, string>), a.storageKey]));
  await db.delete(products).where(eq(products.id, productId));
}

/** Nhu tren nhung cho nhieu productId cung luc. */
async function donDepNhieu(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const anhs = await db.select().from(productImages).where(inArray(productImages.productId, ids));
  await xoaTep(anhs.flatMap((a) => [...Object.values(a.variants as Record<string, string>), a.storageKey]));
  await db.delete(products).where(inArray(products.id, ids));
}

describe("kiemTraTep", () => {
  it("nhan duoi jpg, png, webp, heic", () => {
    for (const t of ["a.jpg", "a.JPEG", "a.png", "a.webp", "a.heic"]) {
      expect(kiemTraTep(t, 1000).hopLe).toBe(true);
    }
  });
  it("tu choi duoi khong phai anh", () => {
    const kq = kiemTraTep("tailieu.pdf", 1000);
    expect(kq.hopLe).toBe(false);
    if (!kq.hopLe) expect(kq.thongBao).toMatch(/định dạng/i);
  });
  it("tu choi tep vuot 20 MB", () => {
    const kq = kiemTraTep("a.jpg", TOI_DA_BYTE + 1);
    expect(kq.hopLe).toBe(false);
    if (!kq.hopLe) expect(kq.thongBao).toMatch(/20 MB/);
  });
});

describe("napNhieuTep", () => {
  // try/finally la BAT BUOC o moi test: DB va bucket la that va dung chung. Neu mot
  // assertion do o giua ma khong co finally thi san pham/anh bi bo lai vinh vien
  // tren ha tang that (xem ghi chu trong storage.test.ts).
  it("nap thanh cong va tao san pham nhap kem anh dai dien", async () => {
    const ten = `${randomUUID()}.jpg`;
    const kq = await napNhieuTep([{ ten, noiDung: await anh(800, 600) }], null);

    const productId = kq[0]?.trangThai === "thanh_cong" ? kq[0].productId : null;
    try {
      expect(kq).toHaveLength(1);
      expect(kq[0].trangThai).toBe("thanh_cong");

      if (kq[0].trangThai !== "thanh_cong") throw new Error("khong den day");
      const [sp] = await db.select().from(products).where(eq(products.id, kq[0].productId));
      expect(sp.status).toBe("draft");

      const anhs = await db.select().from(productImages)
        .where(eq(productImages.productId, kq[0].productId));
      expect(anhs).toHaveLength(1);
      expect(anhs[0].isPrimary).toBe(true);
      const bt = anhs[0].variants as Record<string, string>;
      expect(Object.keys(bt).sort()).toEqual(["large", "medium", "thumb"]);
    } finally {
      if (productId) await donDep(productId);
    }
  }, 60_000);

  it("mot tep hong khong lam hong ca lo", async () => {
    const tot = `${randomUUID()}.jpg`;
    const kq = await napNhieuTep([
      { ten: tot, noiDung: await anh(400, 400) },
      { ten: "hong.jpg", noiDung: Buffer.from("khong phai anh") },
    ], null);

    const ids = kq.flatMap((r) => (r.trangThai === "thanh_cong" ? [r.productId] : []));
    try {
      expect(kq.filter((r) => r.trangThai === "thanh_cong")).toHaveLength(1);
      expect(kq.filter((r) => r.trangThai === "loi")).toHaveLength(1);
    } finally {
      await donDepNhieu(ids);
    }
  }, 60_000);

  it("bao trung khi nap lai dung anh da co", async () => {
    const noiDung = await anh(300, 300);
    const lan1 = await napNhieuTep([{ ten: `${randomUUID()}.jpg`, noiDung }], null);
    const lan2 = await napNhieuTep([{ ten: `${randomUUID()}.jpg`, noiDung }], null);

    const productId = lan1[0]?.trangThai === "thanh_cong" ? lan1[0].productId : null;
    try {
      expect(lan1[0].trangThai).toBe("thanh_cong");
      expect(lan2[0].trangThai).toBe("trung");
    } finally {
      if (productId) await donDep(productId);
    }
  }, 60_000);
});
