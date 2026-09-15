import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DAI_MAT_KHAU_TOI_THIEU,
  MUC_HOAT_DONG,
  PHUT_GIUA_HAI_LAN_GHI,
  ghiHoatDongNeuCan,
  gopLanCuoiVao,
  kiemTraMatKhau,
  kiemTraSuaDoi,
  kiemTraTaoTaiKhoan,
  lanCuoiVaoHienThi,
  mucHoatDong,
  nenGhiHoatDong,
  suyRaCachDangNhap,
} from "@/modules/nguoi-dung/nguoi-dung.model";

const HOP_LE = { email: "an@ctyhp.vn", matKhau: "matkhau123", hoTen: "Nguyễn An" };

describe("kiemTraTaoTaiKhoan", () => {
  it("nhan du lieu hop le", () => {
    expect(kiemTraTaoTaiKhoan(HOP_LE)).toBeNull();
  });

  it("tu choi email sai dang", () => {
    for (const e of ["", "khongcodau", "a@b", "a b@c.vn", "@ctyhp.vn"]) {
      expect(kiemTraTaoTaiKhoan({ ...HOP_LE, email: e }), e).toBe("email_khong_hop_le");
    }
  });

  it("KHONG rang buoc ten mien — admin duoc tao tai khoan cho nguoi ngoai", () => {
    // Rang buoc ten mien chi ap cho duong dang nhap bang Google. Tai khoan do
    // admin tu tay tao la quyet dinh cua admin.
    expect(kiemTraTaoTaiKhoan({ ...HOP_LE, email: "doitac@gmail.com" })).toBeNull();
  });

  it("tu choi ho ten de trong", () => {
    expect(kiemTraTaoTaiKhoan({ ...HOP_LE, hoTen: "   " })).toBe("thieu_ho_ten");
  });

  it("tu choi mat khau ngan hon nguong", () => {
    expect(kiemTraTaoTaiKhoan({ ...HOP_LE, matKhau: "a".repeat(DAI_MAT_KHAU_TOI_THIEU - 1) }))
      .toBe("mat_khau_qua_ngan");
    expect(kiemTraTaoTaiKhoan({ ...HOP_LE, matKhau: "a".repeat(DAI_MAT_KHAU_TOI_THIEU) }))
      .toBeNull();
  });

  it("tu choi mat khau dai hon 72 ky tu", () => {
    // bcrypt chi doc 72 byte dau; dai hon thi phan thua bi bo lang le va nguoi
    // dung tuong mat khau cua minh dai hon thuc te.
    expect(kiemTraTaoTaiKhoan({ ...HOP_LE, matKhau: "a".repeat(73) })).toBe("mat_khau_qua_dai");
  });
});

describe("kiemTraMatKhau", () => {
  it("chi xet do dai", () => {
    expect(kiemTraMatKhau("a".repeat(8))).toBeNull();
    expect(kiemTraMatKhau("ngan")).toBe("mat_khau_qua_ngan");
  });
});

