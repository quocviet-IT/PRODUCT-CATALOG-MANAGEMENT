import { JWT } from "google-auth-library";
import { getEnv } from "@/lib/env";

// Chi can quyen doc. Drive.readonly du de tai file trong Shared Drive
// ma service account duoc moi vao voi vai tro Nguoi xem.
const PHAM_VI = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
];

/**
 * GOOGLE_SERVICE_ACCOUNT_EMAIL/KEY la tuy chon o muc getEnv() (xem src/lib/env.ts)
 * de thieu chung khong lam sap ca ung dung. Module nay la noi DUY NHAT thuc
 * su can chung, nen tu kiem tra va nem loi co ten rieng — trang catalogue-sheet
 * bat loi nay va hien thong bao an toan, cac trang khac khong bi anh huong.
 */
export class LoiThieuCauHinhGoogle extends Error {
  constructor() {
    super("Thiếu cấu hình service account Google (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_KEY).");
    this.name = "LoiThieuCauHinhGoogle";
  }
}

let phien: JWT | null = null;

function layPhien(): JWT {
  if (phien !== null) return phien;
  const env = getEnv();
  if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    throw new LoiThieuCauHinhGoogle();
  }
  phien = new JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // Khoa luu tren mot dong trong .env; phai tra lai ky tu xuong dong that,
    // khong thi thu vien khong parse duoc PEM.
    key: env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, "\n"),
    scopes: PHAM_VI,
  });
  return phien;
}

export async function layAccessToken(): Promise<string> {
  const { token } = await layPhien().getAccessToken();
  if (!token) throw new Error("Không lấy được access token của service account.");
  return token;
}
