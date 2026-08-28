import { describe, it, expect } from "vitest";
import { parseEnv } from "@/lib/env";

const day = {
  DATABASE_URL: "postgresql://u:p@db.abc.supabase.co:5432/postgres",
  NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "anon-key",
  SUPABASE_SECRET_KEY: "service-key",
  SUPABASE_STORAGE_BUCKET: "catalogue",
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
