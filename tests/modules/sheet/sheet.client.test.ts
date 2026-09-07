import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// google-auth.ts la file DUY NHAT duoc phep dung google-auth-library that; o day
// gia lap ham lay token de sheet.client.ts khong cham vao credentials that.
vi.mock("@/modules/sheet/google-auth", () => ({
  layAccessToken: vi.fn(async () => "token-gia"),
}));

import { docBangTho } from "@/modules/sheet/sheet.client";

/** Phan hoi rong nhung hop le, du de docBangTho khong nem loi sau khi goi fetch. */
function phanHoiRong(): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({ sheets: [{ data: [{ rowData: [] }] }] }),
    text: async () => "",
  } as unknown as Response;
}

describe("docBangTho - dung pham vi A1 khi dung ten tab", () => {
  let fetchGoc: typeof global.fetch;
  let fetchGia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchGoc = global.fetch;
    fetchGia = vi.fn(async () => phanHoiRong());
    global.fetch = fetchGia as unknown as typeof global.fetch;
  });

  afterEach(() => {
    global.fetch = fetchGoc;
  });

  it("ten tab thuong (khong ky tu dac biet) van duoc boc trong dau nhay don", async () => {
    await docBangTho("sheet-id", "test");
    const url = fetchGia.mock.calls[0][0] as string;
    expect(url).toContain(`ranges=${encodeURIComponent("'test'")}`);
  });

  it("ten tab co dau cach phai duoc boc trong dau nhay don truoc khi ma hoa", async () => {
    await docBangTho("sheet-id", "Online Cataloge");
    const url = fetchGia.mock.calls[0][0] as string;
    expect(url).toContain(`ranges=${encodeURIComponent("'Online Cataloge'")}`);
    // Khong duoc con dang khong boc dau nhay — day chinh la loi da gay 400.
    expect(url).not.toContain(`ranges=${encodeURIComponent("Online Cataloge")}`);
  });

  it("dau nhay don co san trong ten tab phai duoc nhan doi ben trong cap boc", async () => {
    await docBangTho("sheet-id", "O'Brien");
    const url = fetchGia.mock.calls[0][0] as string;
    expect(url).toContain(`ranges=${encodeURIComponent("'O''Brien'")}`);
  });
});
