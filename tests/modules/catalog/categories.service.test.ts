import { describe, it, expect } from "vitest";
import { withRollback } from "../../helpers/db";
import {
  dungCay, taoDanhMuc, chuyenNhanh, xoaDanhMuc, layTatCa, LoiVongLap,
} from "@/modules/catalog/categories.service";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("dungCay", () => {
  it("gom nut con vao dung cha va giu thu tu sortOrder", () => {
    const cay = dungCay([
      { id: "b", name: "Ghe", parentId: "a", path: "/a/b/", sortOrder: 1 },
      { id: "a", name: "Noi that", parentId: null, path: "/a/", sortOrder: 0 },
      { id: "c", name: "Ban", parentId: "a", path: "/a/c/", sortOrder: 0 },
    ]);
    expect(cay).toHaveLength(1);
    expect(cay[0].id).toBe("a");
    expect(cay[0].con.map((n) => n.id)).toEqual(["c", "b"]);
  });

  it("tra ve mang rong khi khong co danh muc", () => {
    expect(dungCay([])).toEqual([]);
  });
});

describe("nghiep vu danh muc", () => {
  it("tao nut goc va nut con voi path dung", async () => {
    await withRollback(async (tx) => {
      const goc = await taoDanhMuc({ name: "Nội thất", parentId: null }, tx);
      expect(goc.path).toBe(`/${goc.id}/`);
      const con = await taoDanhMuc({ name: "Ghế", parentId: goc.id }, tx);
      expect(con.path).toBe(`/${goc.id}/${con.id}/`);
    });
  });

  it("chuyen nhanh cap nhat path cua toan bo con chau", async () => {
    await withRollback(async (tx) => {
      const a = await taoDanhMuc({ name: "A", parentId: null }, tx);
      const b = await taoDanhMuc({ name: "B", parentId: a.id }, tx);
      const c = await taoDanhMuc({ name: "C", parentId: b.id }, tx);
      const x = await taoDanhMuc({ name: "X", parentId: null }, tx);

      await chuyenNhanh(b.id, x.id, tx);

      const ds = await layTatCa(tx);
      const tim = (id: string) => ds.find((d) => d.id === id)!;
      expect(tim(b.id).path).toBe(`/${x.id}/${b.id}/`);
      expect(tim(c.id).path).toBe(`/${x.id}/${b.id}/${c.id}/`);
    });
  });

  it("chan chuyen mot nut vao chinh con cua no", async () => {
    await withRollback(async (tx) => {
      const a = await taoDanhMuc({ name: "A", parentId: null }, tx);
      const b = await taoDanhMuc({ name: "B", parentId: a.id }, tx);
      await expect(chuyenNhanh(a.id, b.id, tx)).rejects.toThrow(LoiVongLap);
    });
  });

  it("chan chuyen mot nut vao chinh no", async () => {
    await withRollback(async (tx) => {
      const a = await taoDanhMuc({ name: "A", parentId: null }, tx);
      await expect(chuyenNhanh(a.id, a.id, tx)).rejects.toThrow(LoiVongLap);
    });
  });

  it("chan chuyen vao chau (khong chi con truc tiep)", async () => {
    await withRollback(async (tx) => {
      const a = await taoDanhMuc({ name: "A", parentId: null }, tx);
      const b = await taoDanhMuc({ name: "B", parentId: a.id }, tx);
      const c = await taoDanhMuc({ name: "C", parentId: b.id }, tx);
      await expect(chuyenNhanh(a.id, c.id, tx)).rejects.toThrow(LoiVongLap);
    });
  });

  it("cho phep chuyen len lam nut goc", async () => {
    await withRollback(async (tx) => {
      const a = await taoDanhMuc({ name: "A", parentId: null }, tx);
      const b = await taoDanhMuc({ name: "B", parentId: a.id }, tx);
      await chuyenNhanh(b.id, null, tx);
      const ds = await layTatCa(tx);
      expect(ds.find((d) => d.id === b.id)!.path).toBe(`/${b.id}/`);
    });
  });

  it("xoa danh muc thi chuyen san pham sang danh muc chi dinh", async () => {
    await withRollback(async (tx) => {
      const cu = await taoDanhMuc({ name: "Cũ", parentId: null }, tx);
      const moi = await taoDanhMuc({ name: "Mới", parentId: null }, tx);
      const [sp] = await tx.insert(products)
        .values({ sku: "SP100", name: "Ghế", searchText: "sp100 ghe", categoryId: cu.id })
        .returning();

      await xoaDanhMuc(cu.id, moi.id, tx);

      const [sau] = await tx.select().from(products).where(eq(products.id, sp.id));
      expect(sau.categoryId).toBe(moi.id);
      expect((await layTatCa(tx)).map((d) => d.id)).not.toContain(cu.id);
    });
  });

  it("xoa ca nhanh con khi xoa danh muc cha", async () => {
    await withRollback(async (tx) => {
      const a = await taoDanhMuc({ name: "A", parentId: null }, tx);
      const b = await taoDanhMuc({ name: "B", parentId: a.id }, tx);
      await xoaDanhMuc(a.id, null, tx);
      const con_lai = (await layTatCa(tx)).map((d) => d.id);
      expect(con_lai).not.toContain(a.id);
      expect(con_lai).not.toContain(b.id);
    });
  });
});
