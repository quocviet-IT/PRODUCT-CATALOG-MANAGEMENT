import { describe, expect, it } from "vitest";
import { docBangTho } from "@/modules/sheet/sheet.client";
import { taiTepDrive } from "@/modules/sheet/drive.client";
import { anhXaBang } from "@/modules/sheet/catalogue.mapper";

// Bo qua khi may chua co khoa, de bo test van chay duoc tren may sach.
//
// Boolean(...) thoi la CHUA DU: .env.local dung placeholder tu nhan dien
// (vi du "CHUA_CO_KHOA_THAT__SE_LOI_KHI_GOI_GOOGLE_API", xem .env.example) de
// suite khong vo vi getEnv() thieu bien luc import. Placeholder do la chuoi
// khong rong nen truthy check don thuan se coi la "co khoa" roi cho test nay
// chay that va that bai o cong xac thuc, thay vi bo qua gon gang nhu y muon.
// Vi vay phai loai luon gia tri bat dau bang tien to danh dau "CHUA_CO".
const TIEN_TO_GIA = "CHUA_CO";
const laGiaTriThat = (v: string | undefined): boolean =>
  Boolean(v) && !v!.startsWith(TIEN_TO_GIA);

const coKhoa =
  laGiaTriThat(process.env.GOOGLE_SERVICE_ACCOUNT_KEY) &&
  laGiaTriThat(process.env.CATALOGUE_SHEET_ID);
const kiemTra = coKhoa ? describe : describe.skip;

kiemTra("doc that tu Google", () => {
  it("doc duoc bang va anh xa ra dong co du lieu", async () => {
    const tho = await docBangTho(process.env.CATALOGUE_SHEET_ID!, process.env.CATALOGUE_SHEET_TAB ?? "test");
    const ds = anhXaBang(tho);
    expect(ds.length).toBeGreaterThan(0);
    expect(ds.some((d) => d.fileIdAnh !== null)).toBe(true);
  }, 30000);

  it("tai duoc anh rieng tu tu Drive", async () => {
    const tho = await docBangTho(process.env.CATALOGUE_SHEET_ID!, process.env.CATALOGUE_SHEET_TAB ?? "test");
    const id = anhXaBang(tho).find((d) => d.fileIdAnh !== null)!.fileIdAnh!;
    const bytes = await taiTepDrive(id);
    expect(bytes.byteLength).toBeGreaterThan(1000);
  }, 60000);
});
