import { config } from "dotenv";

// PHAI nap bien moi truong TRUOC khi import bat cu module nao doc chung.
// Trong ESM moi lenh `import` tinh deu duoc NANG LEN va chay truoc cac cau lenh
// thuong, nen cac module doc getEnv() phai nap bang import() dong o duoi,
// khong duoc dat o dau file.
config({ path: ".env.local" });

/**
 * Kiem tra service account Google da du dieu kien chay THAT chua.
 *
 * Chay: npm run kiem-tra:google
 *
 * Bon chan, chan truoc do chan sau. Moi chan hong deu in ra viec CU THE phai
 * lam, vi bon chan nay hong theo bon cach khac han nhau va rat de doc nham
 * thanh nhau:
 *   1. sai khoa            -> khong lay duoc token
 *   2. chua chia se sheet  -> token dung nhung doc bang tinh 403
 *   3. chua chia se Drive  -> doc bang tinh duoc nhung thu muc tra ve RONG
 *   4. quyen qua thap      -> liet ke duoc anh nhung tai tung anh thi 403
 */

const { getEnv } = await import("../src/lib/env");

const CHUA_CO = "CHUA_CO_";
const env = getEnv();

function batLoi(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

let hong = 0;
function dat(ten: string, ok: boolean, ghiChu: string) {
  console.log(`${ok ? "  OK  " : " HONG "} ${ten.padEnd(28)} ${ghiChu}`);
  if (!ok) hong++;
}

console.log("Kiem tra ket noi Google cho che do REALTIME\n");

// --- 1. Cau hinh ------------------------------------------------------------
const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const khoa = env.GOOGLE_SERVICE_ACCOUNT_KEY;
const sheetId = env.CATALOGUE_SHEET_ID;
const tab = env.CATALOGUE_SHEET_TAB;

const thieu = !email || !khoa || !sheetId;
const conGiaLap = [email, khoa, sheetId].some((v) => v?.startsWith(CHUA_CO));
dat(
  "1. Cau hinh",
  !thieu && !conGiaLap,
  thieu
    ? "thieu GOOGLE_SERVICE_ACCOUNT_EMAIL / _KEY hoac CATALOGUE_SHEET_ID"
    : conGiaLap
      ? "van con gia tri gia lap CHUA_CO_... — thay bang gia tri that"
      : `${email}`,
);
if (thieu || conGiaLap) {
  console.log("\nDung o day: chua co credential thi ba chan sau khong kiem duoc.");
  process.exit(1);
}

// --- 2. Lay token -----------------------------------------------------------
const { layAccessToken } = await import("../src/modules/sheet/google-auth");
const maoDanh = env.GOOGLE_IMPERSONATE_EMAIL;
try {
  await layAccessToken();
  dat(
    "2. Lay access token",
    true,
    maoDanh ? `dang mao danh ${maoDanh}` : "KHONG mao danh ai — xem chan 4",
  );
} catch (e) {
  dat("2. Lay access token", false, batLoi(e));
  console.log("\n-> Kiem lai GOOGLE_SERVICE_ACCOUNT_KEY: khoa PEM phai nam TREN MOT DONG,");
  console.log("   moi cho xuong dong viet bang \\n.");
  process.exit(1);
}

// --- 3. Doc bang tinh -------------------------------------------------------
const { docBangTho } = await import("../src/modules/sheet/sheet.client");
const { anhXaBang } = await import("../src/modules/sheet/catalogue.mapper");

let ds: Awaited<ReturnType<typeof anhXaBang>> = [];
try {
  ds = anhXaBang(await docBangTho(sheetId!, tab));
  dat("3. Doc bang tinh", ds.length > 0, `${ds.length} dong tu tab "${tab}"`);
} catch (e) {
  dat("3. Doc bang tinh", false, batLoi(e));
  console.log(`\n-> Chia se bang tinh cho ${email} voi quyen Nguoi xem.`);
  process.exit(1);
}

// --- 4. Liet ke anh trong thu muc Drive -------------------------------------
const { lietKeAnhTrongThuMuc, taiAnhDrive } = await import("../src/modules/sheet/drive.client");

const coThuMuc = ds.filter((d) => d.idThuMuc !== null);
console.log(`        ${coThuMuc.length}/${ds.length} dong co thu muc anh tren bang tinh`);

let anhThu: string | null = null;
let thuMucRong = 0;
const thuKiem = coThuMuc.slice(0, 5);
for (const d of thuKiem) {
  try {
    const anh = await lietKeAnhTrongThuMuc(d.idThuMuc!);
    if (anh.length === 0) thuMucRong++;
    else anhThu ??= anh[0].fileId;
  } catch (e) {
    dat("4. Liet ke thu muc anh", false, `${d.maMau}: ${batLoi(e)}`);
    process.exit(1);
  }
}
dat(
  "4. Liet ke thu muc anh",
  thuMucRong < thuKiem.length,
  `thu ${thuKiem.length} thu muc, ${thuMucRong} tra ve RONG`,
);
if (thuMucRong === thuKiem.length) {
  console.log("\n-> Thu muc tra ve RONG kem HTTP 200 nghia la KHONG NHIN THAY, khong phai rong.");
  if (!maoDanh) {
    console.log(`   Nguyen nhan gan nhu chac chan: chua dat GOOGLE_IMPERSONATE_EMAIL.`);
    console.log(`   Anh san pham chia se kieu domain/reader — ai trong ctyhp.vn co link deu`);
    console.log(`   xem duoc — ma ${email} nam NGOAI ten mien do nen khong thuoc dien nay.`);
    console.log(`   Bat uy quyen toan mien, roi dat GOOGLE_IMPERSONATE_EMAIL=<nguoi that>@ctyhp.vn`);
  } else {
    console.log(`   Dang mao danh ${maoDanh} — kiem lai nguoi nay co mo duoc thu muc do khong,`);
    console.log(`   va Admin Console da uy quyen du hai pham vi readonly cho client ID chua.`);
  }
  process.exit(1);
}

// --- 5. Tai thu mot anh -----------------------------------------------------
if (!anhThu) {
  console.log("\nKhong co anh nao de thu tai.");
  process.exit(hong > 0 ? 1 : 0);
}
try {
  const bytes = await taiAnhDrive(anhThu);
  dat("5. Tai mot anh", bytes.byteLength > 0, `${anhThu} -> ${(bytes.byteLength / 1024).toFixed(0)} KB`);
} catch (e) {
  dat("5. Tai mot anh", false, batLoi(e));
  console.log("\n-> Ca hai duong (ban goc va thumbnail) deu khong lay duoc anh.");
  console.log("   Kiem lai service account co thuc su nhin thay thu muc do khong.");
  process.exit(1);
}

console.log(
  hong === 0
    ? "\nDU DIEU KIEN chay realtime. Buoc cuoi: BO hai bien CATALOGUE_TEP_MAU va\nCATALOGUE_TEP_ANH_MAU khoi Vercel de he thong doc thang Google thay vi doc\ndu lieu mau."
    : `\nCon ${hong} cho hong.`,
);
process.exit(hong > 0 ? 1 : 0);
