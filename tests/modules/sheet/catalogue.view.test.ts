import { describe, expect, it } from "vitest";
import { anhXaBang, type DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import {
  catTrang,
  dangLoc,
  docBoLocTuUrl,
  docTrang,
  locDanhSach,
  tachTuKhoa,
  thamSoCua,
  tinhDemLoc,
  tinhThongKe,
  locGoiY,
  tuVungGoiY,
  cotRong,
  dongLapMa,
  docSapXepTuUrl,
  sapXepDanhSach,
  COT_AN_DUOC,
  SAP_MAC_DINH,
  type BoLocCatalogue,
} from "@/modules/sheet/catalogue.view";
import { bangMau } from "./fixtures/bang-mau";
import { khoaMau } from "@/modules/catalogue-share/chia-se.model";

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

describe("tim kiem", () => {
  const DS = [
    dong({ dongSheet: 1, maMau: "D12741", sku: "108632", chatLieu: "18K",
           mau: "White", loaiSp: "NHẪN", dongSp: "Complete", size: "5",
           tlVang: 2.78, loaiXoan: "lab" }),
    dong({ dongSheet: 2, maMau: "D11030", chatLieu: "14K", mau: "Yellow",
           loaiSp: "LẮC", dongSp: "Trơn", size: "6.75", tlVang: 5.07,
           loaiXoan: "tu-nhien" }),
    dong({ dongSheet: 3, maMau: "N10145", chatLieu: "18K", mau: "White",
           loaiSp: "DÂY CHUYỀN", size: "18VN" }),
  ];
  const dem = (q: string) => locDanhSach(DS, { ...KHONG_LOC, q }).length;

  it("khong dau, co dau, hoa thuong deu ra nhu nhau", () => {
    for (const q of ["nhẫn", "nhan", "NHAN", "NhẪn"]) expect(dem(q)).toBe(1);
  });

  it("go tieng Anh ra hang tieng Viet va nguoc lai", () => {
    expect(dem("ring")).toBe(1);        // NHẪN
    expect(dem("bracelet")).toBe(1);    // LẮC
    expect(dem("necklace")).toBe(1);    // DÂY CHUYỀN
    expect(dem("trắng")).toBe(2);       // White
    expect(dem("plain")).toBe(1);       // Trơn
  });

  it("'vàng' la KIM LOAI, khong phai chi mau Yellow", () => {
    // Ca ba mau deu la 14K/18K nen ca ba deu la vang — ke ca cai mau White,
    // vi vang trang van la vang. Truoc day cau nay chi ra dung mot mau (mau
    // co cot MAU = Yellow), va do la cach hieu sai: nguoi ta go "vang" de tim
    // do vang, khong phai de tim do mau vang.
    expect(dem("vàng")).toBe(3);
    expect(dem("gold")).toBe(3);
    // Muon dung mau vang thi go them chu mau.
    expect(dem("vàng yellow")).toBe(DS.filter((d) => d.mau === "Yellow").length);
  });

  it("NHIEU TU: moi tu deu phai co, khong can dung thu tu", () => {
    // Truoc day ca hai cau nay tra ve 0 vi cau tim duoc doi chieu nguyen cum
    // voi chuoi da ghep — "nhan" va "18k" nam o hai cot, khong bao gio ke nhau.
    expect(dem("nhan 18k")).toBe(1);
    expect(dem("18k nhan")).toBe(1);
    expect(dem("white 18k")).toBe(2);
    expect(dem("nhan 14k")).toBe(0);
  });

  it("tim duoc theo TL vang, ca dau cham lan dau phay", () => {
    expect(dem("2.78")).toBe(1);
    expect(dem("2,78")).toBe(1);
  });

  it("tim duoc theo loai xoan", () => {
    expect(dem("lab")).toBe(1);
    expect(dem("tự nhiên")).toBe(1);
    expect(dem("natural")).toBe(1);
  });

  it("tu ngan chi khop tu DAU tu, khong khop giua tu", () => {
    // "lac" khong duoc keo theo "necklace" — nguoi tim vong lac ma ra day
    // chuyen la sai han y dinh.
    expect(dem("lac")).toBe(1);
  });

  it("tu tu 4 ky tu tro len khop duoc ca giua tu — do la cach go ma hang", () => {
    expect(dem("12741")).toBe(1);
    expect(dem("1030")).toBe(1);
  });

  it("tu khong co trong bang thi khong ra gi, ke ca khi di kem tu co that", () => {
    expect(dem("khongcogi")).toBe(0);
    expect(dem("nhan khongcogi")).toBe(0);
  });
});

describe("tachTuKhoa", () => {
  it("tach theo khoang trang, bo dau, ha chu thuong", () => {
    expect(tachTuKhoa("  Nhẫn   18K  ")).toEqual(["nhan", "18k"]);
  });
  it("khong co cau tim thi khong co tu nao", () => {
    expect(tachTuKhoa(null)).toEqual([]);
    expect(tachTuKhoa("   ")).toEqual([]);
  });
});

describe("tim kiem hai cot mo ta", () => {
  const tim = (q: string) => locDanhSach(ds, { ...KHONG_LOC, q });

  it("tim duoc chu trong Mo ta 1", () => {
    // Nguoi dung bao go "mân côi" khong ra gi (09/09/2026): ca hai cot mo ta
    // chua bao gio duoc doc vao he thong.
    expect(tim("mân côi").length).toBe(1);
    expect(tim("mân côi")[0].moTa1).toBe("Dây mân côi");
  });

  it("tim duoc chu trong Mo ta 2", () => {
    expect(tim("nhẫn band").length).toBeGreaterThan(0);
    expect(tim("nhẫn band").every((d) => d.moTa2?.includes("Nhẫn band"))).toBe(true);
  });

  it("khong dau van tim duoc", () => {
    expect(tim("man coi").length).toBe(tim("mân côi").length);
  });

  it("tieng Anh tim ra chu tieng Viet trong mo ta", () => {
    // "Dây mân côi" -> day = chain, man coi = rosary.
    expect(tim("rosary").length).toBe(1);
    expect(tim("chain rosary").length).toBe(1);
  });

  it("kim cuong dich tu loaiXoan chu khong tu chu 'xoan'", () => {
    // "xoàn" (kim cuong) va "xoắn" (van thung) bo dau xong la mot tu. Neu dich
    // thang tu do sang "diamond" thi mot cai lac xoan la se hien ra khi khach
    // tim "diamond". Ban dich phai den tu loaiXoan — cho doc ma LGDRI/DIARI.
    const coXoan = ds.filter((d) => d.loaiXoan !== null);
    expect(coXoan.length).toBeGreaterThan(0);
    expect(tim("diamond").length).toBe(coXoan.length);
  });
});

describe("chat lieu la MA, phai doc ra chu", () => {
  const tim = (q: string) => locDanhSach(ds, { ...KHONG_LOC, q });

  it("go 'gold' ra duoc cac mau 14K/18K", () => {
    // Bang tinh chi ghi "18K", "14KY" — khong co chu "vang" hay "gold" nao de
    // ma khop. Truoc khi doc ma nay thi "gold" ra 0 mau, trong khi gan het bang
    // la vang.
    const vang = ds.filter((d) => /^\d+\s*K/i.test(d.chatLieu ?? ""));
    expect(vang.length).toBeGreaterThan(0);
    expect(tim("gold").length).toBe(vang.length);
    expect(tim("vàng").length).toBe(vang.length);
  });

  it("doc duoc chu cai mau trong ma: 14KY la vang yellow", () => {
    const ky = ds.filter((d) => /^\d+\s*KY/i.test(d.chatLieu ?? ""));
    if (ky.length === 0) return;
    expect(tim("yellow gold").length).toBeGreaterThanOrEqual(ky.length);
  });

  it("PT la bach kim, khong phai vang", () => {
    const pt = ds.filter((d) => /^PT/i.test(d.chatLieu ?? ""));
    if (pt.length === 0) return;
    expect(tim("platinum").length).toBe(pt.length);
  });
});

describe("goi y khi go tim", () => {
  const tuVung = tuVungGoiY(ds);

  it("chua go gi thi khong goi y", () => {
    expect(locGoiY(tuVung, null)).toEqual([]);
    expect(locGoiY(tuVung, "   ")).toEqual([]);
  });

  it("goi y chu that trong bang tinh, kem so mau", () => {
    const kq = locGoiY(tuVung, "man");
    expect(kq.map((m) => m.chu)).toContain("Dây mân côi");
    expect(kq.find((m) => m.chu === "Dây mân côi")?.nhom).toBe("moTa");
    expect(kq.find((m) => m.chu === "Dây mân côi")?.soLuong).toBe(1);
  });

  it("go het chinh goi y do thi thoi goi y no nua", () => {
    expect(locGoiY(tuVung, "Dây mân côi").map((m) => m.chu)).not.toContain("Dây mân côi");
  });

  it("moi goi y bam vao deu phai ra ket qua", () => {
    // Mot goi y hien ra roi bam vao lai ra bang rong thi te hon la khong co
    // goi y. Kiem bang chinh bo loc that.
    for (const m of tuVung) {
      expect(locDanhSach(ds, { ...KHONG_LOC, q: m.chu }).length, m.chu).toBeGreaterThan(0);
    }
  });

  it("khong lap lai mot chu hai lan", () => {
    const chu = tuVung.map((m) => m.chu);
    expect(new Set(chu).size).toBe(chu.length);
  });

  it("cat bot khi qua nhieu", () => {
    expect(locGoiY(tuVung, "a", 3).length).toBeLessThanOrEqual(3);
  });
});

describe("sap xep", () => {
  const ma = (l: DongCatalogue[]) => l.map((d) => d.maMau);

  it("mac dinh la thu tu bang tinh", () => {
    expect(docSapXepTuUrl({})).toEqual({ khoa: "dong", chieu: "tang" });
    expect(sapXepDanhSach(ds, SAP_MAC_DINH).map((d) => d.dongSheet))
      .toEqual([...ds].map((d) => d.dongSheet).sort((a, b) => a - b));
  });

  it("khoa la khong nhan thi lui ve mac dinh", () => {
    // Tham so den tu URL, ai cung go tay duoc.
    expect(docSapXepTuUrl({ sap: "../bi-mat", chieu: "xxx" })).toEqual(SAP_MAC_DINH);
  });

  it("dao chieu dao dung thu tu", () => {
    const tang = ma(sapXepDanhSach(ds, { khoa: "maMau", chieu: "tang" }));
    const giam = ma(sapXepDanhSach(ds, { khoa: "maMau", chieu: "giam" }));
    // Chi so sanh phan KHONG rong: o trong luon o cuoi ca hai chieu.
    const tangCo = tang.filter((x) => x !== null);
    const giamCo = giam.filter((x) => x !== null);
    expect(giamCo).toEqual([...tangCo].reverse());
  });

  it("o trong luon xuong cuoi, ca hai chieu", () => {
    // Dao chieu ma dua ca mot man hinh o trong len dau thi nguoi dung tuong
    // bang hong.
    for (const chieu of ["tang", "giam"] as const) {
      const kq = sapXepDanhSach(ds, { khoa: "sku", chieu });
      const viTriRong = kq.findIndex((d) => d.sku === null);
      if (viTriRong === -1) continue;
      expect(kq.slice(viTriRong).every((d) => d.sku === null)).toBe(true);
    }
  });

  it("khong sua mang goc", () => {
    const truoc = ma(ds);
    sapXepDanhSach(ds, { khoa: "maMau", chieu: "giam" });
    expect(ma(ds)).toEqual(truoc);
  });

  it("tl vang sap theo SO, khong theo chuoi", () => {
    const kq = sapXepDanhSach(ds, { khoa: "tlVang", chieu: "tang" })
      .map((d) => d.tlVang)
      .filter((v): v is number => v !== null);
    expect(kq).toEqual([...kq].sort((a, b) => a - b));
  });

  it("bang nhau thi giu thu tu bang tinh — khong nhay lung tung", () => {
    const kq = sapXepDanhSach(ds, { khoa: "chatLieu", chieu: "tang" });
    for (let i = 1; i < kq.length; i++) {
      if (kq[i].chatLieu === kq[i - 1].chatLieu) {
        expect(kq[i].dongSheet).toBeGreaterThan(kq[i - 1].dongSheet);
      }
    }
  });
});

describe("cot rong", () => {
  it("bat duoc cot khong dong nao co du lieu", () => {
    // Bang co 16 cot va phai keo ngang moi het. Mot cot rong tuyet doi chi ton
    // be ngang de bay ra mot cot gach ngang.
    expect(cotRong(ds).has("oChu")).toBe(true);
    expect(cotRong(ds).has("chiTiet")).toBe(false);
  });

  it("danh sach rong khi khong co dong nao thi coi la rong het", () => {
    expect(cotRong([]).size).toBe(COT_AN_DUOC.length);
  });

  it("cot Clip da xu ly an khi khong dong nao co clip, hien khi co mot dong", () => {
    // Ban sao bang tinh chua them cot R khong duoc bay ra mot cot gach ngang.
    expect(cotRong(ds).has("clip")).toBe(true);
    const coClip: DongCatalogue = {
      ...ds[0], urlClipDaXuLy: "https://drive.google.com/file/d/x/view", tenClipDaXuLy: "C10068.mp4",
    };
    expect(cotRong([...ds, coClip]).has("clip")).toBe(false);
  });
});

describe("dong lap mot ma mau", () => {
  const d = (dongSheet: number, maMau: string | null) =>
    ({ ...ds[0], dongSheet, maMau }) as DongCatalogue;

  it("chi dong DAU cua moi ma la khong lap", () => {
    // O tich mang khoa la MA MAU, nhung bang hien mot dong moi bien the. Hai o
    // cung khoa thi tich mot cai la ca hai cung tich, bo mot cai la ca hai cung
    // bo — nguoi dung bao loi, va ho dung.
    const lap = dongLapMa([d(1, "A"), d(2, "A"), d(3, "B"), d(4, "A")], khoaMau);
    expect([...lap].sort((x, y) => x - y)).toEqual([2, 4]);
  });

  it("moi ma mot dong thi khong co dong nao lap", () => {
    expect(dongLapMa([d(1, "A"), d(2, "B")], khoaMau).size).toBe(0);
  });

  it("dong khong co ma mau thi moi dong la mot khoa rieng", () => {
    // khoaMau lui ve "dong-<so>" nen hai dong trong khong bi coi la trung nhau.
    expect(dongLapMa([d(1, null), d(2, null)], khoaMau).size).toBe(0);
  });

  it("tinh theo THU TU dang hien, khong theo so dong bang tinh", () => {
    // Doi cach sap xep thi dong dau doi theo — van luon dung mot o tich cho
    // moi ma tren man hinh.
    expect([...dongLapMa([d(9, "A"), d(2, "A")], khoaMau)]).toEqual([2]);
  });
});
