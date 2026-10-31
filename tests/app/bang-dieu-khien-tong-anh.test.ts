import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { boChu } from "@/messages";
import type { ThongKe } from "@/modules/sheet/catalogue.view";
import { BangDieuKhien } from "@/app/admin/catalogue-sheet/bang-dieu-khien";

const t = boChu("vi");

const tk = (v: Partial<ThongKe>): ThongKe => ({
  tong: 209,
  tongAnh: 3509,
  thieuAnh: 43,
  thieuSku: 209,
  tlVangLech: 0,
  trung: 8,
  duDuLieu: 0,
  ...v,
});

function ve(thongKeHien: ThongKe, dangLoc = false): string {
  return renderToStaticMarkup(
    createElement(BangDieuKhien, {
      thongKe: tk({}),
      thongKeHien,
      dangLoc,
      canhBaoDangBat: [],
      thamSoCanhBao: "canh_bao",
      sp: {},
      t,
    }),
  );
}

describe("BangDieuKhien — o Tong anh", () => {
  it("hien tong so anh cua cac mau dang xet", () => {
    const html = ve(tk({}));
    expect(html).toContain(t.catalogue_sheet.dem_tong_anh);
    expect(html).toContain("3509");
  });

  it("dang loc thi hien ca mau so — khong thi nguoi doc tuong kho chi con bay nhieu anh", () => {
    const html = ve(tk({ tong: 20, tongAnh: 310 }), true);
    expect(html).toContain("310");
    expect(html).toContain("/ 3509");
  });

  it("khong loc thi KHONG hien mau so, de con so dung mot minh cho gon", () => {
    expect(ve(tk({}))).not.toContain("/ 3509");
  });

  it("o nay KHONG bam duoc — khong co tap mau nao de loc toi", () => {
    // Bon o canh bao deu la mot bo loc. Neu o Tong anh cung thanh the <a> thi
    // nguoi dung se bam va khong co gi xay ra, te hon la khong cho bam.
    const html = ve(tk({}));
    const truocNhan = html.slice(0, html.indexOf(t.catalogue_sheet.dem_tong_anh));
    const theMo = truocNhan.lastIndexOf("<a ");
    const theDong = truocNhan.lastIndexOf("</a>");
    expect(theDong).toBeGreaterThan(theMo);
  });

  it("van du sau o tren bang dieu khien", () => {
    const html = ve(tk({}));
    for (const nhan of [
      t.catalogue_sheet.dem_mau,
      t.catalogue_sheet.dem_tong_anh,
      t.catalogue_sheet.dem_thieu_anh,
      t.catalogue_sheet.dem_thieu_sku,
      t.catalogue_sheet.dem_tl_vang_lech,
      t.catalogue_sheet.dem_trung,
    ]) {
      expect(html).toContain(nhan);
    }
  });
});
