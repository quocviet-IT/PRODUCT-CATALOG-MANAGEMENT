import { config } from "dotenv";

// PHAI nap bien moi truong TRUOC khi import bat cu module nao doc chung.
// Trong ESM moi lenh `import` tinh deu duoc NANG LEN va chay truoc cac cau lenh
// thuong, nen cac module doc getEnv() phai nap bang import() dong o duoi,
// khong duoc dat o dau file.
config({ path: ".env.local" });

const { docBangTho } = await import("../src/modules/sheet/sheet.client");
const { taiTepDrive } = await import("../src/modules/sheet/drive.client");
const { anhXaBang } = await import("../src/modules/sheet/catalogue.mapper");

const id = process.env.CATALOGUE_SHEET_ID!;
const tab = process.env.CATALOGUE_SHEET_TAB ?? "test";

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
