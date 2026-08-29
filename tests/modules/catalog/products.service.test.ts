import { describe, it, expect } from "vitest";
import { withRollback } from "../../helpers/db";
import {
  taoSanPham, capNhatSanPham, capNhatHangLoat, timSanPham, LoiSkuTrung,
} from "@/modules/catalog/products.service";
import { taoDanhMuc } from "@/modules/catalog/categories.service";
import { products, productImages } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("nghiep vu san pham", () => {
  it("tao san pham va tu sinh searchText khong dau", async () => {
    await withRollback(async (tx) => {
      const sp = await taoSanPham({ sku: "SP001", name: "Ghế gỗ sồi", description: "Chân Đen" }, tx);
      const [r] = await tx.select().from(products).where(eq(products.id, sp.id));
      expect(r.searchText).toBe("sp001 ghe go soi chan den");
    });
  });

  it("chan sku trung bang loi ro rang", async () => {
    await withRollback(async (tx) => {
      await taoSanPham({ sku: "SP002", name: "Bàn" }, tx);
      await expect(taoSanPham({ sku: "SP002", name: "Bàn khác" }, tx)).rejects.toThrow(LoiSkuTrung);
    });
  });

  it("tinh lai searchText khi doi ten", async () => {
    await withRollback(async (tx) => {
      const sp = await taoSanPham({ sku: "SP003", name: "Bàn trà" }, tx);
      await capNhatSanPham(sp.id, { name: "Tủ quần áo" }, tx);
      const [r] = await tx.select().from(products).where(eq(products.id, sp.id));
      expect(r.searchText).toBe("sp003 tu quan ao");
    });
  });

  it("tim duoc bang tu khoa khong dau", async () => {
    await withRollback(async (tx) => {
      await taoSanPham({ sku: "SP010", name: "Ghế gỗ sồi" }, tx);
      await taoSanPham({ sku: "SP011", name: "Đèn đứng" }, tx);
      const kq = await timSanPham({ tuKhoa: "ghe go soi" }, { trang: 1, moiTrang: 20 }, tx);
      expect(kq.ds.map((s) => s.sku)).toEqual(["SP010"]);
      expect(kq.tong).toBe(1);
    });
  });

  it("tim duoc bang tu khoa co dau", async () => {
    await withRollback(async (tx) => {
      await taoSanPham({ sku: "SP012", name: "Đèn đứng" }, tx);
      const kq = await timSanPham({ tuKhoa: "den dung" }, { trang: 1, moiTrang: 20 }, tx);
      expect(kq.ds.map((s) => s.sku)).toEqual(["SP012"]);
    });
  });

  it("loc theo nhanh danh muc bao gom ca danh muc con", async () => {
    await withRollback(async (tx) => {
      const cha = await taoDanhMuc({ name: "Nội thất", parentId: null }, tx);
      const con = await taoDanhMuc({ name: "Ghế", parentId: cha.id }, tx);
      await taoSanPham({ sku: "SP020", name: "Ghế A", categoryId: con.id }, tx);
      await taoSanPham({ sku: "SP021", name: "Đèn B", categoryId: null }, tx);

      const kq = await timSanPham({ categoryPath: cha.path }, { trang: 1, moiTrang: 20 }, tx);
      expect(kq.ds.map((s) => s.sku)).toEqual(["SP020"]);
    });
  });

  it("loc theo khoang gia", async () => {
    await withRollback(async (tx) => {
      await taoSanPham({ sku: "SP030", name: "Re", listPrice: 100_000 }, tx);
      await taoSanPham({ sku: "SP031", name: "Dat", listPrice: 9_000_000 }, tx);
      const kq = await timSanPham({ giaTu: 1_000_000 }, { trang: 1, moiTrang: 20 }, tx);
      expect(kq.ds.map((s) => s.sku)).toEqual(["SP031"]);
    });
  });

  it("loc san pham chua co anh", async () => {
    await withRollback(async (tx) => {
      const co = await taoSanPham({ sku: "SP040", name: "Co anh" }, tx);
      await taoSanPham({ sku: "SP041", name: "Chua co anh" }, tx);
      await tx.insert(productImages).values({
        productId: co.id, storageKey: "k", variants: { thumb: "t", medium: "m", large: "l" },
        width: 10, height: 10, bytes: 1, contentHash: "h", isPrimary: true,
      });
      const kq = await timSanPham({ coAnh: false }, { trang: 1, moiTrang: 20 }, tx);
      expect(kq.ds.map((s) => s.sku)).toEqual(["SP041"]);
    });
  });

  it("cap nhat hang loat tra ve so dong da doi", async () => {
    await withRollback(async (tx) => {
      const a = await taoSanPham({ sku: "SP050", name: "A" }, tx);
      const b = await taoSanPham({ sku: "SP051", name: "B" }, tx);
      const so = await capNhatHangLoat([a.id, b.id], { status: "discontinued" }, tx);
      expect(so).toBe(2);
      const [sau] = await tx.select().from(products).where(eq(products.id, a.id));
      expect(sau.status).toBe("discontinued");
    });
  });

  it("phan trang cat dung so luong", async () => {
    await withRollback(async (tx) => {
      for (let i = 0; i < 5; i++) {
        await taoSanPham({ sku: `SP06${i}`, name: `Mau ${i}` }, tx);
      }
      const kq = await timSanPham({ tuKhoa: "mau" }, { trang: 2, moiTrang: 2 }, tx);
      expect(kq.ds).toHaveLength(2);
      expect(kq.tong).toBe(5);
    });
  });
});
