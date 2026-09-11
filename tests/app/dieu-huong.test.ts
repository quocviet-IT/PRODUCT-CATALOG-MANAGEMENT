import { describe, expect, it } from "vitest";
import { MUC_CHINH, laTrangDangMo } from "@/app/admin/dieu-huong";

describe("laTrangDangMo", () => {
  it("sang khi dung trang do, hoac mot trang con cua no", () => {
    expect(laTrangDangMo("/admin/catalogue", "/admin/catalogue")).toBe(true);
    expect(laTrangDangMo("/admin/catalogue-sheet/12", "/admin/catalogue-sheet")).toBe(true);
  });

  it("KHONG nham hai duong dan chung tien to", () => {
    // "/admin/catalogue-sheet" bat dau bang "/admin/catalogue": so tien to tho
    // thi dang o luoi mau ma muc "Catalogue da tao" cung sang.
    expect(laTrangDangMo("/admin/catalogue-sheet", "/admin/catalogue")).toBe(false);
    expect(laTrangDangMo("/admin/catalogue-sheet/12", "/admin/catalogue")).toBe(false);
  });

  it("chua biet duong dan thi khong muc nao sang", () => {
    expect(laTrangDangMo(null, "/admin/catalogue")).toBe(false);
  });

  it("moi trang lam viec sang dung MOT muc tren thanh, trang quan tri khong sang muc nao", () => {
    const sang = (d: string) => MUC_CHINH.filter((m) => laTrangDangMo(d, m.href)).length;
    for (const d of ["/admin/catalogue-sheet", "/admin/catalogue-sheet/5", "/admin/catalogue", "/admin/huong-dan"]) {
      expect(sang(d)).toBe(1);
    }
    expect(sang("/admin/gop-y")).toBe(0);
    expect(sang("/admin/nguoi-dung")).toBe(0);
  });
});
