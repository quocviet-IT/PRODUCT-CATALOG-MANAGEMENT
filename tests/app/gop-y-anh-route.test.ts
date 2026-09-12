import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Anh chup man hinh cua gop y chua du lieu that (gia, ma mau, link khach): chi
 * quan tri DANG HOAT DONG doc duoc. Moi truong hop khac deu la 404 — 403 da xac
 * nhan "co mot anh o day".
 */

const getSessionUser = vi.fn();
const docAnhGopY = vi.fn();
vi.mock("@/auth/guard", () => ({ getSessionUser }));
vi.mock("@/modules/gop-y/gop-y.service", () => ({ docAnhGopY }));

const { GET } = await import("@/app/api/gop-y/anh/[id]/route");

const ID = "0b7a3c2e-5d1f-4a8b-9c6d-2e4f6a8b0c1d";
const goi = (id: string) =>
  GET(new Request(`http://x/api/gop-y/anh/${id}`), { params: Promise.resolve({ id }) });
const QUAN_TRI = { isActive: true, mucQuyen: "admin" };

beforeEach(() => {
  getSessionUser.mockReset();
  docAnhGopY.mockReset();
});

describe("GET /api/gop-y/anh/[id]", () => {
  it.each([
    ["chua dang nhap", null],
    ["nhan vien khong phai quan tri", { isActive: true, mucQuyen: "sale" }],
    ["quan tri da bi khoa", { isActive: false, mucQuyen: "admin" }],
  ])("%s: 404, khong dong toi kho anh", async (_ten, nguoi) => {
    getSessionUser.mockResolvedValue(nguoi);
    const res = await goi(ID);
    expect(res.status).toBe(404);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(docAnhGopY).not.toHaveBeenCalled();
  });

  it("ma khong phai uuid: 404, khong hoi co so du lieu", async () => {
    // De chuoi la xuong Postgres thi cot uuid nem loi va tuyen tra 502 — trong
    // nhu kho anh dang hong, trong khi chi la mot duong dan go sai.
    getSessionUser.mockResolvedValue(QUAN_TRI);
    for (const id of ["abc", `${ID}x`, "..%2F..%2Fbang"]) {
      expect((await goi(id)).status).toBe(404);
    }
    expect(docAnhGopY).not.toHaveBeenCalled();
  });

  it("gop y khong co anh: 404", async () => {
    getSessionUser.mockResolvedValue(QUAN_TRI);
    docAnhGopY.mockResolvedValue(null);
    expect((await goi(ID)).status).toBe(404);
  });

  it("quan tri: tra anh, khong luu dem, khong cho trinh duyet doan kieu", async () => {
    getSessionUser.mockResolvedValue(QUAN_TRI);
    docAnhGopY.mockResolvedValue({ byte: Buffer.from("jpeg-gia"), kieu: "image/jpeg" });
    const res = await goi(ID);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/jpeg");
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(Buffer.from(await res.arrayBuffer()).toString()).toBe("jpeg-gia");
    expect(docAnhGopY).toHaveBeenCalledWith(ID);
  });

  it("kho anh loi: 502, khong nuot loi im lang", async () => {
    getSessionUser.mockResolvedValue(QUAN_TRI);
    docAnhGopY.mockRejectedValue(new Error("storage hong"));
    const gianDiep = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect((await goi(ID)).status).toBe(502);
      expect(gianDiep).toHaveBeenCalled();
    } finally {
      gianDiep.mockRestore();
    }
  });
});
