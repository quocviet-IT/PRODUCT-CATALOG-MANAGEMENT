import { beforeEach, describe, expect, it, vi } from "vitest";
import { bangMau } from "../modules/sheet/fixtures/bang-mau";

/**
 * Ba cong nhan du lieu tu Google Apps Script. Diem chung phai giu:
 *  - thieu DONG_BO_SECRET  -> 503, khong bao gio la "mo cua"
 *  - khoa sai              -> 401
 *  - than la du lieu tu ngoai Internet, khong duoc tin
 */

const getEnv = vi.fn();
const ghiTep = vi.fn();
const taiVe = vi.fn();
const lietKeTen = vi.fn();
vi.mock("@/lib/env", () => ({ getEnv }));
// KHONG gia lap @/modules/media/khoa-anh: cach dat ten bo dem la thu dang
// duoc kiem, thay no bang ban gia thi bai kiem tra khong con y nghia gi.
vi.mock("@/modules/media/storage", () => ({ ghiTep, taiVe, lietKeTen }));

const KHOA = "khoa-bi-mat-dai-hon-hai-muoi-bon-ky-tu";

const duLieu = await import("@/app/api/dong-bo/du-lieu/route");
const thuMuc = await import("@/app/api/dong-bo/thu-muc/route");
const thieuAnh = await import("@/app/api/dong-bo/thieu-anh/route");
const anh = await import("@/app/api/dong-bo/anh/route");

const goi = (duong: string, than: unknown, khoa: string | null = KHOA) =>
  new Request(`http://x/api/dong-bo/${duong}`, {
    method: "POST",
    headers: khoa === null ? {} : { authorization: `Bearer ${khoa}` },
    body: JSON.stringify(than),
  });

beforeEach(() => {
  getEnv.mockReset();
  getEnv.mockReturnValue({ DONG_BO_SECRET: KHOA });
  ghiTep.mockReset();
  ghiTep.mockResolvedValue(undefined);
  taiVe.mockReset();
  lietKeTen.mockReset();
  lietKeTen.mockResolvedValue(new Set<string>());
});

describe("cong dong bo — khoa bi mat", () => {
  const moiCong: [string, (r: Request) => Promise<Response>][] = [
    ["du-lieu", duLieu.POST],
    ["thu-muc", thuMuc.POST],
    ["thieu-anh", thieuAnh.POST],
    ["anh", anh.POST],
  ];

  it("tra 503 khi chua khai DONG_BO_SECRET — TAT han, khong phai mo cua", async () => {
    getEnv.mockReturnValue({});
    const gianDiep = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      for (const [ten, POST] of moiCong) {
        const res = await POST(goi(ten, {}, null));
        expect(res.status, ten).toBe(503);
        expect(await res.json()).toEqual({ loi: "chua_bat" });
      }
    } finally {
      gianDiep.mockRestore();
    }
    // Khong ghi gi ca — mot cong dang tat khong duoc cham vao du lieu that.
    expect(ghiTep).not.toHaveBeenCalled();
  });

  it("tra 401 khi khoa sai hoac thieu", async () => {
    for (const [ten, POST] of moiCong) {
      expect((await POST(goi(ten, {}, "sai"))).status, ten).toBe(401);
      expect((await POST(goi(ten, {}, null))).status, ten).toBe(401);
    }
    expect(ghiTep).not.toHaveBeenCalled();
  });

  it("moi phan hoi deu mang Cache-Control: private, no-store", async () => {
    for (const [ten, POST] of moiCong) {
      const res = await POST(goi(ten, {}, "sai"));
      expect(res.headers.get("cache-control"), ten).toBe("private, no-store");
    }
  });
});

