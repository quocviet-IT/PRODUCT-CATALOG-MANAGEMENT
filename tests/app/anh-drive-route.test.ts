import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionUser = vi.fn();
const layUrlAnhSheet = vi.fn();
vi.mock("@/auth/guard", () => ({ getSessionUser }));
vi.mock("@/modules/media/anh-drive", () => ({ layUrlAnhSheet }));

const { GET } = await import("@/app/api/anh-drive/[fileId]/route");

const NGUOI_DUNG = { id: "u1", email: "a@b.c", fullName: "A", role: "sale", isActive: true };
const goi = (fileId: string) =>
  GET(new Request("http://x/api/anh-drive/x"), { params: Promise.resolve({ fileId }) });

beforeEach(() => {
  getSessionUser.mockReset();
  layUrlAnhSheet.mockReset();
  layUrlAnhSheet.mockResolvedValue("https://ky.example/anh.webp");
});

describe("GET /api/anh-drive/[fileId]", () => {
  it("tu choi khi chua dang nhap", async () => {
    getSessionUser.mockResolvedValue(null);
    expect((await goi("1AbcDefGhiJkl")).status).toBe(401);
    expect(layUrlAnhSheet).not.toHaveBeenCalled();
  });

  it("tu choi khi tai khoan bi vo hieu hoa", async () => {
    getSessionUser.mockResolvedValue({ ...NGUOI_DUNG, isActive: false });
    expect((await goi("1AbcDefGhiJkl")).status).toBe(401);
    expect(layUrlAnhSheet).not.toHaveBeenCalled();
  });

  it("tu choi fileId khong hop le — gia tri nay den tu URL", async () => {
    getSessionUser.mockResolvedValue(NGUOI_DUNG);
    for (const xau of ["../../bi-mat", "a", "co khoang trang", "x".repeat(200)]) {
      expect((await goi(xau)).status).toBe(400);
    }
    expect(layUrlAnhSheet).not.toHaveBeenCalled();
  });

  it("chuyen huong sang URL co ky khi hop le", async () => {
    getSessionUser.mockResolvedValue(NGUOI_DUNG);
    const res = await goi("1AbcDefGhiJkl");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://ky.example/anh.webp");
  });

  it("tra 502 khi Drive hong, khong nem ra ngoai", async () => {
    getSessionUser.mockResolvedValue(NGUOI_DUNG);
    layUrlAnhSheet.mockRejectedValue(new Error("drive hong"));
    expect((await goi("1AbcDefGhiJkl")).status).toBe(502);
  });

  it("ghi log phia server khi layUrlAnhSheet loi, nhung than phan hoi van rong va status van 502", async () => {
    getSessionUser.mockResolvedValue(NGUOI_DUNG);
    const loiGoc = new Error("drive hong");
    layUrlAnhSheet.mockRejectedValue(loiGoc);
    const gianDiep = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const res = await goi("1AbcDefGhiJkl");
      expect(res.status).toBe(502);
      expect(await res.text()).toBe("");
      expect(gianDiep).toHaveBeenCalledTimes(1);
      const noiDungLog = gianDiep.mock.calls[0].map(String).join(" ");
      // Phai neu ra duoc fileId nao hong de con dau vet ma grep.
      expect(noiDungLog).toContain("1AbcDefGhiJkl");
      // Phai giu lai loi goc (khong nuot mat ly do that su).
      expect(gianDiep.mock.calls[0]).toContain(loiGoc);
    } finally {
      gianDiep.mockRestore();
    }
  });

  it("moi phan hoi tuyen nay tra ve deu mang Cache-Control: private, no-store", async () => {
    const kiemTraKhongLuuDem = (res: Response) => {
      expect(res.headers.get("cache-control")).toBe("private, no-store");
    };

    // 401 — chua dang nhap
    getSessionUser.mockResolvedValue(null);
    kiemTraKhongLuuDem(await goi("1AbcDefGhiJkl"));

    // 401 — tai khoan bi vo hieu hoa
    getSessionUser.mockResolvedValue({ ...NGUOI_DUNG, isActive: false });
    kiemTraKhongLuuDem(await goi("1AbcDefGhiJkl"));

    // 400 — fileId khong hop le
    getSessionUser.mockResolvedValue(NGUOI_DUNG);
    kiemTraKhongLuuDem(await goi("a"));

    // 302 — hop le
    kiemTraKhongLuuDem(await goi("1AbcDefGhiJkl"));

    // 502 — layUrlAnhSheet loi
    const gianDiep = vi.spyOn(console, "error").mockImplementation(() => {});
    layUrlAnhSheet.mockRejectedValue(new Error("drive hong"));
    try {
      kiemTraKhongLuuDem(await goi("1AbcDefGhiJkl"));
    } finally {
      gianDiep.mockRestore();
    }
  });
});
