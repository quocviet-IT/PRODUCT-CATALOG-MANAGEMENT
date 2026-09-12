import { describe, expect, it } from "vitest";
import { locDanhSachDaTao, tachTuKhoa } from "@/modules/catalogue-share/danh-sach.view";
import type { DongDanhSach } from "@/modules/catalogue-share/chia-se.service";

function dong(v: Partial<DongDanhSach>): DongDanhSach {
  return {
    slug: "catalogue-1-abcd1234",
    ten: "Catalogue #1",
    so: 1,
    taoLuc: new Date("2026-09-01T00:00:00Z"),
    soMuc: 3,
    soAnh: 15,
    nguoiTao: "kd01@ctyhp.vn",
    hetHanLuc: new Date("2026-12-01T00:00:00Z"),
    khoaLuc: null,
    trangThai: "mo",
    ...v,
  };
}

const DS: DongDanhSach[] = [
  dong({ ten: "Chị Lan — nhẫn cưới 18K", slug: "chi-lan-nhan-cuoi-18k-wxdg5edr", so: 12 }),
  dong({ ten: "Catalogue SPHT", slug: "catalogue-spht-wk9jnh9t", so: 8, nguoiTao: "ngocdung@ctyhp.vn" }),
  dong({ ten: "Anh Minh - dây chuyền", slug: "anh-minh-day-chuyen-2tgkn9dc", so: 5, nguoiTao: null }),
];

const ten = (ds: DongDanhSach[]) => ds.map((d) => d.ten);

describe("tim nhanh trong danh sach catalogue da tao", () => {
  it("khong go gi thi tra ve nguyen danh sach", () => {
    expect(locDanhSachDaTao(DS, null)).toHaveLength(3);
    expect(locDanhSachDaTao(DS, "   ")).toHaveLength(3);
  });

  it("tim theo ten, khong dau cung ra", () => {
    expect(ten(locDanhSachDaTao(DS, "chị lan"))).toEqual(["Chị Lan — nhẫn cưới 18K"]);
    expect(ten(locDanhSachDaTao(DS, "chi lan"))).toEqual(["Chị Lan — nhẫn cưới 18K"]);
    expect(ten(locDanhSachDaTao(DS, "CHI LAN"))).toEqual(["Chị Lan — nhẫn cưới 18K"]);
  });

  it("NHIEU TU: moi tu deu phai co, khong can dung thu tu", () => {
    // "lan" va "18k" nam cach nhau may chu trong ten.
    expect(locDanhSachDaTao(DS, "lan 18k")).toHaveLength(1);
    expect(locDanhSachDaTao(DS, "18k lan")).toHaveLength(1);
  });

  it("tim theo nguoi tao", () => {
    expect(ten(locDanhSachDaTao(DS, "ngocdung"))).toEqual(["Catalogue SPHT"]);
  });

  it("tim theo duong dan — go duoc ca doi slug", () => {
    // Sale hay chep link roi muon tim lai chinh no.
    expect(ten(locDanhSachDaTao(DS, "wk9jnh9t"))).toEqual(["Catalogue SPHT"]);
  });

  it("tim theo so thu tu he thong danh", () => {
    expect(locDanhSachDaTao(DS, "12")).toHaveLength(1);
  });

  it("dong khong co nguoi tao van tim duoc theo ten", () => {
    // nguoiTao null la catalogue tao thoi chua bat dang nhap — khong duoc lam
    // ca dong bien mat khoi tim kiem.
    expect(ten(locDanhSachDaTao(DS, "anh minh"))).toEqual(["Anh Minh - dây chuyền"]);
  });

  it("khong khop thi tra ve rong, khong nem loi", () => {
    expect(locDanhSachDaTao(DS, "khong co gi ten nhu vay")).toEqual([]);
  });

  it("tachTuKhoa bo khoang trang thua", () => {
    expect(tachTuKhoa("  chi   lan  ")).toEqual(["chi", "lan"]);
    expect(tachTuKhoa(null)).toEqual([]);
  });
});
