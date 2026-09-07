import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url({ message: "DATABASE_URL phai la mot URL hop le" }),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default("catalogue"),
  // Ba bien Google la TUY CHON o day: mot tinh nang catalogue chua ai dung
  // toi khong duoc phep khien ca ung dung (vi du /login) khong khoi dong noi
  // chi vi thieu cau hinh cua no. google-auth.ts va catalogue.service.ts tu
  // nem loi rieng khi thuc su can toi ma khong co.
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().min(1).optional(),
  GOOGLE_SERVICE_ACCOUNT_KEY: z.string().min(1).optional(),
  CATALOGUE_SHEET_ID: z.string().min(1).optional(),
  // KHONG dat gia tri mac dinh: mac dinh "test" tung khien mot ban trien khai
  // quen khai bao bien nay doc nham tab that su ten "test" ma khong bao loi
  // gi ca — sai du lieu trong im lang con nguy hiem hon la bao loi ro rang.
  CATALOGUE_SHEET_TAB: z.string().min(1),
});

export type Env = z.infer<typeof schema>;

/** Ham thuan — dung cho test va cho getEnv. */
export function parseEnv(raw: Record<string, string | undefined>): Env {
  const ket_qua = schema.safeParse(raw);
  if (!ket_qua.success) {
    const chi_tiet = ket_qua.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Cau hinh moi truong khong hop le — ${chi_tiet}`);
  }
  return ket_qua.data;
}

let da_doc: Env | null = null;

/** Doc bien moi truong mot lan roi nho ket qua. */
export function getEnv(): Env {
  if (da_doc === null) da_doc = parseEnv(process.env);
  return da_doc;
}
