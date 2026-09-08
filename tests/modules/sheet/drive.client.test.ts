import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const layAccessToken = vi.fn();
vi.mock("@/modules/sheet/google-auth", () => ({ layAccessToken }));

const { taiAnhDrive, lietKeAnhTrongThuMuc } = await import("@/modules/sheet/drive.client");

const FILE_ID = "1AbcDefGhiJkl";
const THUMB = "https://lh3.googleusercontent.com/drive-storage/AJQW-token=s220";

/** Ban do URL -> phan hoi. Dung URL that de test bat duoc loi dat sai tham so. */
function gaFetch(ban: { khop: RegExp; tra: () => Response }[]) {
  const daGoi: string[] = [];
  const gia = vi.fn(async (u: string | URL) => {
    const url = String(u);
    daGoi.push(url);
    const m = ban.find((b) => b.khop.test(url));
    if (!m) throw new Error(`URL khong duoc mo phong: ${url}`);
    return m.tra();
  });
  vi.stubGlobal("fetch", gia);
  return daGoi;
}

const anhGia = () => new Response(new Uint8Array([1, 2, 3]), { status: 200 });
const jsonGia = (o: unknown) =>
  new Response(JSON.stringify(o), { status: 200, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  layAccessToken.mockReset();
  layAccessToken.mockResolvedValue("token-gia");
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("taiAnhDrive", () => {
  it("tai BAN GOC khi tai khoan duoc phep tai", async () => {
    const daGoi = gaFetch([
      { khop: /fields=/, tra: () => jsonGia({ capabilities: { canDownload: true }, thumbnailLink: THUMB }) },
      { khop: /alt=media/, tra: anhGia },
    ]);
    const b = await taiAnhDrive(FILE_ID);
    expect(b.byteLength).toBe(3);
    expect(daGoi.some((u) => u.includes("alt=media"))).toBe(true);
    expect(daGoi.some((u) => u.includes("googleusercontent"))).toBe(false);
  });

  it("lui ve THUMBNAIL khi khong duoc tai ban goc", async () => {
    // Day la truong hop that: hai Shared Drive dat restrictedForReaders, nen
    // service account vai tro Nguoi xem nhan canDownload=false. Neu khong co
    // duong lui nay thi MOI anh deu hong trong khi bang tinh van chay.
    const daGoi = gaFetch([
      { khop: /fields=/, tra: () => jsonGia({ capabilities: { canDownload: false }, thumbnailLink: THUMB }) },
      { khop: /googleusercontent/, tra: anhGia },
    ]);
    const b = await taiAnhDrive(FILE_ID);
    expect(b.byteLength).toBe(3);
    expect(daGoi.some((u) => u.includes("alt=media"))).toBe(false);
  });

  it("xin thumbnail o kich thuoc minh can, thay hau to co san", async () => {
    // Link Drive tra ve co san "=s220" — giu nguyen thi anh be xiu va vo.
    const daGoi = gaFetch([
      { khop: /fields=/, tra: () => jsonGia({ capabilities: { canDownload: false }, thumbnailLink: THUMB }) },
      { khop: /googleusercontent/, tra: anhGia },
    ]);
    await taiAnhDrive(FILE_ID);
    const url = daGoi.find((u) => u.includes("googleusercontent"))!;
    expect(url).toContain("=w1600");
    expect(url).not.toContain("=s220");
  });

  it("bao loi ro rang khi khong tai duoc goc VA cung khong co thumbnail", async () => {
    gaFetch([
      { khop: /fields=/, tra: () => jsonGia({ capabilities: { canDownload: false } }) },
    ]);
    await expect(taiAnhDrive(FILE_ID)).rejects.toThrow(/thumbnail/i);
  });

  it("thieu capabilities thi coi nhu KHONG tai duoc goc", async () => {
    // Doan chac an: Drive khong tra truong nay thi dung duong chac chan chay
    // duoc, thay vi thu alt=media roi hong tren tung anh.
    const daGoi = gaFetch([
      { khop: /fields=/, tra: () => jsonGia({ thumbnailLink: THUMB }) },
      { khop: /googleusercontent/, tra: anhGia },
    ]);
    await taiAnhDrive(FILE_ID);
    expect(daGoi.some((u) => u.includes("alt=media"))).toBe(false);
  });
});

describe("lietKeAnhTrongThuMuc", () => {
  it("gui kem hai co Shared Drive — thieu chung API tra danh sach RONG kem HTTP 200", async () => {
    const daGoi = gaFetch([
      { khop: /drive\/v3\/files\?/, tra: () => jsonGia({ files: [{ id: "a", name: "1.jpg" }] }) },
    ]);
    const kq = await lietKeAnhTrongThuMuc("thumuc-1");
    expect(kq).toEqual([{ fileId: "a", ten: "1.jpg" }]);
    expect(daGoi[0]).toContain("supportsAllDrives=true");
    expect(daGoi[0]).toContain("includeItemsFromAllDrives=true");
  });

  it("thu muc rong tra ve mang rong, khong nem loi", async () => {
    gaFetch([{ khop: /drive\/v3\/files\?/, tra: () => jsonGia({}) }]);
    await expect(lietKeAnhTrongThuMuc("thumuc-rong")).resolves.toEqual([]);
  });
});
