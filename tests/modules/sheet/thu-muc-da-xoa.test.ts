import { describe, it, expect } from "vitest";
import { ganCoThuMucDaXoa } from "@/modules/sheet/thu-muc-da-xoa";
import type { DongCatalogue } from "@/modules/sheet/catalogue.mapper";

const dong = (idThuMuc: string | null, co: DongCatalogue["co"] = []): DongCatalogue =>
  ({ idThuMuc, co }) as DongCatalogue;

const LUC = { tm: "2026-10-29T03:33:00.000Z" };

describe("ganCoThuMucDaXoa", () => {
  it("dat co cho dong co thu muc nam trong Thung rac", () => {
    const r = ganCoThuMucDaXoa([dong("tm")], LUC);
    expect(r[0].co).toContain("thu-muc-da-xoa");
  });

  it("khong dat co cho thu muc binh thuong", () => {
    const r = ganCoThuMucDaXoa([dong("khac")], LUC);
    expect(r[0].co).toEqual([]);
  });

  it("dong khong co thu muc thi khong dinh gi", () => {
    const r = ganCoThuMucDaXoa([dong(null)], LUC);
    expect(r[0].co).toEqual([]);
  });

  it("dung ngay sau 'thieu-anh' — no la LY DO cua co do, phai doc lien nhau", () => {
    const r = ganCoThuMucDaXoa([dong("tm", ["thieu-sku", "thieu-anh", "thieu-mo-ta"])], LUC);
    expect(r[0].co).toEqual(["thieu-sku", "thieu-anh", "thu-muc-da-xoa", "thieu-mo-ta"]);
  });

  it("khong dat co hai lan khi chay lai", () => {
    const mot = ganCoThuMucDaXoa([dong("tm")], LUC);
    const hai = ganCoThuMucDaXoa(mot, LUC);
    expect(hai[0].co.filter((c) => c === "thu-muc-da-xoa")).toHaveLength(1);
  });

  it("khong sua dau vao", () => {
    const goc = dong("tm");
    ganCoThuMucDaXoa([goc], LUC);
    expect(goc.co).toEqual([]);
  });
});