describe("kiemTraSuaDoi", () => {
  const TOI = "id-toi";
  const NGUOI_KHAC = "id-khac";

  it("chan admin tu khoa chinh minh", () => {
    // Chi admin moi mo duoc man hinh nay. Tu khoa minh lai la khong con ai vao
    // duoc de sua lai — phai dung den co so du lieu moi cuu.
    expect(kiemTraSuaDoi(TOI, TOI, { kieu: "khoa" })).toBe("tu_khoa_chinh_minh");
  });

  it("chan admin tu ha quyen chinh minh", () => {
    expect(kiemTraSuaDoi(TOI, TOI, { kieu: "doi-vai-tro", mucQuyenMoi: "sale" }))
      .toBe("tu_ha_quyen_chinh_minh");
  });

  it("van cho tu doi mat khau cua chinh minh", () => {
    expect(kiemTraSuaDoi(TOI, TOI, { kieu: "doi-mat-khau" })).toBeNull();
  });

  it("van cho tu giu vai tro admin cua chinh minh", () => {
    expect(kiemTraSuaDoi(TOI, TOI, { kieu: "doi-vai-tro", mucQuyenMoi: "admin" })).toBeNull();
  });

  it("cho tu chuyen sang vai tro TEN KHAC nhung van bac quyen admin", () => {
    // Chuyen minh sang "GSNB" mang bac admin thi khong khoa ai ra ngoai ca —
    // quy tac phai xet BAC QUYEN, khong xet ten vai tro.
    expect(kiemTraSuaDoi(TOI, TOI, { kieu: "doi-vai-tro", mucQuyenMoi: "admin" })).toBeNull();
  });

  it("khong chan gi khi tac dong len nguoi KHAC", () => {
    for (const td of [
      { kieu: "khoa" } as const,
      { kieu: "mo-khoa" } as const,
      { kieu: "doi-vai-tro", mucQuyenMoi: "sale" } as const,
      { kieu: "doi-mat-khau" } as const,
    ]) {
      expect(kiemTraSuaDoi(TOI, NGUOI_KHAC, td)).toBeNull();
    }
  });
});

describe("suyRaCachDangNhap", () => {
  it("phan biet duoc bon truong hop", () => {
    expect(suyRaCachDangNhap(["google"])).toBe("google");
    expect(suyRaCachDangNhap(["email"])).toBe("mat-khau");
    expect(suyRaCachDangNhap(["google", "email"])).toBe("ca-hai");
    expect(suyRaCachDangNhap([])).toBe("khac");
  });
});

// ─────────────────────────────────────────────── cham hoat dong (trang Tai khoan)

const BAY_GIO = new Date("2026-09-15T10:00:00Z");
const PHUT = 60_000;
const GIO = 60 * PHUT;
const NGAY = 24 * GIO;
/** Moc cach BAY_GIO mot khoang (ms). So am la moc o tuong lai. */
const truoc = (ms: number) => new Date(BAY_GIO.getTime() - ms);

describe("nenGhiHoatDong", () => {
  it("chua co moc thi ghi", () => {
    expect(nenGhiHoatDong(null, BAY_GIO)).toBe(true);
  });

  it("chua du 10 phut thi khong ghi", () => {
    expect(nenGhiHoatDong(truoc(10 * PHUT - 1000), BAY_GIO)).toBe(false);
  });

  it("du 10 phut thi ghi", () => {
    expect(PHUT_GIUA_HAI_LAN_GHI).toBe(10);
    expect(nenGhiHoatDong(truoc(10 * PHUT), BAY_GIO)).toBe(true);
  });

  it("moc o tuong lai (lech dong ho) thi khong ghi", () => {
    expect(nenGhiHoatDong(truoc(-5 * PHUT), BAY_GIO)).toBe(false);
  });
});

describe("gopLanCuoiVao", () => {
  const som = truoc(3 * NGAY);
  const muon = truoc(2 * GIO);

  it("lay moc muon hon, du ben nao muon", () => {
    expect(gopLanCuoiVao(muon, som)).toEqual(muon);
    expect(gopLanCuoiVao(som, muon)).toEqual(muon);
  });

  it("mot ben trong thi lay ben kia", () => {
    expect(gopLanCuoiVao(null, som)).toEqual(som);
    expect(gopLanCuoiVao(som, null)).toEqual(som);
  });

  it("ca hai trong thi null", () => {
    expect(gopLanCuoiVao(null, null)).toBeNull();
  });
});

