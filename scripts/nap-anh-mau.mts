/**
 * Nap san anh vao Supabase Storage dung KHOA CACHE ma tuyen /api/anh-drive dung.
 *
 * Vi sao can: Shared Drive chua anh dat downloadRestriction.restrictedForReaders,
 * nen tai khoan chi-duoc-xem KHONG tai duoc tep goc (403 cannotDownloadFile).
 * Nhung Drive VAN cap thumbnailLink cho tep do — chinh la thu Google Sheets dung
 * de hien anh trong o. Link do tai duoc khong can dang nhap va doi duoc kich thuoc.
 *
 * Tuyen /api/anh-drive kiem "da co trong Storage chua" TRUOC khi goi Drive, nen
 * sau khi nap xong, luoi hien anh that ma khong cham Google lan nao.
 *
 * Khi co service account that, cac muc nay van dung lai duoc — cung khoa, cung
 * kich thuoc. Khong phi cong.
 *
 * Chay: npx tsx scripts/nap-anh-mau.mts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { readFile } from "node:fs/promises";
import sharp from "sharp";

const { dungKhoaAnhSheet, ghiTep, tepTonTai } = await import("../src/modules/media/storage");
const { CANH_DAI_ANH_SHEET } = await import("../src/modules/media/anh-drive");

const TIEN_TO = "https://lh3.googleusercontent.com/drive-storage/";
// Xin ban rong 1200px roi tu thu nho — de anh 600px khong bi mem.
const KICH_THUOC_XIN = "w1200";

// Chay: npx tsx scripts/nap-anh-mau.mts [ten-tep-token]
const tepToken = process.argv[2] ?? "thumb-tokens.local.json";
const tokens = JSON.parse(await readFile(tepToken, "utf8")) as Record<string, string>;

const ids = Object.keys(tokens);
let daCo = 0, napMoi = 0, hong = 0;

for (const [i, fileId] of ids.entries()) {
  const khoa = dungKhoaAnhSheet(fileId, CANH_DAI_ANH_SHEET);
  const nhan = `[${i + 1}/${ids.length}] ${fileId.slice(0, 10)}...`;

  try {
    if (await tepTonTai(khoa)) {
      daCo++;
      console.log(`${nhan} da co, bo qua`);
      continue;
    }

    const res = await fetch(`${TIEN_TO}${tokens[fileId]}=${KICH_THUOC_XIN}`);
    if (!res.ok) throw new Error(`tai thumbnail that bai: ${res.status}`);
    const goc = Buffer.from(await res.arrayBuffer());

    // Cung luat voi anh-drive.ts: chi rang buoc MOT chieu de sharp khong lam
    // tron hai lan roi lech 1px.
    const meta = await sharp(goc).metadata();
    if (!meta.width || !meta.height) throw new Error("khong doc duoc kich thuoc");
    const rangBuoc =
      meta.width >= meta.height
        ? { width: Math.min(meta.width, CANH_DAI_ANH_SHEET) }
        : { height: Math.min(meta.height, CANH_DAI_ANH_SHEET) };

    const nho = await sharp(goc)
      .rotate()
      .resize({ ...rangBuoc, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    await ghiTep(khoa, nho, "image/webp");
    napMoi++;
    console.log(`${nhan} nap xong ${(nho.byteLength / 1024).toFixed(0)} KB`);
  } catch (e) {
    hong++;
    console.log(`${nhan} HONG: ${e instanceof Error ? e.message : String(e)}`);
  }
}

console.log(`\nTong ${ids.length} | nap moi ${napMoi} | da co ${daCo} | hong ${hong}`);
