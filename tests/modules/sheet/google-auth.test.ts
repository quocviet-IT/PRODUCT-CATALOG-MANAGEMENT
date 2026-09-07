import { beforeEach, describe, expect, it, vi } from "vitest";

// GOOGLE_SERVICE_ACCOUNT_EMAIL/KEY la tuy chon o muc getEnv() (xem src/lib/env.ts)
// de thieu chung khong lam sap ca ung dung. google-auth.ts la noi DUY NHAT
// thuc su can chung nen phai tu kiem tra — cac test nay chi kiem duong loi,
// khong goi JWT.getAccessToken() that (se can mang va khoa that).
const getEnv = vi.fn();
vi.mock("@/lib/env", () => ({ getEnv }));

const { layAccessToken, LoiThieuCauHinhGoogle } = await import("@/modules/sheet/google-auth");

beforeEach(() => getEnv.mockReset());

describe("layAccessToken — thieu cau hinh Google", () => {
  it("nem LoiThieuCauHinhGoogle khi thieu ca email lan khoa", async () => {
    getEnv.mockReturnValue({
      GOOGLE_SERVICE_ACCOUNT_EMAIL: undefined,
      GOOGLE_SERVICE_ACCOUNT_KEY: undefined,
    });
    await expect(layAccessToken()).rejects.toBeInstanceOf(LoiThieuCauHinhGoogle);
  });

  it("nem LoiThieuCauHinhGoogle khi chi thieu khoa", async () => {
    getEnv.mockReturnValue({
      GOOGLE_SERVICE_ACCOUNT_EMAIL: "may@du-an.iam.gserviceaccount.com",
      GOOGLE_SERVICE_ACCOUNT_KEY: undefined,
    });
    await expect(layAccessToken()).rejects.toBeInstanceOf(LoiThieuCauHinhGoogle);
  });

  it("nem LoiThieuCauHinhGoogle khi chi thieu email", async () => {
    getEnv.mockReturnValue({
      GOOGLE_SERVICE_ACCOUNT_EMAIL: undefined,
      GOOGLE_SERVICE_ACCOUNT_KEY: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
    });
    await expect(layAccessToken()).rejects.toBeInstanceOf(LoiThieuCauHinhGoogle);
  });
});
