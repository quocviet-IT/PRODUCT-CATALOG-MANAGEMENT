import { describe, expect, it } from "vitest";
import type { DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import {
  SO_MUC_TOI_DA,
  docNoiDung,
  dungNoiDung,
  khoaMau,
  chuanHoaSlug,
  dungSlug,
  tenHienThi,
  type NguonMau,
} from "@/modules/catalogue-share/chia-se.model";

function dong(v: Partial<DongCatalogue>): DongCatalogue {
  return {
    dongSheet: 1, maMau: null, sku: null, mo: null, so: null, chiTiet: null,
    chatLieu: null, tlVang: null, size: null, dongSp: null, loaiSp: null,
    mau: null, oChu: null, loaiXoan: null, fileIdAnh: null, idThuMuc: null,
    urlThuMuc: null, co: [], ...v,
  } as DongCatalogue;
}

const A = dong({
  dongSheet: 3, maMau: "D12741", sku: "108632", mo: "25.34648", so: "25.10006",
  chiTiet: "LGDRI: 14KY 7RD/0.326cts", chatLieu: "14K", mau: "Yellow",
  size: "10", tlVang: 2.78, loaiSp: "NHẪN", oChu: "bi mat",
  idThuMuc: "thumuc-a", urlThuMuc: "https://drive.google.com/drive/folders/thumuc-a",
  co: ["thieu-sku"],
});
const B = dong({ dongSheet: 4, maMau: "D11030", chatLieu: "18K", loaiSp: "LẮC" });

const NGUON: NguonMau[] = [
  { d: A, anh: [
    { fileId: "a1", ten: "anh 1.jpg" },
    { fileId: "a2", ten: "anh 2.jpg" },
    { fileId: "a3", ten: "anh 3.jpg" },
  ] },
  { d: B, anh: [{ fileId: "b1", ten: "b.jpg" }] },
];

describe("khoaMau", () => {
  it("dung ma mau khi co", () => {
    expect(khoaMau(A)).toBe("D12741");
  });
  it("lui ve so dong khi khong co ma mau", () => {
    expect(khoaMau(dong({ dongSheet: 9 }))).toBe("dong-9");
  });
});

describe("dungNoiDung", () => {
  it("giu dung nhung anh sale chon, dung thu tu thu vien", () => {
    const kq = dungNoiDung(NGUON, [{ ma: "D12741", anh: ["a3", "a1"] }]);
    expect(kq.muc).toHaveLength(1);
    expect(kq.muc[0].anh).toEqual([
      { fileId: "a1", ten: "anh 1.jpg" },
      { fileId: "a3", ten: "anh 3.jpg" },
    ]);
  });

  it("giu THU TU sale da chon, khong sap lai theo bang tinh", () => {
    const kq = dungNoiDung(NGUON, [
      { ma: "D11030", anh: ["b1"] },
      { ma: "D12741", anh: ["a1"] },
    ]);
    expect(kq.muc.map((m) => m.maMau)).toEqual(["D11030", "D12741"]);
  });

  it("KHONG mang theo truong noi bo sang catalogue khach xem", () => {
    // Day la ranh gioi rieng tu, khong phai chi tiet trinh bay: mot truong lot
    // qua day la lo ma kho / canh bao chat luong du lieu cho khach hang.
    const [m] = dungNoiDung(NGUON, [{ ma: "D12741", anh: ["a1"] }]).muc;
    for (const cam of ["sku", "mo", "so", "chiTiet", "co", "idThuMuc", "urlThuMuc", "oChu", "dongSheet"]) {
      expect(m).not.toHaveProperty(cam);
    }
    expect(Object.keys(m).sort()).toEqual(
      ["anh", "chatLieu", "loaiSp", "mau", "maMau", "size", "tlVang"].sort(),
    );
  });

  it("bo fileId khong co trong thu vien cua chinh mau do", () => {
    // Danh sach nay den tu trinh duyet nen khong tin duoc.
    const [m] = dungNoiDung(NGUON, [{ ma: "D12741", anh: ["a1", "b1", "bia-dat"] }]).muc;
    expect(m.anh.map((a) => a.fileId)).toEqual(["a1"]);
  });

  it("bo lua chon tro toi mau khong ton tai", () => {
    expect(dungNoiDung(NGUON, [{ ma: "KHONG-CO", anh: [] }]).muc).toHaveLength(0);
  });

  it("chon trung mot mau hai lan chi ra mot muc", () => {
    const kq = dungNoiDung(NGUON, [
      { ma: "D12741", anh: ["a1"] },
      { ma: "D12741", anh: ["a2"] },
    ]);
    expect(kq.muc).toHaveLength(1);
    expect(kq.muc[0].anh.map((a) => a.fileId)).toEqual(["a1"]);
  });

  it("mau khong con anh nao van duoc giu — sale co the muon gui rieng thong so", () => {
    const [m] = dungNoiDung(NGUON, [{ ma: "D12741", anh: [] }]).muc;
    expect(m.maMau).toBe("D12741");
    expect(m.anh).toEqual([]);
  });

  it("chan tran so muc", () => {
    const nhieu = Array.from({ length: SO_MUC_TOI_DA + 20 }, (_, i) => ({
      d: dong({ dongSheet: i + 1, maMau: `M${i}` }),
      anh: [],
    }));
    const chon = nhieu.map((n) => ({ ma: n.d.maMau!, anh: [] }));
    expect(dungNoiDung(nhieu, chon).muc).toHaveLength(SO_MUC_TOI_DA);
  });
});

describe("docNoiDung", () => {
  it("doc duoc ban ghi dung dinh dang", () => {
    const goc = dungNoiDung(NGUON, [{ ma: "D12741", anh: ["a1"] }]);
    expect(docNoiDung(JSON.parse(JSON.stringify(goc)))).toEqual(goc);
  });
  it("tra null cho ban ghi hong, khong nem loi", () => {
    // Trang khach dang mo khong duoc sap vi mot ban ghi la.
    for (const xau of [null, undefined, 42, "x", {}, { phienBan: 2, muc: [] }, { phienBan: 1 }]) {
      expect(docNoiDung(xau)).toBeNull();
    }
  });
});

describe("tenHienThi", () => {
  it("dung ten sale dat khi co", () => {
    expect(tenHienThi("Chị Lan — nhẫn cưới", 7)).toBe("Chị Lan — nhẫn cưới");
  });
  it("bo trong thi goi theo so thu tu", () => {
    // Truoc day cho nay tra ve "Catalogue <ngay>", va hai catalogue tao cung
    // ngay mang y het mot ten. So thu tu thi khong bao gio trung.
    expect(tenHienThi("", 12)).toBe("Catalogue #12");
  });
  it("chuoi chi co khoang trang cung tinh la bo trong", () => {
    expect(tenHienThi("   ", 3)).toBe("Catalogue #3");
  });
  it("cat khoang trang thua o hai dau ten that", () => {
    expect(tenHienThi("  Anh Minh  ", 3)).toBe("Anh Minh");
  });
});

describe("chuanHoaSlug", () => {
  it("bo dau tieng Viet va ha chu thuong", () => {
    expect(chuanHoaSlug("Chị Lan — nhẫn cưới 18K")).toBe("chi-lan-nhan-cuoi-18k");
  });
  it("gop moi cum ky tu la thanh mot dau gach", () => {
    expect(chuanHoaSlug("A///B   C__D")).toBe("a-b-c-d");
  });
  it("khong de lai dau gach o hai dau", () => {
    expect(chuanHoaSlug("  --- Xin chao --- ")).toBe("xin-chao");
  });
  it("ten toan ky tu la thi tra ve rong", () => {
    expect(chuanHoaSlug("★★★")).toBe("");
    expect(chuanHoaSlug("   ")).toBe("");
  });
  it("cat bot ten qua dai ma khong de dau gach thua o cuoi", () => {
    const dai = chuanHoaSlug("a".repeat(50) + " " + "b".repeat(50));
    expect(dai.length).toBeLessThanOrEqual(60);
    expect(dai.endsWith("-")).toBe(false);
  });
});

describe("dungSlug", () => {
  it("ghep ten doc duoc voi duoi ngau nhien", () => {
    expect(dungSlug("Chị Lan — nhẫn cưới 18K", 16, "k3m9x2p4"))
      .toBe("chi-lan-nhan-cuoi-18k-k3m9x2p4");
  });
  it("khong dat ten thi goi theo so, trung voi ten hien tren trang", () => {
    expect(dungSlug("", 16, "k3m9x2p4")).toBe("catalogue-16-k3m9x2p4");
    expect(tenHienThi("", 16)).toBe("Catalogue #16");
  });
  it("ten toan ky tu la cung lui ve so, khong ra duong dan bat dau bang dau gach", () => {
    expect(dungSlug("★★★", 7, "aaaaaaaa")).toBe("catalogue-7-aaaaaaaa");
  });
  it("duong dan LUON con duoi ngau nhien — day la thu chan nguoi la mo nham", () => {
    // Neu bo duoi nay thi ai cung do duoc catalogue cua khach khac bang cach
    // doan ten. Duong dan phai co it nhat mot doan sau cung khong doan duoc.
    for (const ten of ["Chị Lan", "", "★"]) {
      expect(dungSlug(ten, 1, "zzzzzzzz").endsWith("-zzzzzzzz")).toBe(true);
    }
  });
});
