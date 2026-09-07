import { describe, expect, it } from "vitest";
import { anhXaBang, type DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import {
  catTrang,
  dangLoc,
  docBoLocTuUrl,
  docTrang,
  locDanhSach,
  thamSoCua,
  tinhDemLoc,
  tinhThongKe,
  type BoLocCatalogue,
} from "@/modules/sheet/catalogue.view";
import { bangMau } from "./fixtures/bang-mau";

const ds = anhXaBang(bangMau);

const KHONG_LOC: BoLocCatalogue = {
  q: null,
  chatLieu: [],
  loaiSp: [],
  dongSp: [],
  mau: [],
  size: [],
  loaiXoan: [],
  canhBao: [],
  tlTu: null,
  tlDen: null,
};

/**
 * bangMau co moi dong deu la NHAN / Complete / khong mau, nen khong kiem duoc
 * ba chieu do. Day la mot tap nho dung rieng cho chung: mo ta thang bang
 * DongCatalogue vi cac ham duoi day khong quan tam bang tinh trong nhu nao.
 */
function dong(v: Partial<DongCatalogue>): DongCatalogue {
  return {
    dongSheet: 0, maMau: null, sku: null, mo: null, so: null, chiTiet: null,
    chatLieu: null, tlVang: null, size: null, dongSp: null, loaiSp: null,
    mau: null, oChu: null, loaiXoan: null, fileIdAnh: null, idThuMuc: null,
    urlThuMuc: null, co: [], ...v,
  } as DongCatalogue;
}

const DS_NHIEU_CHIEU = [
  dong({ dongSheet: 1, loaiSp: "NHẪN", dongSp: "Complete", mau: "White", size: "5" }),
  dong({ dongSheet: 2, loaiSp: "NHẪN", dongSp: "Trơn", mau: "Yellow", size: "10" }),
  dong({ dongSheet: 3, loaiSp: "LẮC", dongSp: "Complete", mau: "White", size: "18VN" }),
  dong({ dongSheet: 4, loaiSp: "DÂY CHUYỀN", dongSp: "Trơn", mau: "Yellow", size: "6.5" }),
];

describe("docBoLocTuUrl", () => {
  it("doc du moi tham so", () => {
    expect(
      docBoLocTuUrl({
        q: "d127", chat_lieu: "18KY", loai_sp: "NHẪN", dong_sp: "Trơn",
        mau: "White", size: "5.5", loai_xoan: "lab", canh_bao: "trung",
        tl_tu: "2", tl_den: "4",
      }),
    ).toEqual({
      q: "d127", chatLieu: ["18KY"], loaiSp: ["NHẪN"], dongSp: ["Trơn"],
      mau: ["White"], size: ["5.5"], loaiXoan: ["lab"], canhBao: ["trung"],
      tlTu: 2, tlDen: 4,
    });
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
  it("bo nhan canh bao khong co that", () => {
    expect(docBoLocTuUrl({ canh_bao: "khong-ton-tai,trung" }).canhBao).toEqual(["trung"]);
  });
  it("thieu tham so thi la danh sach rong, khong phai null", () => {
    expect(docBoLocTuUrl({})).toEqual(KHONG_LOC);
  });
  it("chuoi rong coi nhu khong loc", () => {
    expect(docBoLocTuUrl({ q: "  " }).q).toBeNull();
  });
  it("nhan dau phay thap phan o khoang trong luong", () => {
    expect(docBoLocTuUrl({ tl_tu: "2,5" }).tlTu).toBe(2.5);
  });
  it("trong luong khong doc duoc thi la null, KHONG phai 0", () => {
    // 0 se lang le bien "?tl_tu=abc" thanh "tu 0 gam" — mot bo loc that su
    // dang chay ma nguoi dung khong he yeu cau.
    for (const v of ["abc", "", "  ", "1.2.3"]) {
      expect(docBoLocTuUrl({ tl_tu: v }).tlTu).toBeNull();
    }
  });
});

describe("thamSoCua", () => {
  it("moi chieu co ten tham so URL rieng", () => {
    expect(thamSoCua("chatLieu")).toBe("chat_lieu");
    expect(thamSoCua("loaiSp")).toBe("loai_sp");
    expect(thamSoCua("canhBao")).toBe("canh_bao");
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
});

describe("tinhDemLoc", () => {
  it("dem theo chat lieu, nhieu nhat truoc", () => {
    expect(tinhDemLoc(ds, KHONG_LOC).chatLieu).toEqual([
      { gia_tri: "18KY", soLuong: 4 },
      { gia_tri: "18KW", soLuong: 2 },
      { gia_tri: "PT900PD", soLuong: 2 },
      { gia_tri: "14KY", soLuong: 1 },
    ]);
  });

  it("dem theo loai xoan", () => {
    expect(tinhDemLoc(ds, KHONG_LOC).loaiXoan).toEqual([
      { gia_tri: "lab", soLuong: 5 },
      { gia_tri: "tu-nhien", soLuong: 3 },
    ]);
  });

  it("mot dong mang nhieu canh bao duoc dem o TUNG canh bao", () => {
    // Dong 9 va 10 deu mang ca thieu-sku lan trung.
    expect(tinhDemLoc(ds, KHONG_LOC).canhBao).toEqual([
      { gia_tri: "thieu-sku", soLuong: 4 },
      { gia_tri: "trung", soLuong: 2 },
      { gia_tri: "thieu-anh", soLuong: 1 },
      { gia_tri: "thieu-mo-ta", soLuong: 1 },
      { gia_tri: "tl-vang-lech", soLuong: 1 },
    ]);
  });

  it("size xep theo so tang dan, he Viet xuong cuoi", () => {
    expect(tinhDemLoc(ds, KHONG_LOC).size.map((m) => m.gia_tri))
      .toEqual(["5", "6", "7", "10", "18VN"]);
  });

  it("mot chieu KHONG tu dem chinh minh: chon 18KY xong, 18KW van con so cu", () => {
    // Day la ca ly do ham nay ton tai. Neu dem theo ket qua da loc thi chon
    // 18KY xong, moi chat lieu khac tut ve 0 va khong ai bam nguoc lai duoc.
    const sauKhiChon = tinhDemLoc(ds, { ...KHONG_LOC, chatLieu: ["18KY"] }).chatLieu;
    expect(sauKhiChon).toEqual(tinhDemLoc(ds, KHONG_LOC).chatLieu);
  });

  it("nhung chieu KHAC thi co thu hep theo lua chon", () => {
    // 5 dong xoan lab: 14KY(1), 18KY(2), PT900PD(2).
    expect(tinhDemLoc(ds, { ...KHONG_LOC, loaiXoan: ["lab"] }).chatLieu).toEqual([
      { gia_tri: "18KY", soLuong: 2 },
      { gia_tri: "PT900PD", soLuong: 2 },
      { gia_tri: "14KY", soLuong: 1 },
    ]);
  });

  it("gia tri dang chon van con trong danh sach du dem ve 0", () => {
    // 14KY khong con dong nao khi da chon xoan tu-nhien. Neu bien mat thi
    // nguoi dung khong con cho nao de bo chon no ra.
    const dem = tinhDemLoc(ds, {
      ...KHONG_LOC, loaiXoan: ["tu-nhien"], chatLieu: ["14KY"],
    }).chatLieu;
    expect(dem).toContainEqual({ gia_tri: "14KY", soLuong: 0 });
  });

  it("dem duoc ba chieu loai sp / dong sp / mau", () => {
    const dem = tinhDemLoc(DS_NHIEU_CHIEU, KHONG_LOC);
    expect(dem.loaiSp).toEqual([
      { gia_tri: "NHẪN", soLuong: 2 },
      { gia_tri: "DÂY CHUYỀN", soLuong: 1 },
      { gia_tri: "LẮC", soLuong: 1 },
    ]);
    expect(dem.dongSp).toEqual([
      { gia_tri: "Complete", soLuong: 2 },
      { gia_tri: "Trơn", soLuong: 2 },
    ]);
    expect(dem.mau).toEqual([
      { gia_tri: "White", soLuong: 2 },
      { gia_tri: "Yellow", soLuong: 2 },
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
  it("hai chieu khac nhau la phep GIAO", () => {
    // 18KY co 4 dong (6,7,8,11); trong so do 2 dong xoan lab (8,11).
    expect(
      locDanhSach(ds, { ...KHONG_LOC, chatLieu: ["18KY"], loaiXoan: ["lab"] }),
    ).toHaveLength(2);
  });
  it("loc theo loai sp / dong sp / mau", () => {
    expect(locDanhSach(DS_NHIEU_CHIEU, { ...KHONG_LOC, loaiSp: ["NHẪN"] })).toHaveLength(2);
    expect(locDanhSach(DS_NHIEU_CHIEU, { ...KHONG_LOC, dongSp: ["Trơn"] })).toHaveLength(2);
    expect(locDanhSach(DS_NHIEU_CHIEU, { ...KHONG_LOC, mau: ["White"] })).toHaveLength(2);
  });
  it("loc theo size", () => {
    // Ba dong size 6: dong 5, 9, 10.
    expect(locDanhSach(ds, { ...KHONG_LOC, size: ["6"] })).toHaveLength(3);
  });
  it("loc theo mot loai canh bao cu the", () => {
    expect(locDanhSach(ds, { ...KHONG_LOC, canhBao: ["trung"] })).toHaveLength(2);
  });
  it("nhieu loai canh bao la phep HOP", () => {
    // thieu-sku: 6,7,9,10. tl-vang-lech: 8. Hop lai 5 dong.
    expect(
      locDanhSach(ds, { ...KHONG_LOC, canhBao: ["thieu-sku", "tl-vang-lech"] }),
    ).toHaveLength(5);
  });
  it("loc theo khoang trong luong, hai dau deu bao gom", () => {
    // TL vang: 2.78, 3.99, 3.92, 3.68, 3.68, 2.41, 3.58, 3.58, 5.07
    expect(locDanhSach(ds, { ...KHONG_LOC, tlTu: 3.6, tlDen: 4 })).toHaveLength(4);
    expect(locDanhSach(ds, { ...KHONG_LOC, tlTu: 5.07 })).toHaveLength(1);
    expect(locDanhSach(ds, { ...KHONG_LOC, tlDen: 2.41 })).toHaveLength(1);
  });
  it("dong khong co trong luong bi LOAI khi dat khoang", () => {
    const khongTl = [dong({ dongSheet: 1, tlVang: null })];
    expect(locDanhSach(khongTl, { ...KHONG_LOC, tlTu: 1 })).toHaveLength(0);
    // Nhung khong dat khoang thi no van phai co mat.
    expect(locDanhSach(khongTl, KHONG_LOC)).toHaveLength(1);
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
  it("cong don o tim kiem voi mot chieu", () => {
    // 18KY co 4 dong (6,7,8,11); trong do 3 dong mang co (6,7,8).
    expect(
      locDanhSach(ds, {
        ...KHONG_LOC,
        chatLieu: ["18KY"],
        canhBao: ["thieu-sku", "thieu-mo-ta", "tl-vang-lech"],
      }),
    ).toHaveLength(3);
  });
});

describe("dangLoc", () => {
  it("khong co rang buoc nao thi false", () => {
    expect(dangLoc(KHONG_LOC)).toBe(false);
  });
  it("bat ky chieu nao co gia tri deu tinh la dang loc", () => {
    expect(dangLoc({ ...KHONG_LOC, size: ["5"] })).toBe(true);
    expect(dangLoc({ ...KHONG_LOC, canhBao: ["trung"] })).toBe(true);
    expect(dangLoc({ ...KHONG_LOC, q: "x" })).toBe(true);
    expect(dangLoc({ ...KHONG_LOC, tlDen: 3 })).toBe(true);
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
