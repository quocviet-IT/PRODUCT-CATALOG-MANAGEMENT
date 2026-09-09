import { beforeEach, describe, expect, it, vi } from "vitest";

const layAnhSheet = vi.fn();
// Ban gia phai khai DU nhung gi tuyen thuc su import. Tuyen doc CO_ANH_HOP_LE
// de doi chieu tham so ?w= — thieu no thi tuyen no ngay khi chay.
vi.mock("@/modules/media/anh-drive", () => ({
  layAnhSheet,
  CANH_DAI_ANH_SHEET: 600,
  CANH_DAI_ANH_LON: 1400,
  CO_ANH_HOP_LE: [600, 1400],
}));

const { GET } = await import("@/app/api/anh-drive/[fileId]/route");

const goi = (fileId: string) =>
  GET(new Request("http://x/api/anh-drive/x"), { params: Promise.resolve({ fileId }) });

beforeEach(() => {
  layAnhSheet.mockReset();
  // Bytes gia — tuyen chi chuyen tiep chung, khong doc noi dung.
  layAnhSheet.mockResolvedValue(Buffer.from("webp-gia"));
});

describe("GET /api/anh-drive/[fileId]", () => {
  it("phuc vu khi khong co phien dang nhap — tuyen nay dang mo cong khai", async () => {
    const res = await goi("1AbcDefGhiJkl");
    expect(res.status).toBe(200);
  });

  it("khong import cong dang nhap — mo cong khai thi khong duoc con phu thuoc auth", async () => {
    // Chan de viec "vo tinh gan lai requireUser" bi bat ngay, thay vi phai doi
    // ai do mo trang moi phat hien anh khong hien.
    const nguon = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/app/api/anh-drive/[fileId]/route.ts", "utf8"),
    );
    expect(nguon).not.toContain("@/auth/guard");
  });

  it("tu choi fileId khong hop le — gia tri nay den tu URL", async () => {
    for (const xau of ["../../bi-mat", "a", "co khoang trang", "x".repeat(200)]) {
      expect((await goi(xau)).status).toBe(400);
    }
    expect(layAnhSheet).not.toHaveBeenCalled();
  });

  it("tra thang bytes anh, kem header cache dai", async () => {
    // Truoc day tuyen tra 302 sang mot URL co ky va cam cache — moi tam anh,
    // moi lan mo trang, ton hai luot goi Supabase vong qua Thai Binh Duong.
    const res = await goi("1AbcDefGhiJkl");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/webp");
    expect(await res.text()).toBe("webp-gia");

    const cache = res.headers.get("cache-control") ?? "";
    expect(cache).toContain("public");
    expect(cache).toContain("immutable");
  });

  it("tra 502 khi Drive hong, khong nem ra ngoai", async () => {
    layAnhSheet.mockRejectedValue(new Error("drive hong"));
    expect((await goi("1AbcDefGhiJkl")).status).toBe(502);
  });

  it("ghi log phia server khi layAnhSheet loi, nhung than phan hoi van rong va status van 502", async () => {
    const loiGoc = new Error("drive hong");
    layAnhSheet.mockRejectedValue(loiGoc);
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

  it("LOI thi khong duoc cache — mot 502 bi giu lai la anh chet ca thang", async () => {
    const kiemTraKhongLuuDem = (res: Response) => {
      expect(res.headers.get("cache-control")).toBe("private, no-store");
    };

    // 400 — fileId khong hop le
    kiemTraKhongLuuDem(await goi("a"));

    // 502 — layAnhSheet loi
    const gianDiep = vi.spyOn(console, "error").mockImplementation(() => {});
    layAnhSheet.mockRejectedValue(new Error("drive hong"));
    try {
      kiemTraKhongLuuDem(await goi("1AbcDefGhiJkl"));
    } finally {
      gianDiep.mockRestore();
    }
  });
});
