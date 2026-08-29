import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { dungKhoa, ghiTep, xoaTep, layUrlCoKy } from "@/modules/media/storage";

describe("dungKhoa", () => {
  it("gom theo san pham roi den anh va bien the", () => {
    expect(dungKhoa("p1", "i1", "thumb", "webp")).toBe("products/p1/i1/thumb.webp");
  });
  it("dat ban goc canh cac bien the", () => {
    expect(dungKhoa("p1", "i1", "goc", "jpg")).toBe("products/p1/i1/goc.jpg");
  });
});

describe("Supabase Storage", () => {
  it("ghi, ky URL roi xoa duoc mot tep", async () => {
    const khoa = `test/${randomUUID()}.txt`;

    // try/finally la BAT BUOC: bucket nay la that va dung chung. Neu mot assertion
    // do o giua, khong co finally thi doi tuong bi bo lai vinh vien tren ha tang that.
    try {
      await ghiTep(khoa, Buffer.from("xin chao"), "text/plain");

      const url = await layUrlCoKy(khoa, 60);
      expect(url).toContain(khoa);

      const res = await fetch(url);
      expect(res.status).toBe(200);
      expect(await res.text()).toBe("xin chao");
    } finally {
      await xoaTep([khoa]);
    }

    // Khang dinh TRUC TIEP: sau khi xoa thi ky lai phai that bai.
    // Khong duoc dua vao viec URL cu bi tu choi — cach do chi dung nho mot chuoi
    // hanh vi trung hop, va se am tham mat rang neu layUrlCoKy doi sang tra ve null.
    await expect(layUrlCoKy(khoa, 60)).rejects.toThrow();
  }, 30_000);
});
