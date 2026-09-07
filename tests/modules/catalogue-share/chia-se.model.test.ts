import { describe, expect, it } from "vitest";
import type { DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import {
  SO_MUC_TOI_DA,
  docNoiDung,
  dungNoiDung,
  khoaMau,
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
