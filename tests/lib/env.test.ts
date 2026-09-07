import { describe, it, expect } from "vitest";
import { parseEnv } from "@/lib/env";

const day = {
  DATABASE_URL: "postgresql://u:p@db.abc.supabase.co:5432/postgres",
  NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "anon-key",
  SUPABASE_SECRET_KEY: "service-key",
  SUPABASE_STORAGE_BUCKET: "catalogue",
  GOOGLE_SERVICE_ACCOUNT_EMAIL: "may@du-an.iam.gserviceaccount.com",
  GOOGLE_SERVICE_ACCOUNT_KEY: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
  CATALOGUE_SHEET_ID: "1abcDEF",
  CATALOGUE_SHEET_TAB: "test",
};

describe("parseEnv", () => {
  it("tra ve cau hinh khi day du bien", () => {
    expect(parseEnv(day)).toEqual(day);
  });

  it("dung bucket mac dinh khi khong khai bao", () => {
    const { SUPABASE_STORAGE_BUCKET, ...thieu } = day;
    expect(parseEnv(thieu).SUPABASE_STORAGE_BUCKET).toBe("catalogue");
  });

  it("nem loi va neu ten bien bi thieu", () => {
    const { SUPABASE_SECRET_KEY, ...thieu } = day;
    expect(() => parseEnv(thieu)).toThrow(/SUPABASE_SECRET_KEY/);
  });

  it("nem loi khi DATABASE_URL khong phai URL", () => {
    expect(() => parseEnv({ ...day, DATABASE_URL: "khong-phai-url" })).toThrow(/DATABASE_URL/);
  });
});

describe("cau hinh Google Sheet", () => {
  // CATALOGUE_SHEET_TAB nay BAT BUOC (khong con mac dinh), nen phai khai bao
  // tuong minh o day de cac test khac trong khoi nay khong vo tinh phu thuoc
  // vao mac dinh cu.
  const day_du = {
    DATABASE_URL: "postgresql://u:p@h:5432/d",
    NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "pk",
    SUPABASE_SECRET_KEY: "sk",
    GOOGLE_SERVICE_ACCOUNT_EMAIL: "may@du-an.iam.gserviceaccount.com",
    GOOGLE_SERVICE_ACCOUNT_KEY: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
    CATALOGUE_SHEET_ID: "1abcDEF",
    CATALOGUE_SHEET_TAB: "test",
  };

  it("nem loi neu thieu CATALOGUE_SHEET_TAB — khong con gia tri mac dinh", () => {
    // Truoc day mac dinh la "test": mot ban trien khai quen khai bao bien
    // nay se doc nham mot tab that su ten "test" ma khong bao loi gi ca.
    const { CATALOGUE_SHEET_TAB: _bo, ...thieu } = day_du;
    expect(() => parseEnv(thieu)).toThrow(/CATALOGUE_SHEET_TAB/);
  });

  // Ba bien Google (email/khoa service account, ID bang tinh) la TUY CHON:
  // thieu chung khong duoc lam sap ca ung dung, chi tinh nang catalogue moi
  // tu nem loi rieng khi thuc su can toi (xem google-auth.ts, catalogue.service.ts).
  it("parse thanh cong khi thieu email service account", () => {
    const { GOOGLE_SERVICE_ACCOUNT_EMAIL: _bo, ...con_lai } = day_du;
    expect(() => parseEnv(con_lai)).not.toThrow();
    expect(parseEnv(con_lai).GOOGLE_SERVICE_ACCOUNT_EMAIL).toBeUndefined();
  });

  it("parse thanh cong khi thieu khoa service account", () => {
    const { GOOGLE_SERVICE_ACCOUNT_KEY: _bo, ...con_lai } = day_du;
    expect(() => parseEnv(con_lai)).not.toThrow();
    expect(parseEnv(con_lai).GOOGLE_SERVICE_ACCOUNT_KEY).toBeUndefined();
  });

  it("parse thanh cong khi thieu ID bang tinh", () => {
    const { CATALOGUE_SHEET_ID: _bo, ...con_lai } = day_du;
    expect(() => parseEnv(con_lai)).not.toThrow();
    expect(parseEnv(con_lai).CATALOGUE_SHEET_ID).toBeUndefined();
  });

  it("parse thanh cong khi thieu ca ba bien Google cung luc", () => {
    const {
      GOOGLE_SERVICE_ACCOUNT_EMAIL: _e, GOOGLE_SERVICE_ACCOUNT_KEY: _k,
      CATALOGUE_SHEET_ID: _id, ...con_lai
    } = day_du;
    expect(() => parseEnv(con_lai)).not.toThrow();
  });
});
