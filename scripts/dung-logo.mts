import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

/**
 * Dung cac tep thuong hieu tu logo goc tren hungphatusa.com.
 *
 * Chay: npm run logo
 *
 * Vi sao la mot script chu khong phai chep tay mot lan: no ghi lai NGUON cua
 * logo. Sau nay cong ty doi logo tren web chinh, chay lai lenh nay la xong,
 * khong phai do lai xem may tep bieu tuong tu dau ma co.
 *
 * Ra ba tep:
 *   public/logo-hung-phat.png  chu "HUNG PHAT", da cat sach le trong suot
 *   src/app/icon.png           bieu tuong: hai chu H va P cat tu CHINH kieu chu
 *                              do, khong phai font khac ve lai
 *   src/app/favicon.ico        cung hinh do, dong goi .ico
 *
 * VI SAO PHAI CO CA HAI tep bieu tuong: Next uu tien favicon.ico hon icon.png.
 * Chi them icon.png ma de nguyen favicon.ico mac dinh cua Next thi thanh trinh
 * duyet VAN hien bieu tuong cu — da mac dung loi nay mot lan.
 */

const NGUON =
  "https://www.hungphatusa.com/cdn/shop/t/50/assets/hung-phat-header-logo.png" +
  "?v=35823475704413365191779112640";

/** Be rong tep logo xuat ra. Cho hien to nhat khoang 220px, x2 cho man hinh net. */
const RONG_LOGO = 600;

/** Thanh trinh duyet chi ve o 16-32px, nhung tep goc de to de con dung cho PWA. */
const CANH_ICON = 512;

/** Canh cua anh trong tep .ico. 256 la muc lon nhat dinh dang nay cho phep. */
const CANH_ICO = 256;

/**
 * Dong goi mot anh PNG thanh tep .ico.
 *
 * Dinh dang ICO cho phep nhet thang mot khoi PNG vao (tu Windows Vista) nen
 * khong can ve lai tung diem anh: chi can 6 byte tieu de + 16 byte muc luc roi
 * den nguyen ban PNG. sharp khong xuat duoc .ico nen phai tu ghep o day.
 */
function dongGoiIco(png: Buffer): Buffer {
  const tieuDe = Buffer.alloc(6);
  tieuDe.writeUInt16LE(0, 0); // du phong, luon 0
  tieuDe.writeUInt16LE(1, 2); // kieu 1 = icon
  tieuDe.writeUInt16LE(1, 4); // so anh trong tep

  const muc = Buffer.alloc(16);
  // 0 nghia la 256: mot byte khong chua noi so 256.
  muc.writeUInt8(CANH_ICO >= 256 ? 0 : CANH_ICO, 0);
  muc.writeUInt8(CANH_ICO >= 256 ? 0 : CANH_ICO, 1);
  muc.writeUInt8(0, 2); // so mau trong bang mau — 0 vi anh mau that
  muc.writeUInt8(0, 3); // du phong
  muc.writeUInt16LE(1, 4); // so mat phang mau
  muc.writeUInt16LE(32, 6); // bit moi diem anh
  muc.writeUInt32LE(png.byteLength, 8);
  muc.writeUInt32LE(tieuDe.byteLength + muc.byteLength, 12); // vi tri khoi anh

  return Buffer.concat([tieuDe, muc, png]);
}

/**
 * Toa do hai chu trong anh goc 1826x490, do bang cach quet cot nao co pixel dac.
 *
 * "HUNG PHAT" tach thanh 6 khoi: H U N G | P HAT — ba chu cuoi dinh nhau nen
 * khong tach roi duoc. May man la chi can H va P.
 */
const CHU_H = { left: 84, width: 204 };
const CHU_P = { left: 1018, width: 155 };
const DONG_CHU = { top: 149, height: 233 };

/** Khoang cach giua H va P trong bieu tuong, tinh theo chieu cao chu. */
const HE_SO_KHE = 0.12;
/** Le quanh bieu tuong. Thieu le thi chu cham vien o mot so trinh duyet. */
const HE_SO_LE = 0.16;

async function taiVe(): Promise<Buffer> {
  const res = await fetch(NGUON);
  if (!res.ok) throw new Error(`Không tải được logo gốc: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main(): Promise<void> {
  const goc = await taiVe();
  const { width, height } = await sharp(goc).metadata();
  console.log(`Logo gốc ${width}x${height}`);

  // --- 1. Logo dung trong ung dung ---
  const logo = await sharp(goc)
    .trim({ threshold: 10 })
    .resize({ width: RONG_LOGO, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const thongTinLogo = await sharp(logo).metadata();
  await mkdir(join(process.cwd(), "public"), { recursive: true });
  await writeFile(join(process.cwd(), "public", "logo-hung-phat.png"), logo);
  console.log(
    `public/logo-hung-phat.png  ${thongTinLogo.width}x${thongTinLogo.height}  ` +
    `${(logo.byteLength / 1024).toFixed(0)} KB`,
  );

  // --- 2. Bieu tuong "HP" ghep tu chinh hai chu do ---
  const h = await sharp(goc).extract({ ...CHU_H, ...DONG_CHU }).toBuffer();
  const p = await sharp(goc).extract({ ...CHU_P, ...DONG_CHU }).toBuffer();

  const khe = Math.round(DONG_CHU.height * HE_SO_KHE);
  const rongChu = CHU_H.width + khe + CHU_P.width;
  const canhTrong = Math.max(rongChu, DONG_CHU.height);
  const le = Math.round(canhTrong * HE_SO_LE);
  const canh = canhTrong + le * 2;

  const ghep = await sharp({
    create: {
      width: canh, height: canh, channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: h, left: le + Math.round((canhTrong - rongChu) / 2),
        top: le + Math.round((canhTrong - DONG_CHU.height) / 2) },
      { input: p, left: le + Math.round((canhTrong - rongChu) / 2) + CHU_H.width + khe,
        top: le + Math.round((canhTrong - DONG_CHU.height) / 2) },
    ])
    .resize(CANH_ICON, CANH_ICON)
    .png({ compressionLevel: 9 })
    .toBuffer();

  await writeFile(join(process.cwd(), "src", "app", "icon.png"), ghep);
  console.log(`src/app/icon.png  ${CANH_ICON}x${CANH_ICON}  ${(ghep.byteLength / 1024).toFixed(0)} KB`);

  const ico = dongGoiIco(await sharp(ghep).resize(CANH_ICO, CANH_ICO).png().toBuffer());
  await writeFile(join(process.cwd(), "src", "app", "favicon.ico"), ico);
  console.log(`src/app/favicon.ico  ${CANH_ICO}x${CANH_ICO}  ${(ico.byteLength / 1024).toFixed(0)} KB`);
}

await main();
