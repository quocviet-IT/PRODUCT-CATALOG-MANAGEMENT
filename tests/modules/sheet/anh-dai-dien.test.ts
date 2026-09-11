import { describe, it, expect } from "vitest";
import { anhThuNho, ganAnhDaiDien } from "@/modules/sheet/anh-dai-dien";
import type { DongCatalogue } from "@/modules/sheet/catalogue.mapper";

function dong(v: Partial<DongCatalogue>): DongCatalogue {
  return {
    dongSheet: 3, sku: null, maMau: "N10145", mo: null, so: null, dongSp: null, loaiSp: null,
    mau: null, oChu: null, chiTiet: null, chatLieu: null, loaiXoan: null, tlVang: null,
    size: null, fileIdAnh: "anh-cot-hinh", urlThuMuc: null, idThuMuc: "q1",
    urlAnhConcept: null, urlClipTho: null, moTa1: null, moTa2: null, co: [], ...v,
  };
}

const banDo = {
  q1: [{ fileId: "q1-dau" }, { fileId: "q1-hai" }],
  rong: [],
};

describe("ganAnhDaiDien", () => {
  it("lay anh DAU TIEN trong thu muc cot Hinh da xu ly, khong lay cot HINH", () => {
    const [d] = ganAnhDaiDien([dong({})], banDo);
    expect(d.anhDaiDien).toBe("q1-dau");
  });

  it("khong co thu muc, thu muc chua liet ke, hay thu muc rong thi khong co anh", () => {
    const ds = ganAnhDaiDien(
      [dong({ idThuMuc: null }), dong({ idThuMuc: "chua-liet-ke" }), dong({ idThuMuc: "rong" })],
      banDo,
    );
    expect(ds.map((d) => d.anhDaiDien)).toEqual([null, null, null]);
    expect(ds.every((d) => d.co.includes("thieu-anh"))).toBe(true);
  });

  it("co 'thieu-anh' di theo anh thu nho, KHONG theo cot HINH", () => {
    // Dong thieu cot HINH nhung co anh cot Q: luoi hien anh, nen khong duoc bao thieu.
    const [coAnh] = ganAnhDaiDien([dong({ fileIdAnh: null, co: ["thieu-anh"] })], banDo);
    expect(coAnh.co).not.toContain("thieu-anh");
    // Dong co cot HINH nhung thu muc cot Q rong: luoi trong, nen phai bao thieu.
    const [trong] = ganAnhDaiDien([dong({ idThuMuc: "rong", co: [] })], banDo);
    expect(trong.co).toContain("thieu-anh");
  });

  it("dat 'thieu-anh' ngay sau 'thieu-sku', dung cho mapper van dat", () => {
    const [d] = ganAnhDaiDien([dong({ idThuMuc: null, co: ["thieu-sku", "thieu-mo-ta"] })], banDo);
    expect(d.co).toEqual(["thieu-sku", "thieu-anh", "thieu-mo-ta"]);
    const [khongSku] = ganAnhDaiDien([dong({ idThuMuc: null, co: ["thieu-mo-ta"] })], banDo);
    expect(khongSku.co).toEqual(["thieu-anh", "thieu-mo-ta"]);
  });

  it("khong sua dong dau vao — dich vu dang giu no trong bo dem", () => {
    const goc = dong({ co: ["thieu-anh"] });
    ganAnhDaiDien([goc], banDo);
    expect(goc.anhDaiDien).toBeUndefined();
    expect(goc.co).toEqual(["thieu-anh"]);
  });
});

describe("anhThuNho", () => {
  it("co anh dai dien thi lay no", () => {
    expect(anhThuNho({ fileIdAnh: "hinh", anhDaiDien: "q" })).toBe("q");
  });

  it("chua tinh (nguon khong co ban do anh) thi lui ve cot HINH nhu cu", () => {
    expect(anhThuNho({ fileIdAnh: "hinh" })).toBe("hinh");
  });

  it("da tinh ma khong co anh thi KHONG lui ve cot HINH — anh do khong duoc nap", () => {
    expect(anhThuNho({ fileIdAnh: "hinh", anhDaiDien: null })).toBeNull();
  });
});
