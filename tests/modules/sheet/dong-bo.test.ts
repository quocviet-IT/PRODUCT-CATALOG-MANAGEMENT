import { beforeEach, describe, expect, it, vi } from "vitest";

const getEnv = vi.fn();
const ghiTep = vi.fn();
const taiVe = vi.fn();
vi.mock("@/lib/env", () => ({ getEnv }));
vi.mock("@/modules/media/storage", () => ({ ghiTep, taiVe }));

const {
  KHOA_ANH_THU_MUC,
  KHOA_LUC_THU_MUC,
  KHOA_THU_MUC_DA_XOA,
  KHOA_TRANG_THAI,
  LoiChuaBatDongBo,
  docTrangThai,
  ghiTrangThai,
  gopAnhThuMuc,
  kiemKhoa,
} =
  await import("@/modules/sheet/dong-bo");
const { SO_LAN_THU_LAI_NGAY } = await import("@/modules/sheet/thu-muc-can-liet-ke");

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

describe("gopAnhThuMuc", () => {
  const tep = new Map<string, unknown>();

  const dungStorage = () => {
    tep.clear();
    taiVe.mockImplementation(async (khoa: string) => {
      if (!tep.has(khoa)) throw new Error("khong co " + khoa);
      return Buffer.from(JSON.stringify(tep.get(khoa)), "utf8");
    });
    ghiTep.mockImplementation(async (khoa: string, buf: Buffer) => {
      tep.set(khoa, JSON.parse(buf.toString("utf8")));
    });
  };

  beforeEach(dungStorage);

  it("thu muc bi giu lai nhieu luot van duoc cap moc — khong duoc chan dau hang doi", async () => {
    // Day la cai da dong bang G10323 suot 21 ngay. Xem mocSauKhiGop.
    tep.set(KHOA_ANH_THU_MUC, { a: [{ fileId: "x" }] });

    for (let luot = 1; luot <= SO_LAN_THU_LAI_NGAY; luot++) {
      await gopAnhThuMuc({ a: [] });
      expect(tep.get(KHOA_LUC_THU_MUC) ?? {}).toEqual({});
    }

    await gopAnhThuMuc({ a: [] });
    expect(Object.keys((tep.get(KHOA_LUC_THU_MUC) ?? {}) as object)).toEqual(["a"]);
    // ... va danh sach anh cu van con nguyen.
    expect(tep.get(KHOA_ANH_THU_MUC)).toEqual({ a: [{ fileId: "x" }] });
  });

  it("thu muc KHONG MO DUOC khong bi ghi thanh rong, ke ca khi chua co trong ban do", async () => {
    // Script gui mang rong ca khi Drive bao loi. Ghi no vao ban do la dong bang
    // mot thu muc chua tung doc duoc o trang thai "rong" vinh vien — dung cai da
    // xay ra voi 15 ma G103xx.
    const kq = await gopAnhThuMuc({}, ["moi"]);
    expect(tep.get(KHOA_ANH_THU_MUC)).toEqual({});
    // Va no phai duoc TINH la mot lan hong, khong phai lo di: co dem thi moc moi
    // duoc cap sau SO_LAN_THU_LAI_NGAY luot, va man quan tri moi noi duoc.
    expect(kq.giuLai).toBe(1);
    expect(tep.get(KHOA_LUC_THU_MUC) ?? {}).toEqual({});
  });

  it("thu muc ghi duoc thi cap moc nhu cu", async () => {
    await gopAnhThuMuc({ a: [{ fileId: "x" }] });
    expect(Object.keys((tep.get(KHOA_LUC_THU_MUC) ?? {}) as object)).toEqual(["a"]);
  });
});

describe("gopAnhThuMuc — thu muc da vao Thung rac", () => {
  const tep = new Map<string, unknown>();

  beforeEach(() => {
    tep.clear();
    taiVe.mockImplementation(async (khoa: string) => {
      if (!tep.has(khoa)) throw new Error("khong co " + khoa);
      return Buffer.from(JSON.stringify(tep.get(khoa)), "utf8");
    });
    ghiTep.mockImplementation(async (khoa: string, buf: Buffer) => {
      tep.set(khoa, JSON.parse(buf.toString("utf8")));
    });
  });

  it("XOA danh sach anh du thu muc dang co anh — khac han chot giu mang rong", () => {
    // Mang rong la tin hieu mo ho (co the Drive truc trac) nen duoc giu lai.
    // "Da vao Thung rac" la tin hieu CHAC CHAN, nen phai xoa — bang khong anh
    // cua mot thu muc khong con ton tai van nam tren web va lot vao catalogue
    // gui khach (G10323, 29/10/2026).
    tep.set(KHOA_ANH_THU_MUC, { a: [{ fileId: "x" }] });
    return gopAnhThuMuc({}, [], ["a"]).then(() => {
      expect(tep.get(KHOA_ANH_THU_MUC)).toEqual({ a: [] });
    });
  });

  it("cap moc ngay, khong bat thu lai — thu muc da xoa thi thu lai cung vay", async () => {
    tep.set(KHOA_ANH_THU_MUC, { a: [{ fileId: "x" }] });
    await gopAnhThuMuc({}, [], ["a"]);
    expect(Object.keys((tep.get(KHOA_LUC_THU_MUC) ?? {}) as object)).toEqual(["a"]);
  });

  it("ghi lai de man quan tri noi duoc, va giu moc phat hien DAU TIEN", async () => {
    await gopAnhThuMuc({}, [], ["a"]);
    const lan1 = (tep.get(KHOA_THU_MUC_DA_XOA) as Record<string, string>).a;
    expect(lan1).toBeTruthy();

    await gopAnhThuMuc({}, [], ["a"]);
    expect((tep.get(KHOA_THU_MUC_DA_XOA) as Record<string, string>).a).toBe(lan1);
  });

  it("thu muc duoc khoi phuc thi het bi danh dau", async () => {
    await gopAnhThuMuc({}, [], ["a"]);
    expect(Object.keys(tep.get(KHOA_THU_MUC_DA_XOA) as object)).toEqual(["a"]);

    await gopAnhThuMuc({ a: [{ fileId: "x" }] });
    expect(tep.get(KHOA_THU_MUC_DA_XOA)).toEqual({});
  });
});
