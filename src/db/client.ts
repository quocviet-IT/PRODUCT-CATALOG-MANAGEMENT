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
/**
 * LUOI AN TOAN — khong co cai nao o day de "cho nhanh hon". Chung ton tai de
 * mot ket noi hong khong the treo mai.
 *
 * Ngay 10/09/2026 khu quan tri sap vi tren may chu con lai nhung phien Postgres
 * ket cung o trang thai `active / Client:ClientRead` — Postgres da tra ket qua
 * xong va dang doi ban ham gui tiep, nhung ban ham thi Vercel da dong bang.
 * Phien do ket chin phut khong ai don. Moi phien ket lam treo TOAN BO mot ban
 * ham: no giu mat ket noi duy nhat (max: 1), nen moi yeu cau roi vao ban do deu
 * dung im — ke ca trang cong khai chang lien quan gi.
 *
 * Khong co gi tu cuu duoc luc do: `statement_timeout` mac dinh cua Supabase
 * (120s) KHONG dem trong luc doi client, `idle_session_timeout` = 0, con
 * `tcp_keepalives_idle` thi tan 30 phut moi dong toi.
 */
const client = postgres(getEnv().DATABASE_URL, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  // Che do pooler khong ho tro cau lenh chuan bi san.
  prepare: false,

  /**
   * Thu hoi ket noi sau 5 phut du no van tot.
   *
   * Mot ket noi song mai la mot ket noi co the hong mai. Mo lai ton khoang
   * 400ms va chi xay ra khi ket noi ranh, doi lay chan tren cho moi hong hoc
   * ngam o tang giao thuc.
   */
  max_lifetime: 60 * 5,
});

/**
 * DA THU VA KHONG DUNG DUOC — ghi lai de nguoi sau khoi thu lai.
 *
 * Cach hien nhien de chan phien ket la dat gioi han thoi gian phia may chu:
 * `statement_timeout`, `idle_in_transaction_session_timeout`, va nhat la
 * `tcp_keepalives_idle` (mac dinh 1800 giay — chinh vi the mot ban ham dong
 * bang moi keo dai duoc 30 phut).
 *
 * Truyen chung qua tuy chon `connection` cua postgres.js thi KHONG co tac dung:
 * Supavisor loai bo cac tham so khoi dong. Da do lai tren ban that — sau khi
 * truyen, phien van bao statement_timeout = 120000ms va tcp_keepalives_idle =
 * 1800s y nhu cu.
 *
 * Chay bang lenh `SET` thi co tac dung va giu duoc suot phien, nhung postgres.js
 * khong mo ra moc nao chay duoc lenh do moi khi mo ket noi (`onopen` la ham noi
 * bo cua thu vien). Dat o cap vai tro trong Supabase thi anh huong ca migration
 * — nhung viec chay lau that su — nen khong lam.
 *
 * Vi vay lop bao ve THAT nam o hai cho khac: `max_lifetime` o tren, va viec
 * giu cho chi co MOT truy van chay mot luc tren moi yeu cau (xem chu thich
 * trong auth/guard.ts va app/admin/nguoi-dung/page.tsx).
 */

export const sql = client;
export const db = drizzle(client, { schema });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
