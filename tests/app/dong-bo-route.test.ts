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
const thieuThuMuc = await import("@/app/api/dong-bo/thieu-thu-muc/route");
const anhThuMuc = await import("@/app/api/dong-bo/anh-thu-muc/route");
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
    ["thieu-thu-muc", thieuThuMuc.POST],
    ["anh-thu-muc", anhThuMuc.POST],
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
  const thanTot = { hang: bangMau };

  it("ghi bang va moc thoi gian", async () => {
    const res = await duLieu.POST(goi("du-lieu", thanTot));
    expect(res.status).toBe(200);
    expect(((await res.json()) as { soDong: number }).soDong).toBeGreaterThan(0);

    expect(ghiTep.mock.calls.map((c) => c[0])).toEqual([
      "dong-bo/bang.json",
      "dong-bo/trang-thai.json",
    ]);
  });

  it("KHONG ghi de ban do thu muc, du than co mang anhThuMuc", async () => {
    // Ban do thu muc duoc dung DAN qua nhieu luot (xem /anh-thu-muc). Mot script
    // cu con gui ca ban do mot phan len day; ghi de la xoa sach cong cua ca chuc
    // luot truoc do.
    await duLieu.POST(goi("du-lieu", { hang: bangMau, anhThuMuc: { x: [] } }));
    expect(ghiTep.mock.calls.map((c) => c[0])).not.toContain("dong-bo/anh-thu-muc.json");
  });

  it("khong kem anhThuMuc thi GIU NGUYEN danh sach anh cu, khong xoa", async () => {
    // Day la ca chay moi phut. Ghi de anh-thu-muc.json bang mot vat rong o day
    // se xoa sach thu vien anh cua 65 mau — im lang, va moi phut mot lan.
    taiVe.mockResolvedValue(
      Buffer.from(
        JSON.stringify({ luc: "2026-09-09T01:00:00.000Z", soDong: 71, soThuMuc: 65, soAnh: 1717 }),
        "utf8",
      ),
    );
    const res = await duLieu.POST(goi("du-lieu", { hang: bangMau }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { soThuMuc: number; soAnh: number };
    // Con so cu duoc mang sang, khong tut ve 0.
    expect(body.soThuMuc).toBe(65);
    expect(body.soAnh).toBe(1717);

    const khoaDaGhi = ghiTep.mock.calls.map((c) => c[0]);
    expect(khoaDaGhi).not.toContain("dong-bo/anh-thu-muc.json");
    expect(khoaDaGhi).toContain("dong-bo/bang.json");
  });

  it("bang khong doi thi khong ghi lai, nhung moc thoi gian van cap nhat", async () => {
    // Lan dau: ghi va sinh ra trang thai.
    await duLieu.POST(goi("du-lieu", { hang: bangMau }));
    const trangThai = ghiTep.mock.calls.find((c) => c[0] === "dong-bo/trang-thai.json")![1];
    ghiTep.mockClear();

    // Lan hai: dung bang do, va lan nay doc duoc trang thai cua lan truoc.
    taiVe.mockResolvedValue(trangThai);
    const res = await duLieu.POST(goi("du-lieu", { hang: bangMau }));
    expect((await res.json()).doiBang).toBe(false);

    const khoaDaGhi = ghiTep.mock.calls.map((c) => c[0]);
    // Khong ghi lai tep 110 KB y het ban cu...
    expect(khoaDaGhi).not.toContain("dong-bo/bang.json");
    // ...nhung moc thoi gian PHAI moi: nguoi dung nhin no de biet dong bo con
    // song. Moc dung im vi "khong co gi moi" trong y het moc dung im vi hong.
    expect(khoaDaGhi).toContain("dong-bo/trang-thai.json");
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
    // Bang RONG khong nam o day — no la 422 bang_rong, mot cau tra loi khac han
    // va co bai kiem rieng. O day chi la nhung than khong dung hinh dang.
    expect((await duLieu.POST(goi("du-lieu", { hang: "khong phai mang" }))).status).toBe(400);
    expect((await duLieu.POST(goi("du-lieu", {}))).status).toBe(400);
    // Mot "hang" ma phan tu khong phai mang o — khong phai bang hai chieu.
    expect((await duLieu.POST(goi("du-lieu", { hang: [{ a: 1 }] }))).status).toBe(400);
    expect(ghiTep).not.toHaveBeenCalled();
  });
});

