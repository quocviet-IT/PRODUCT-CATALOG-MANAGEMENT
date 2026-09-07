import { config } from "dotenv";

// PHAI nap bien moi truong TRUOC khi import bat cu module nao doc chung.
// Trong ESM moi lenh `import` tinh deu duoc NANG LEN va chay truoc cac cau lenh
// thuong, nen cac module doc getEnv() phai nap bang import() dong o duoi,
// khong duoc dat o dau file.
config({ path: ".env.local" });

const { docBangTho } = await import("../src/modules/sheet/sheet.client");
const { taiTepDrive } = await import("../src/modules/sheet/drive.client");
const { anhXaBang } = await import("../src/modules/sheet/catalogue.mapper");
const { getEnv } = await import("../src/lib/env");

// CATALOGUE_SHEET_TAB khong con gia tri mac dinh trong schema (xem
// src/lib/env.ts) — doc qua getEnv() de dung chung mot nguon that thay vi tu
// suy dien lai "?? \"test\"" o day.
const env = getEnv();
const id = env.CATALOGUE_SHEET_ID!;
const tab = env.CATALOGUE_SHEET_TAB;

const tho = await docBangTho(id, tab);
const ds = anhXaBang(tho);
console.log(`Doc duoc ${ds.length} dong tu tab "${tab}".`);
console.log(`Dong dau: ${JSON.stringify(ds[0], null, 2)}`);

const dongCoAnh = ds.find((d) => d.fileIdAnh !== null);
if (!dongCoAnh) {
  console.log("Khong dong nao co anh — khong thu tai duoc.");
} else {
  const bytes = await taiTepDrive(dongCoAnh.fileIdAnh!);
  console.log(`Tai duoc anh ${dongCoAnh.fileIdAnh}: ${bytes.byteLength} bytes.`);
}
