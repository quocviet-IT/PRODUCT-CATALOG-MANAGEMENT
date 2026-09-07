import { describe, expect, it } from "vitest";
import { anhXaBang } from "@/modules/sheet/catalogue.mapper";
import { catTrang, docBoLocTuUrl, docTrang, locDanhSach, tinhThongKe } from "@/modules/sheet/catalogue.view";
import { bangMau } from "./fixtures/bang-mau";

const ds = anhXaBang(bangMau);
const KHONG_LOC = { q: null, chatLieu: [], loaiXoan: [], chiCanhBao: false };

describe("docBoLocTuUrl", () => {
  it("doc du bon tham so", () => {
    expect(docBoLocTuUrl({ q: "d127", chat_lieu: "18KY", loai_xoan: "lab", canh_bao: "1" }))
      .toEqual({ q: "d127", chatLieu: ["18KY"], loaiXoan: ["lab"], chiCanhBao: true });
  });
  it("doc nhieu gia tri ngan bang dau phay", () => {
    expect(docBoLocTuUrl({ chat_lieu: "18KY,18KW,PT900PD" }).chatLieu)
      .toEqual(["18KY", "18KW", "PT900PD"]);
  });
  it("bo trung va bo khoang trang thua", () => {
    expect(docBoLocTuUrl({ chat_lieu: " 18KY , 18KY ,, 18KW " }).chatLieu)
      .toEqual(["18KY", "18KW"]);
  });
  it("bo gia tri loai_xoan khong hop le, giu lai gia tri hop le", () => {
    expect(docBoLocTuUrl({ loai_xoan: "bay,lab" }).loaiXoan).toEqual(["lab"]);
  });
  it("thieu tham so thi la danh sach rong, khong phai null", () => {
    expect(docBoLocTuUrl({})).toEqual({ q: null, chatLieu: [], loaiXoan: [], chiCanhBao: false });
  });
  it("chuoi rong coi nhu khong loc", () => {
    expect(docBoLocTuUrl({ q: "  " }).q).toBeNull();
  });
});

describe("tinhThongKe", () => {
  const tk = tinhThongKe(ds);
  it("dem dung tong va tung loai canh bao", () => {
    expect(tk.tong).toBe(9);
    expect(tk.thieuAnh).toBe(1);
    expect(tk.thieuSku).toBe(4);
    expect(tk.tlVangLech).toBe(1);
    expect(tk.trung).toBe(2);
  });
  it("dem theo chat lieu, nhieu nhat truoc", () => {
    expect(tk.theoChatLieu).toEqual([
      { gia_tri: "18KY", soLuong: 4 },
      { gia_tri: "18KW", soLuong: 2 },
      { gia_tri: "PT900PD", soLuong: 2 },
      { gia_tri: "14KY", soLuong: 1 },
    ]);
  });
  it("dem theo loai xoan", () => {
    expect(tk.theoLoaiXoan).toEqual([
      { gia_tri: "lab", soLuong: 5 },
      { gia_tri: "tu-nhien", soLuong: 3 },
    ]);
  });
});

describe("locDanhSach", () => {
  it("khong loc thi tra nguyen danh sach", () => {
    expect(locDanhSach(ds, KHONG_LOC)).toHaveLength(9);
  });
  it("loc theo chat lieu", () => {
    expect(locDanhSach(ds, { ...KHONG_LOC, chatLieu: ["PT900PD"] })).toHaveLength(2);
  });
  it("nhieu chat lieu la phep HOP, khong phai giao", () => {
    expect(locDanhSach(ds, { ...KHONG_LOC, chatLieu: ["PT900PD", "14KY"] })).toHaveLength(3);
  });
  it("danh sach rong nghia la khong rang buoc", () => {
    expect(locDanhSach(ds, { ...KHONG_LOC, chatLieu: [] })).toHaveLength(9);
  });
  it("tim duoc theo cot MO, khong chi ma mau va mo ta", () => {
    expect(locDanhSach(ds, { ...KHONG_LOC, q: "26.35535" })).toHaveLength(2);
  });
  it("tim duoc theo chat lieu", () => {
    expect(locDanhSach(ds, { ...KHONG_LOC, q: "14ky" })).toHaveLength(1);
  });
  it("loc theo loai xoan", () => {
    expect(locDanhSach(ds, { ...KHONG_LOC, loaiXoan: ["tu-nhien"] })).toHaveLength(3);
  });
  it("chi dong co canh bao", () => {
    // 6 dong mang co: 5,6,7,8,9,10. Dong 3,4,11 sach.
    expect(locDanhSach(ds, { ...KHONG_LOC, chiCanhBao: true })).toHaveLength(6);
  });
  it("tim theo ma mau, khong phan biet hoa thuong", () => {
    expect(locDanhSach(ds, { ...KHONG_LOC, q: "d12751" })).toHaveLength(2);
  });
  it("tim theo sku", () => {
    expect(locDanhSach(ds, { ...KHONG_LOC, q: "108632" })).toHaveLength(1);
  });
  it("tim duoc ca trong mo ta, khong chi ma mau va sku", () => {
    // "PT900PD" chi xuat hien trong Chi tiet SP cua hai dong PT900PD.
    // Go chu thuong ma van ra ket qua chu hoa -> chung minh luon tinh khong phan
    // biet hoa thuong. Tinh khong dau da co bo test rieng o tests/lib/vietnamese.test.ts.
    expect(locDanhSach(ds, { ...KHONG_LOC, q: "pt900pd" })).toHaveLength(2);
  });
  it("cong don nhieu dieu kien", () => {
    // 18KY co 4 dong (6,7,8,11); trong do 3 dong mang co (6,7,8).
    expect(locDanhSach(ds, { ...KHONG_LOC, chatLieu: ["18KY"], chiCanhBao: true }))
      .toHaveLength(3);
  });
});

describe("docTrang", () => {
  it("khong co tham so thi la trang 1", () => {
    expect(docTrang({})).toBe(1);
  });
  it("doc so hop le", () => {
    expect(docTrang({ trang: "3" })).toBe(3);
  });
  it("gia tri rac hoac nho hon 1 deu ve trang 1", () => {
    for (const v of ["0", "-5", "abc", "", "1.9e400"]) expect(docTrang({ trang: v })).toBe(1);
  });
});

describe("catTrang", () => {
  const gia = Array.from({ length: 9 }, (_, i) => ({ dongSheet: i + 1 })) as never[];

  it("chia dung so trang", () => {
    expect(catTrang(gia, 1, 4).soTrang).toBe(3);
  });
  it("trang giua lay dung lat cat", () => {
    const k = catTrang(gia, 2, 4);
    expect(k.ds).toHaveLength(4);
    expect(k.tu).toBe(5);
    expect(k.den).toBe(8);
  });
  it("trang cuoi co the ngan hon moiTrang", () => {
    const k = catTrang(gia, 3, 4);
    expect(k.ds).toHaveLength(1);
    expect(k.den).toBe(9);
  });
  it("trang vuot qua bi GHIM ve trang cuoi, khong tra danh sach rong", () => {
    const k = catTrang(gia, 999, 4);
    expect(k.trang).toBe(3);
    expect(k.ds).toHaveLength(1);
  });
  it("trang nho hon 1 bi ghim ve trang dau", () => {
    expect(catTrang(gia, -2, 4).trang).toBe(1);
  });
  it("danh sach rong van tra ve mot trang, pham vi bat dau tu 0", () => {
    const k = catTrang([], 1, 4);
    expect(k.soTrang).toBe(1);
    expect(k.tu).toBe(0);
    expect(k.den).toBe(0);
  });
});
