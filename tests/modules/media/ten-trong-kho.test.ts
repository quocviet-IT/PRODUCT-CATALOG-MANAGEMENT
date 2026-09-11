import { describe, it, expect } from "vitest";
import { mauLikeDuoiThuMuc, tenTrucTiep, thoatLike } from "@/modules/media/ten-trong-kho";

describe("thoatLike", () => {
  it("thoat ca ba ky tu dac biet cua LIKE", () => {
    // Chuoi JS "a_b%c\\d" la a_b%c\d (mot dau \); ket qua mong doi a\_b\%c\\d.
    expect(thoatLike("a_b%c\\d")).toBe("a\\_b\\%c\\\\d");
  });

  it("de nguyen chuoi binh thuong", () => {
    expect(thoatLike("sheet-cache")).toBe("sheet-cache");
  });
});

describe("mauLikeDuoiThuMuc", () => {
  it("them /% sau ten thu muc", () => {
    expect(mauLikeDuoiThuMuc("sheet-cache")).toBe("sheet-cache/%");
  });

  it("khong nhan doi dau gach khi thu muc da co / o cuoi", () => {
    expect(mauLikeDuoiThuMuc("sheet-cache/")).toBe("sheet-cache/%");
  });

  it("thoat dau gach duoi — trong LIKE no khop MOI ky tu", () => {
    // Khong thoat thi "anh_moi/%" khop ca "anhXmoi/..." cua mot thu muc khac.
    expect(mauLikeDuoiThuMuc("anh_moi")).toBe("anh\\_moi/%");
  });
});

describe("tenTrucTiep", () => {
  it("bo tien to thu muc", () => {
    expect(tenTrucTiep("sheet-cache/abc-1400.webp", "sheet-cache")).toBe("abc-1400.webp");
  });

  it("null cho khoa nam trong thu muc con — list() cu chi tra mot tang", () => {
    expect(tenTrucTiep("sheet-cache/con/abc.webp", "sheet-cache")).toBeNull();
  });

  it("null cho khoa cua thu muc khac, ke ca thu muc co ten bat dau giong", () => {
    expect(tenTrucTiep("sheet-cache-cu/abc.webp", "sheet-cache")).toBeNull();
    expect(tenTrucTiep("dong-bo/bang.json", "sheet-cache")).toBeNull();
  });

  it("null cho chinh ten thu muc, khong co tep", () => {
    expect(tenTrucTiep("sheet-cache/", "sheet-cache")).toBeNull();
  });
});