describe("lanCuoiVaoHienThi", () => {
  const som = truoc(3 * NGAY);
  const muon = truoc(2 * GIO);

  it("tai khoan dang mo: lay moc muon hon (dang nhap muon hon thi thang)", () => {
    expect(lanCuoiVaoHienThi({ hoatDong: som, dangNhap: muon, dangHoatDong: true })).toEqual(muon);
  });

  it("tai khoan bi khoa: bo qua moc dang nhap du no muon hon, tra ve hoatDong", () => {
    expect(lanCuoiVaoHienThi({ hoatDong: som, dangNhap: muon, dangHoatDong: false })).toEqual(som);
  });

  it("tai khoan bi khoa, chua co hoat dong thuc: null du co moc dang nhap", () => {
    expect(lanCuoiVaoHienThi({ hoatDong: null, dangNhap: muon, dangHoatDong: false })).toBeNull();
  });

  it("tai khoan dang mo, chi co moc dang nhap: lay moc dang nhap", () => {
    expect(lanCuoiVaoHienThi({ hoatDong: null, dangNhap: muon, dangHoatDong: true })).toEqual(muon);
  });
});

describe("mucHoatDong", () => {
  it("chua vao lan nao thi lau", () => {
    expect(mucHoatDong(null, BAY_GIO)).toBe("lau");
  });

  it("duoi 24 gio la trong-ngay", () => {
    expect(mucHoatDong(truoc(PHUT), BAY_GIO)).toBe("trong-ngay");
    expect(mucHoatDong(truoc(23 * GIO + 59 * PHUT), BAY_GIO)).toBe("trong-ngay");
  });

  it("dung 24 gio da sang trong-tuan", () => {
    expect(mucHoatDong(truoc(NGAY), BAY_GIO)).toBe("trong-tuan");
    expect(mucHoatDong(truoc(6 * NGAY + 23 * GIO), BAY_GIO)).toBe("trong-tuan");
  });

  it("dung 7 ngay tro len la lau", () => {
    expect(mucHoatDong(truoc(7 * NGAY), BAY_GIO)).toBe("lau");
    expect(mucHoatDong(truoc(30 * NGAY), BAY_GIO)).toBe("lau");
  });

  it("moc o tuong lai tinh la trong-ngay", () => {
    expect(mucHoatDong(truoc(-2 * PHUT), BAY_GIO)).toBe("trong-ngay");
  });

  it("MUC_HOAT_DONG theo thu tu chu giai: xanh, vang, xam", () => {
    expect(MUC_HOAT_DONG).toEqual(["trong-ngay", "trong-tuan", "lau"]);
  });
});

describe("ghiHoatDongNeuCan", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const hoSo = { id: "u1", isActive: true, lanCuoiHoatDong: null as Date | null };

  it("ghi khi tai khoan dang mo va moc da cu", async () => {
    const ghi = vi.fn().mockResolvedValue(undefined);
    await ghiHoatDongNeuCan({ ...hoSo, lanCuoiHoatDong: truoc(11 * PHUT) }, BAY_GIO, ghi);
    expect(ghi).toHaveBeenCalledTimes(1);
    expect(ghi).toHaveBeenCalledWith("u1");
  });

  it("khong ghi khi moc con moi", async () => {
    const ghi = vi.fn().mockResolvedValue(undefined);
    await ghiHoatDongNeuCan({ ...hoSo, lanCuoiHoatDong: truoc(PHUT) }, BAY_GIO, ghi);
    expect(ghi).not.toHaveBeenCalled();
  });

  it("khong ghi cho tai khoan bi khoa", async () => {
    const ghi = vi.fn().mockResolvedValue(undefined);
    await ghiHoatDongNeuCan({ ...hoSo, isActive: false }, BAY_GIO, ghi);
    expect(ghi).not.toHaveBeenCalled();
  });

  it("ghi loi thi chi log, khong nem ra ngoai", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const ghi = vi.fn().mockRejectedValue(new Error("pooler het cho"));
    await expect(ghiHoatDongNeuCan(hoSo, BAY_GIO, ghi)).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith("[hoat-dong] khong ghi duoc lan cuoi hoat dong:", expect.any(Error));
  });
});