describe("POST /api/dong-bo/thieu-anh", () => {
  // Thu muc cot "Hinh da xu ly" cua dong thu hai trong bangMau (xem mapper test).
  const Q = "1QqXuLy0000000000000000000000";
  const anhThuMuc = {
    [Q]: [{ fileId: "thuvien1", ten: "a.jpg" }, { fileId: "thuvien2", ten: "b.jpg" }],
    // Thu muc cu con sot trong ban do — bang KHONG tro toi no nua.
    "thu-muc-cu": [{ fileId: "cu1", ten: "c.jpg" }],
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

  it("CHI nap anh thu muc cot Hinh da xu ly — khong anh cot HINH, khong thu muc cu", async () => {
    // Chot 11/09/2026. Truoc day tuyen nay nap anh cot HINH truoc roi lap qua
    // MOI thu muc trong ban do — ke ca 1.464 thu muc cu con sot sau khi tab rut
    // tu 1.839 dong xuong 12.
    datBanChup();
    const res = await thieuAnh.POST(goi("thieu-anh", {}));
    const { thieu } = (await res.json()) as { thieu: string[] };
    expect(thieu).toEqual(["thuvien1", "thuvien2"]);
    expect(thieu).not.toContain("18I_Y9I_tLtnizSbupQclY48QBxG3I3XB"); // anh cot HINH cua dong dau
    expect(thieu).not.toContain("cu1"); // thu muc cu bang khong con tro toi
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

describe("liet ke thu muc theo lo", () => {
  // Bang tinh tro toi 1.476 thu muc Drive; DriveApp liet ke mat ~0,55 giay mot
  // cai, tuc hon 13 phut — ma Apps Script cat ngang o 6 phut. Nen phai chia lo,
  // va chia lo thi phai GOP chu khong duoc ghi de.
  const LUC = "dong-bo/thu-muc-luc.json";
  function datBanChup(banDo: Record<string, unknown[]> = {}, luc: Record<string, unknown> = {}) {
    taiVe.mockImplementation(async (khoa: string) =>
      Buffer.from(
        JSON.stringify(khoa === "dong-bo/bang.json" ? bangMau : khoa === LUC ? luc : banDo),
        "utf8",
      ),
    );
  }
  const truocPhut = (phut: number) => new Date(Date.now() - phut * 60_000).toISOString();
  const hoi = async () =>
    (await (await thieuThuMuc.POST(goi("thieu-thu-muc", {}))).json()) as {
      thieu: string[];
      tongThieu: number;
      soMoi: number;
      soCu: number;
    };

  it("thieu-thu-muc: tra ve thu muc CHUA liet ke", async () => {
    datBanChup({});
    const res = await thieuThuMuc.POST(goi("thieu-thu-muc", {}));
    expect(res.status).toBe(200);
    const { thieu, tong } = (await res.json()) as { thieu: string[]; tong: number };
    expect(tong).toBeGreaterThan(0);
    expect(thieu.length).toBe(tong);
  });

  it("thieu-thu-muc: thu muc VUA liet ke thi khong hoi lai", async () => {
    // Ke ca khi no RONG. Co mat trong ban do CUNG moc con han nghia la "vua liet
    // ke xong" — do la thu ngan script hoi lai no o moi luot.
    datBanChup({});
    const dau = await hoi();
    datBanChup(
      Object.fromEntries(dau.thieu.map((id) => [id, []])),
      Object.fromEntries(dau.thieu.map((id) => [id, truocPhut(1)])),
    );
    expect((await hoi()).tongThieu).toBe(0);
  });

  it("thieu-thu-muc: thu muc liet ke QUA 30 phut, hay chua co moc, thi hoi LAI", async () => {
    // Truoc 11/09/2026 moi thu muc chi liet ke mot lan: them anh vao thu muc cu
    // thi web khong bao gio thay.
    datBanChup({});
    const dau = await hoi();
    const [id, ...conLai] = dau.thieu;
    const banDo = Object.fromEntries(dau.thieu.map((x) => [x, []]));
    const conHan = Object.fromEntries(conLai.map((x) => [x, truocPhut(1)]));

    datBanChup(banDo, { ...conHan, [id]: truocPhut(45) });
    const quaHan = await hoi();
    expect(quaHan.thieu).toEqual([id]);
    expect(quaHan.soMoi).toBe(0);
    expect(quaHan.soCu).toBe(1);

    datBanChup(banDo, conHan); // id khong co moc
    expect((await hoi()).thieu).toEqual([id]);
  });

  it("thieu-thu-muc: chua co ban chup thi 409, khong phai 'khong thieu gi'", async () => {
    taiVe.mockRejectedValue(new Error("khong co"));
    const gianDiep = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect((await thieuThuMuc.POST(goi("thieu-thu-muc", {}))).status).toBe(409);
    } finally {
      gianDiep.mockRestore();
    }
  });

  it("anh-thu-muc: GOP chu khong ghi de", async () => {
    taiVe.mockResolvedValue(
      Buffer.from(JSON.stringify({ cu: [{ fileId: "a", ten: "a.jpg" }] }), "utf8"),
    );
    const res = await anhThuMuc.POST(
      goi("anh-thu-muc", { anhThuMuc: { moi: [{ fileId: "b", ten: "b.jpg" }] } }),
    );
    expect(res.status).toBe(200);

    const ghi = ghiTep.mock.calls.find((c) => c[0] === "dong-bo/anh-thu-muc.json");
    expect(ghi).toBeDefined();
    const banDo = JSON.parse((ghi![1] as Buffer).toString("utf8")) as Record<string, unknown[]>;
    expect(Object.keys(banDo).sort()).toEqual(["cu", "moi"]);
  });

  it("anh-thu-muc: tu choi lo qua lon", async () => {
    const qua = Object.fromEntries(
      Array.from({ length: 401 }, (_, i) => [`tm${i}`, []]),
    );
    expect((await anhThuMuc.POST(goi("anh-thu-muc", { anhThuMuc: qua }))).status).toBe(400);
  });

  it("anh-thu-muc: mang RONG khong xoa danh sach dang co anh — co the chi la Drive truc trac", async () => {
    // Tu 11/09/2026 thu muc duoc liet ke LAI moi 30 phut. Apps Script gui mang
    // rong ca khi khong mo duoc thu muc — ghi de theo no la mot lan Drive truc
    // trac xoa sach thu vien anh cua mau dang nam tren catalogue.
    const dangCo = [{ fileId: "a", ten: "a.jpg" }];
    taiVe.mockResolvedValue(Buffer.from(JSON.stringify({ tm: dangCo }), "utf8"));
    const res = await anhThuMuc.POST(goi("anh-thu-muc", { anhThuMuc: { tm: [] } }));
    expect(res.status).toBe(200);
    expect(((await res.json()) as { giuLai: number }).giuLai).toBe(1);

    const ghi = ghiTep.mock.calls.find((c) => c[0] === "dong-bo/anh-thu-muc.json");
    const banDo = JSON.parse((ghi![1] as Buffer).toString("utf8")) as Record<string, unknown[]>;
    expect(banDo.tm).toEqual(dangCo);
    // Khong cap moc cho thu muc bi giu lai: luot sau phai thu lai.
    expect(ghiTep.mock.calls.map((c) => c[0])).not.toContain("dong-bo/thu-muc-luc.json");
  });

  it("anh-thu-muc: ghi moc thoi gian cho thu muc vua liet ke", async () => {
    taiVe.mockResolvedValue(Buffer.from(JSON.stringify({}), "utf8"));
    const res = await anhThuMuc.POST(
      goi("anh-thu-muc", { anhThuMuc: { moi: [{ fileId: "b", ten: "b.jpg" }] } }),
    );
    expect(res.status).toBe(200);
    const ghi = ghiTep.mock.calls.find((c) => c[0] === "dong-bo/thu-muc-luc.json");
    expect(ghi).toBeDefined();
    const luc = JSON.parse((ghi![1] as Buffer).toString("utf8")) as Record<string, string>;
    expect(Number.isFinite(Date.parse(luc.moi))).toBe(true);
  });
});
