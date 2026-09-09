import { beforeEach, describe, expect, it, vi } from "vitest";

const getEnv = vi.fn();
const ghiTep = vi.fn();
const taiVe = vi.fn();
vi.mock("@/lib/env", () => ({ getEnv }));
vi.mock("@/modules/media/storage", () => ({ ghiTep, taiVe }));

const { KHOA_TRANG_THAI, LoiChuaBatDongBo, docTrangThai, ghiTrangThai, kiemKhoa } =
  await import("@/modules/sheet/dong-bo");

const KHOA = "khoa-bi-mat-dai-hon-hai-muoi-bon-ky-tu";

const yeuCau = (auth?: string) =>
  new Request("http://x/api/dong-bo/du-lieu", {
    method: "POST",
    headers: auth === undefined ? {} : { authorization: auth },
  });

beforeEach(() => {
  getEnv.mockReset();
  getEnv.mockReturnValue({ DONG_BO_SECRET: KHOA });
  ghiTep.mockReset();
  ghiTep.mockResolvedValue(undefined);
  taiVe.mockReset();
});

describe("kiemKhoa", () => {
  it("nem LoiChuaBatDongBo khi chua khai DONG_BO_SECRET", () => {
    // Day la ranh gioi quan trong nhat cua ca duong nay: thieu khoa phai co
    // nghia la TAT, khong bao gio duoc hieu thanh "khong can khoa".
    getEnv.mockReturnValue({});
    expect(() => kiemKhoa(yeuCau(`Bearer ${KHOA}`))).toThrow(LoiChuaBatDongBo);
    expect(() => kiemKhoa(yeuCau())).toThrow(LoiChuaBatDongBo);
  });

  it("nhan khoa dung, ke ca khi viet hoa chu Bearer khac di", () => {
    expect(kiemKhoa(yeuCau(`Bearer ${KHOA}`))).toBe(true);
    expect(kiemKhoa(yeuCau(`bearer ${KHOA}`))).toBe(true);
    expect(kiemKhoa(yeuCau(KHOA))).toBe(true);
  });

  it("tu choi khoa sai, khoa rong, va khoa chi dung phan dau", () => {
    expect(kiemKhoa(yeuCau("Bearer sai"))).toBe(false);
    expect(kiemKhoa(yeuCau("Bearer "))).toBe(false);
    expect(kiemKhoa(yeuCau())).toBe(false);
    expect(kiemKhoa(yeuCau(`Bearer ${KHOA.slice(0, -1)}`))).toBe(false);
    expect(kiemKhoa(yeuCau(`Bearer ${KHOA}x`))).toBe(false);
  });
});

describe("docTrangThai", () => {
  it("tra ve moc da ghi", async () => {
    const t = { luc: "2026-09-08T03:20:00.000Z", soDong: 71, soThuMuc: 65, soAnh: 1360 };
    taiVe.mockResolvedValue(Buffer.from(JSON.stringify(t), "utf8"));
    expect(await docTrangThai()).toEqual(t);
    expect(taiVe).toHaveBeenCalledWith(KHOA_TRANG_THAI);
  });

  it("tra null thay vi nem loi khi chua co tep hoac tep hong", async () => {
    // Mot man hinh khong duoc trang chi vi khong doc noi mot dong chu trang thai.
    taiVe.mockRejectedValue(new Error("khong co"));
    expect(await docTrangThai()).toBeNull();

    taiVe.mockResolvedValue(Buffer.from("khong phai json", "utf8"));
    expect(await docTrangThai()).toBeNull();

    taiVe.mockResolvedValue(Buffer.from(JSON.stringify({ soDong: 3 }), "utf8"));
    expect(await docTrangThai()).toBeNull();
  });
});

describe("ghiTrangThai", () => {
  it("ghi JSON vao dung khoa", async () => {
    await ghiTrangThai({ luc: "2026-09-08T03:20:00.000Z", soDong: 1, soThuMuc: 2, soAnh: 3 });
    expect(ghiTep).toHaveBeenCalledTimes(1);
    const [khoa, noiDung, kieu] = ghiTep.mock.calls[0];
    expect(khoa).toBe(KHOA_TRANG_THAI);
    expect(kieu).toBe("application/json");
    expect(JSON.parse((noiDung as Buffer).toString("utf8")).soDong).toBe(1);
  });
});
