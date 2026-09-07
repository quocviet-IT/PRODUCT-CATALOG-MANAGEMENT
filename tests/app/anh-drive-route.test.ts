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
});
