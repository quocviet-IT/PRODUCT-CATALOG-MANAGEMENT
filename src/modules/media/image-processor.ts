import { createHash } from "node:crypto";
import sharp, { type Metadata } from "sharp";

export const BIEN_THE = [
  { ten: "thumb", canhDai: 400 },
  { ten: "medium", canhDai: 1200 },
  { ten: "large", canhDai: 2000 },
] as const;

export type TenBienThe = (typeof BIEN_THE)[number]["ten"];

export type AnhDaXuLy = {
  width: number;
  height: number;
  bytes: number;
  contentHash: string;
  bienThe: Record<TenBienThe, Buffer>;
};

export class LoiAnhKhongHopLe extends Error {
  constructor(chi_tiet: string) {
    super(`Tệp không phải là ảnh hợp lệ: ${chi_tiet}`);
    this.name = "LoiAnhKhongHopLe";
  }
}

/** Ham thuan — thu nho theo canh dai nhat, khong bao gio phong to. */
export function tinhKichThuocMoi(
  w: number, h: number, canhDai: number,
): { width: number; height: number } {
  const lon_nhat = Math.max(w, h);
  if (lon_nhat <= canhDai) return { width: w, height: h };
  const ti_le = canhDai / lon_nhat;
  return { width: Math.round(w * ti_le), height: Math.round(h * ti_le) };
}

export async function xuLyAnh(gocBuffer: Buffer): Promise<AnhDaXuLy> {
  let meta: Metadata;
  try {
    meta = await sharp(gocBuffer).metadata();
  } catch (e) {
    throw new LoiAnhKhongHopLe(e instanceof Error ? e.message : String(e));
  }
  if (!meta.width || !meta.height) {
    throw new LoiAnhKhongHopLe("không đọc được kích thước");
  }

  const bienThe = {} as Record<TenBienThe, Buffer>;
  for (const { ten, canhDai } of BIEN_THE) {
    const kt = tinhKichThuocMoi(meta.width, meta.height, canhDai);
    // Chi truyen MOT chieu rang buoc, de sharp tu suy ra chieu con lai.
    // Truyen ca hai chieu kem fit:"inside" lam sharp lam tron HAI LAN roi lech 1px:
    // hop 2000x1333 co ti le 1.50038 khac ti le that 1.5, nen anh 3000x2000
    // cho ra 1999x1333 thay vi 2000x1333.
    const rangBuoc = meta.width >= meta.height ? { width: kt.width } : { height: kt.height };
    // Khong goi withMetadata() — sharp mac dinh bo toan bo EXIF, dung yeu cau PRD A5.
    bienThe[ten] = await sharp(gocBuffer)
      .rotate()
      .resize({ ...rangBuoc, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  }

  return {
    width: meta.width,
    height: meta.height,
    bytes: gocBuffer.byteLength,
    contentHash: createHash("sha256").update(gocBuffer).digest("hex"),
    bienThe,
  };
}
