import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

/**
 * MOI phien ban ham chi giu MOT ket noi.
 *
 * Truoc day la max: 10 va no da lam sap toan bo khu quan tri tren ban chay that
 * (08/09/2026): pooler cua Supabase o che do session chi co 15 cho, nen chi hai
 * phien ban ham chay cung luc la het — moi trang can doc bang `users` deu tra ve
 * 500 kem "EMAXCONNSESSION: max clients reached in session mode".
 *
 * Ung dung khong chay tren mot may chu dai han ma tren nhieu phien ban ham roi
 * rac; moi phien ban chi phuc vu mot yeu cau mot luc, nen mot ket noi la du.
 * Con so 10 chi co nghia voi mot may chu don xu ly nhieu yeu cau song song.
 *
 * idle_timeout: tra ket noi ve pool sau 20 giay khong dung. Khong dat thi mot
 * phien ban ham da nguoi van om cho cua no cho toi khi Vercel don han no di.
 */
const client = postgres(getEnv().DATABASE_URL, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  // Che do pooler khong ho tro cau lenh chuan bi san.
  prepare: false,
});

export const sql = client;
export const db = drizzle(client, { schema });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
