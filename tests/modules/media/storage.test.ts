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
    await ghiTep(khoa, Buffer.from("xin chao"), "text/plain");

    const url = await layUrlCoKy(khoa, 60);
    expect(url).toContain(khoa);

    const res = await fetch(url);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("xin chao");

    await xoaTep([khoa]);
    const sau = await fetch(await layUrlCoKy(khoa, 60).catch(() => url));
    expect(sau.status).not.toBe(200);
  }, 30_000);
});
