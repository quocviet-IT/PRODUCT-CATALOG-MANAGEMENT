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
  const day_du = {
    DATABASE_URL: "postgresql://u:p@h:5432/d",
    NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "pk",
    SUPABASE_SECRET_KEY: "sk",
    GOOGLE_SERVICE_ACCOUNT_EMAIL: "may@du-an.iam.gserviceaccount.com",
    GOOGLE_SERVICE_ACCOUNT_KEY: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
    CATALOGUE_SHEET_ID: "1abcDEF",
  };

  it("CATALOGUE_SHEET_TAB mac dinh la test", () => {
    expect(parseEnv(day_du).CATALOGUE_SHEET_TAB).toBe("test");
  });

  it("nem loi neu thieu khoa service account", () => {
    const { GOOGLE_SERVICE_ACCOUNT_KEY: _bo, ...thieu } = day_du;
    expect(() => parseEnv(thieu)).toThrow(/GOOGLE_SERVICE_ACCOUNT_KEY/);
  });

  it("nem loi neu thieu ID bang tinh", () => {
    const { CATALOGUE_SHEET_ID: _bo, ...thieu } = day_du;
    expect(() => parseEnv(thieu)).toThrow(/CATALOGUE_SHEET_ID/);
  });
});
