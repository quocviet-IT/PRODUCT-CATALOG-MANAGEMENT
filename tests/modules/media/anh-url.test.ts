import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { kyNhieuUrl } from "@/modules/media/anh-url";
import { ghiTep, xoaTep } from "@/modules/media/storage";

describe("kyNhieuUrl", () => {
  it("tra ve mang rong khi dau vao rong", async () => {
    expect(await kyNhieuUrl([])).toEqual([]);
  });

  it("giu null o dung vi tri", async () => {
    const khoa = `test/${randomUUID()}.txt`;

    // try/finally la BAT BUOC: bucket nay la that va dung chung (xem storage.test.ts).
    // Neu mot assertion do o giua, khong co finally thi doi tuong bi bo lai vinh vien.
    try {
      await ghiTep(khoa, Buffer.from("x"), "text/plain");

      const kq = await kyNhieuUrl([null, khoa, null]);
      expect(kq).toHaveLength(3);
      expect(kq[0]).toBeNull();
      expect(kq[2]).toBeNull();
      expect(kq[1]).toContain(khoa);
    } finally {
      await xoaTep([khoa]);
    }
  }, 30_000);

  it("tra ve null cho khoa khong ton tai thay vi nem loi", async () => {
    const kq = await kyNhieuUrl([`test/${randomUUID()}-khong-co.txt`]);
    expect(kq[0]).toBeNull();
  }, 30_000);
});
