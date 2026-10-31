import { describe, it, expect } from "vitest";
import { NGUONG_QUET_PX, huongQuet, taoTayQuet, viTriKeTiep } from "@/ui/quet-ngang";

const tu = (x: number, y: number) => ({ x, y });

describe("huongQuet", () => {
  it("quet sang TRAI la xem anh SAU — anh di theo ngon tay", () => {
    expect(huongQuet(tu(300, 100), tu(300 - NGUONG_QUET_PX - 1, 100))).toBe(1);
  });

  it("quet sang PHAI la xem anh TRUOC", () => {
    expect(huongQuet(tu(100, 100), tu(100 + NGUONG_QUET_PX + 1, 100))).toBe(-1);
  });

  it("quet ngan hon nguong thi khong tinh — cham tay run khong duoc doi anh", () => {
    expect(huongQuet(tu(100, 100), tu(100 + NGUONG_QUET_PX - 1, 100))).toBe(0);
  });

  it("cham tai cho la 0", () => {
    expect(huongQuet(tu(100, 100), tu(100, 100))).toBe(0);
  });

  it("quet DOC nhieu hon NGANG thi nhuong cho viec cuon trang", () => {
    // Nguoi dung dang keo de cuon, khong phai de doi anh. Cuop thao tac nay thi
    // ho khong cuon duoc nua ma cung khong hieu vi sao anh cu nhay.
    expect(huongQuet(tu(300, 100), tu(300 - 60, 100 + 200))).toBe(0);
  });

  it("quet cheo nhung NGANG van troi hon thi van doi anh", () => {
    expect(huongQuet(tu(300, 100), tu(300 - 200, 100 + 60))).toBe(1);
  });

  it("nhan nguong rieng", () => {
    expect(huongQuet(tu(100, 100), tu(110, 100), 5)).toBe(-1);
    expect(huongQuet(tu(100, 100), tu(110, 100), 200)).toBe(0);
  });
});

describe("viTriKeTiep", () => {
  it("di toi va lui lai", () => {
    expect(viTriKeTiep(1, 1, 7)).toBe(2);
    expect(viTriKeTiep(1, -1, 7)).toBe(0);
  });

  it("tu anh CUOI di toi thi quay ve anh dau", () => {
    expect(viTriKeTiep(6, 1, 7)).toBe(0);
  });

  it("tu anh DAU lui lai thi sang anh cuoi", () => {
    expect(viTriKeTiep(0, -1, 7)).toBe(6);
  });

  it("mot anh thi di dau cung dung yen", () => {
    expect(viTriKeTiep(0, 1, 1)).toBe(0);
    expect(viTriKeTiep(0, -1, 1)).toBe(0);
  });

  it("khong co anh nao thi tra 0, khong tra NaN", () => {
    // (0 + 1 + 0) % 0 la NaN, va NaN lam chi so se cho ra undefined — khung xem
    // trang tron khong mot loi bao nao.
    expect(viTriKeTiep(0, 1, 0)).toBe(0);
  });
});

describe("taoTayQuet", () => {
  it("cham roi nhac tay tai cho la mot cu CHAM, va cham thi dong khung", () => {
    const tay = taoTayQuet();
    tay.chamXuong(tu(100, 100));
    expect(tay.nhacTay(tu(100, 100))).toBe(0);
    expect(tay.nenDong()).toBe(true);
  });

  it("QUET xong thi cu click ngay sau do KHONG duoc dong khung", () => {
    // Day la cho tinh nang nay de tu pha chinh no: trinh duyet van ban ra mot
    // cu click sau khi nhac tay, ma click tren nen la dong. Khong chan thi moi
    // cu quet vua doi anh vua tat khung ngay sau do.
    const tay = taoTayQuet();
    tay.chamXuong(tu(300, 100));
    expect(tay.nhacTay(tu(100, 100))).toBe(1);
    expect(tay.nenDong()).toBe(false);
  });

  it("chan DUNG MOT cu click — lan bam sau do van dong duoc nhu thuong", () => {
    const tay = taoTayQuet();
    tay.chamXuong(tu(300, 100));
    tay.nhacTay(tu(100, 100));
    tay.nenDong();
    expect(tay.nenDong()).toBe(true);
  });

  it("bam chuot thuan tuy, khong he cham man, thi van dong duoc", () => {
    expect(taoTayQuet().nenDong()).toBe(true);
  });

  it("nhac tay ma chua tung cham xuong thi bo qua, khong doi anh", () => {
    const tay = taoTayQuet();
    expect(tay.nhacTay(tu(100, 100))).toBe(0);
    expect(tay.nenDong()).toBe(true);
  });

  it("quet DOC khong tinh la quet, nen van dong duoc nhu mot cu cham", () => {
    const tay = taoTayQuet();
    tay.chamXuong(tu(300, 100));
    expect(tay.nhacTay(tu(280, 400))).toBe(0);
    expect(tay.nenDong()).toBe(true);
  });
});