describe("POST /api/dong-bo/du-lieu", () => {
  const thanTot = { hang: bangMau, anhThuMuc: { thuMucA: [{ fileId: "abc", ten: "1.jpg" }] } };

  it("ghi ba doi tuong khi bang doc duoc", async () => {
    const res = await duLieu.POST(goi("du-lieu", thanTot));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { soDong: number; soThuMuc: number; soAnh: number };
    expect(body.soDong).toBeGreaterThan(0);
    expect(body.soThuMuc).toBe(1);
    expect(body.soAnh).toBe(1);

    const khoaDaGhi = ghiTep.mock.calls.map((c) => c[0]);
    expect(khoaDaGhi).toEqual([
      "dong-bo/bang.json",
      "dong-bo/anh-thu-muc.json",
      "dong-bo/trang-thai.json",
    ]);
  });

  it("tu choi bang co tieu de nhung khong con dong nao", async () => {
    // Truong hop nguy hiem nhat: script doc dung tab, tieu de van do, nhung
    // pham vi tra ve rong. Gan nhu chac chan la loi phia Google chu khong phai
    // cong ty vua xoa het hang — ghi de la mat sach catalogue dang chay.
    const chiTieuDe = bangMau.slice(0, 2);
    const res = await duLieu.POST(goi("du-lieu", { hang: chiTieuDe, anhThuMuc: {} }));
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ loi: "bang_rong" });
    expect(ghiTep).not.toHaveBeenCalled();
  });

  it("tu choi bang thieu cot bat buoc, va bao ro cot nao", async () => {
    const gianDiep = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      // Bo tieu de di: mapper phai nem LoiThieuCot, va cong phai bat lay no
      // TRUOC khi ghi de len ban tot.
      const hongTieuDe = bangMau.map((h, i) => (i === 1 ? [] : h));
      const res = await duLieu.POST(goi("du-lieu", { hang: hongTieuDe, anhThuMuc: {} }));
      expect(res.status).toBe(422);
      const body = (await res.json()) as { loi: string; chiTiet: string };
      expect(body.loi).toBe("bang_khong_doc_duoc");
      expect(body.chiTiet).toContain("SKU");
      expect(ghiTep).not.toHaveBeenCalled();
    } finally {
      gianDiep.mockRestore();
    }
  });

  it("tu choi than sai hinh dang", async () => {
    expect((await duLieu.POST(goi("du-lieu", { hang: "khong phai mang" }))).status).toBe(400);
    expect((await duLieu.POST(goi("du-lieu", { hang: [] }))).status).toBe(400);
    expect(ghiTep).not.toHaveBeenCalled();
  });
});

describe("POST /api/dong-bo/thu-muc", () => {
  it("tra ID thu muc anh, khong trung, va khong ghi gi ca", async () => {
    const res = await thuMuc.POST(goi("thu-muc", { hang: bangMau }));
    expect(res.status).toBe(200);
    const { thuMuc: ds } = (await res.json()) as { thuMuc: string[] };
    expect(ds.length).toBeGreaterThan(0);
    expect(new Set(ds).size).toBe(ds.length);
    expect(ghiTep).not.toHaveBeenCalled();
  });
});

