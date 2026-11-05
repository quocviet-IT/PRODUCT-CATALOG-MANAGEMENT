import { describe, it, expect } from "vitest";
import { anhThuNho, ganAnhDaiDien } from "@/modules/sheet/anh-dai-dien";
import type { DongCatalogue } from "@/modules/sheet/catalogue.mapper";

function dong(v: Partial<DongCatalogue>): DongCatalogue {
  return {
    dongSheet: 3, sku: null, maMau: "N10145", mo: null, so: null, dongSp: null, loaiSp: null,
    mau: null, oChu: null, chiTiet: null, chatLieu: null, loaiXoan: null, tlVang: null,
    size: null, fileIdAnh: "anh-cot-hinh", urlThuMuc: null, idThuMuc: "q1",
    urlAnhConcept: null, urlClipTho: null, urlClipDaXuLy: null, tenClipDaXuLy: null,
    moTa1: null, moTa2: null, co: [], ...v,
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
    // Ba dong nay van co anh cot HINH nen luoi KHONG trong -> khong bao thieu.
    expect(ds.some((d) => d.co.includes("thieu-anh"))).toBe(false);
  });

  it("co 'thieu-anh' di theo dung tam ANH THU NHO dang hien, khong theo rieng nguon nao", () => {
    // Co cot HINH, thu muc Q rong: luoi VAN hien anh cot HINH -> khong bao thieu.
    const [coHinh] = ganAnhDaiDien([dong({ idThuMuc: "rong", co: ["thieu-anh"] })], banDo);
    expect(coHinh.co).not.toContain("thieu-anh");

    // Thieu cot HINH nhung thu muc Q co anh: lui ve duoc -> khong bao thieu.
    const [luiDuoc] = ganAnhDaiDien([dong({ fileIdAnh: null, co: ["thieu-anh"] })], banDo);
    expect(luiDuoc.co).not.toContain("thieu-anh");

    // Ca hai deu khong co: o anh trong that -> phai bao thieu.
    const [trong] = ganAnhDaiDien([dong({ fileIdAnh: null, idThuMuc: "rong", co: [] })], banDo);
    expect(trong.co).toContain("thieu-anh");
  });

  it("dat 'thieu-anh' ngay sau 'thieu-sku', dung cho mapper van dat", () => {
    const trong = { fileIdAnh: null, idThuMuc: null };
    const [d] = ganAnhDaiDien([dong({ ...trong, co: ["thieu-sku", "thieu-mo-ta"] })], banDo);
    expect(d.co).toEqual(["thieu-sku", "thieu-anh", "thieu-mo-ta"]);
    const [khongSku] = ganAnhDaiDien([dong({ ...trong, co: ["thieu-mo-ta"] })], banDo);
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
  // CHOT 05/11/2026, dao lai quyet dinh 11/09: o anh tren bang lay tam o COT
  // HINH. Do la tam nguoi ban hang tu chon lam dai dien; anh dau thu muc chi la
  // tam Drive tra ve truoc, khong ai ngam qua.
  it("co anh cot HINH thi lay no, ke ca khi thu muc Q cung co anh", () => {
    expect(anhThuNho({ fileIdAnh: "hinh", anhDaiDien: "q" })).toBe("hinh");
  });

  it("cot HINH de trong thi lui ve anh dau thu muc Q", () => {
    expect(anhThuNho({ fileIdAnh: null, anhDaiDien: "q" })).toBe("q");
  });

  it("ca hai deu khong co thi tra null", () => {
    expect(anhThuNho({ fileIdAnh: null, anhDaiDien: null })).toBeNull();
  });

  it("nguon khong co ban do anh (chay bang tep mau) thi van ra cot HINH", () => {
    expect(anhThuNho({ fileIdAnh: "hinh" })).toBe("hinh");
  });

  it("khong cot HINH va cung chua tinh anh dai dien thi tra null, khong tra undefined", () => {
    expect(anhThuNho({ fileIdAnh: null })).toBeNull();
  });
});

describe("ganAnhDaiDien — so anh cua mau", () => {
  it("dem so anh trong thu muc cot Hinh da xu ly", () => {
    const [d] = ganAnhDaiDien([dong({})], banDo);
    expect(d.soAnh).toBe(2);
  });

  it("thu muc rong thi la 0, khong phai undefined — da tinh roi va ket qua la khong co", () => {
    const [d] = ganAnhDaiDien([dong({ idThuMuc: "rong" })], banDo);
    expect(d.soAnh).toBe(0);
  });

  it("dong khong co thu muc thi la 0", () => {
    const [d] = ganAnhDaiDien([dong({ idThuMuc: null })], banDo);
    expect(d.soAnh).toBe(0);
  });

  it("thu muc chua liet ke lan nao cung la 0", () => {
    const [d] = ganAnhDaiDien([dong({ idThuMuc: "chua-co-trong-ban-do" })], banDo);
    expect(d.soAnh).toBe(0);
  });
});
