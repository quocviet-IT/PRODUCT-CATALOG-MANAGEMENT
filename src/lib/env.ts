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
  // Email mot NGUOI THAT trong ctyhp.vn de service account mao danh.
  // Vi sao can: anh san pham duoc chia se kieu "ai trong to chuc co link deu
  // xem duoc" (domain/reader). Service account co email rieng ngoai ten mien
  // nen KHONG nam trong dien do — khong mao danh thi no khong thay 58/65 thu
  // muc, du da co khoa hop le. De trong thi chay khong mao danh.
  GOOGLE_IMPERSONATE_EMAIL: z.string().email().optional(),

  // --- Ai duoc dang nhap (xem src/auth/quyen-dang-nhap.ts) ---
  // Tien to ten mien cong ty. Moi duoi deu vao duoc: ctyhp.vn, ctyhp.com,
  // ctyhp.us... De trong thi dung mac dinh "ctyhp".
  AUTH_TIEN_TO_MIEN: z.string().min(1).optional(),
  // Khai bien nay thi CHI nhung ten mien liet ke o day moi vao duoc, va
  // AUTH_TIEN_TO_MIEN bi bo qua. Dung khi muon that chat. Ngan bang dau phay.
  AUTH_TEN_MIEN: z.string().optional(),
  // Email cu the duoc phep du nam ngoai ten mien. Ngan bang dau phay.
  AUTH_EMAIL_NGOAI_LE: z.string().optional(),
  // KHONG dat gia tri mac dinh: mac dinh "test" tung khien mot ban trien khai
  // quen khai bao bien nay doc nham tab that su ten "test" ma khong bao loi
  // gi ca — sai du lieu trong im lang con nguy hiem hon la bao loi ro rang.
  CATALOGUE_SHEET_TAB: z.string().min(1),
  // Duong dan toi tep JSON chua bang tho, dung THAY cho Google khi chua co
  // service account. De trong thi doc that tu Google. Chi dung de xem thu.
  CATALOGUE_TEP_MAU: z.string().min(1).optional(),
  // Tep JSON anh xa idThuMuc -> danh sach anh, dung THAY cho Drive khi xem thu.
  CATALOGUE_TEP_ANH_MAU: z.string().min(1).optional(),
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