describe("POST /api/dong-bo/thieu-anh", () => {
  const anhThuMuc = {
    tm1: [{ fileId: "thuvien1", ten: "a.jpg" }, { fileId: "thuvien2", ten: "b.jpg" }],
  };

  function datBanChup(hang: unknown = bangMau) {
    taiVe.mockImplementation(async (khoa: string) =>
      Buffer.from(JSON.stringify(khoa === "dong-bo/bang.json" ? hang : anhThuMuc), "utf8"),
    );
  }

  it("tra 409 khi chua co ban chup, khong phai 'khong thieu gi'", async () => {
    taiVe.mockRejectedValue(new Error("khong co"));
    const gianDiep = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const res = await thieuAnh.POST(goi("thieu-anh", {}));
      expect(res.status).toBe(409);
      expect(await res.json()).toEqual({ loi: "chua_co_bang" });
    } finally {
      gianDiep.mockRestore();
    }
  });

  it("xep anh dai dien cua tung dong TRUOC thu vien anh", async () => {
    // Thu tu la mot yeu cau that: hong giua chung thi cai hong phai la phan it
    // ai mo, khong phai luoi catalogue ma ai cung nhin thay dau tien.
    datBanChup();
    const res = await thieuAnh.POST(goi("thieu-anh", {}));
    const { thieu } = (await res.json()) as { thieu: string[] };
    const viTriThuVien = thieu.indexOf("thuvien1");
    expect(viTriThuVien).toBeGreaterThan(0);
    // Moi thu dung truoc thu vien deu phai la anh dai dien.
    expect(thieu.slice(0, viTriThuVien)).not.toContain("thuvien2");
  });

  it("bo qua anh da co DU CA HAI co trong bo dem", async () => {
    datBanChup();
    lietKeTen.mockResolvedValue(new Set(["thuvien1-600.webp", "thuvien1-1400.webp"]));
    const res = await thieuAnh.POST(goi("thieu-anh", {}));
    const { thieu } = (await res.json()) as { thieu: string[] };
    expect(thieu).not.toContain("thuvien1");
    expect(thieu).toContain("thuvien2");
  });

  it("van coi la thieu khi chi co ban nho — khung phong to se phai goi Drive", async () => {
    datBanChup();
    lietKeTen.mockResolvedValue(new Set(["thuvien1-600.webp"]));
    const res = await thieuAnh.POST(goi("thieu-anh", {}));
    const { thieu } = (await res.json()) as { thieu: string[] };
    expect(thieu).toContain("thuvien1");
  });

  it("dem tong so anh khong trung lap", async () => {
    datBanChup();
    const res = await thieuAnh.POST(goi("thieu-anh", {}));
    const { thieu, tongThieu, tongAnh } = (await res.json()) as {
      thieu: string[];
      tongThieu: number;
      tongAnh: number;
    };
    expect(tongAnh).toBe(new Set(thieu).size);
    expect(tongThieu).toBe(thieu.length);
  });
});

describe("POST /api/dong-bo/anh", () => {
  /** Anh JPEG that, du nho de tao lai trong moi bai kiem. */
  async function anhThat(rong: number, cao: number): Promise<string> {
    const sharp = (await import("sharp")).default;
    const buf = await sharp({
      create: { width: rong, height: cao, channels: 3, background: "#E91D79" },
    })
      .jpeg()
      .toBuffer();
    return buf.toString("base64");
  }

  it("nap ca hai co (600 va 1400) cho moi tam", async () => {
    const res = await anh.POST(
      goi("anh", { anh: [{ fileId: "anhmotanhmot", duLieu: await anhThat(1600, 1200) }] }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ xong: 1, hong: [] });
    expect(ghiTep.mock.calls.map((c) => c[0])).toEqual([
      "sheet-cache/anhmotanhmot-600.webp",
      "sheet-cache/anhmotanhmot-1400.webp",
    ]);
  });

  it("mot tam hong khong lam hong ca lo, va bao ro tam nao", async () => {
    // Apps Script gui theo lo. Neu mot tam hong lam ca yeu cau that bai thi
    // nam tam kia phai tai lai tu dau o luot sau — va co the hong mai mai.
    const gianDiep = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const res = await anh.POST(
        goi("anh", {
          anh: [
            { fileId: "anhmotanhmot", duLieu: await anhThat(800, 600) },
            { fileId: "anhhaianhhai", duLieu: Buffer.from("khong phai anh").toString("base64") },
          ],
        }),
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as { xong: number; hong: { fileId: string }[] };
      expect(body.xong).toBe(1);
      expect(body.hong.map((h) => h.fileId)).toEqual(["anhhaianhhai"]);
    } finally {
      gianDiep.mockRestore();
    }
  });

  it("tu choi fileId khong hop le va lo qua dai", async () => {
    const mot = { fileId: "anhmotanhmot", duLieu: "eA==" };
    expect((await anh.POST(goi("anh", { anh: [{ ...mot, fileId: "../bi-mat" }] }))).status)
      .toBe(400);
    expect((await anh.POST(goi("anh", { anh: [] }))).status).toBe(400);
    expect((await anh.POST(goi("anh", { anh: Array(7).fill(mot) }))).status).toBe(400);
    expect(ghiTep).not.toHaveBeenCalled();
  });
});
