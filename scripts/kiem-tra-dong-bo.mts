/**
 * Kiem tra hai thao tac Storage MOI cua duong dong bo, tren ha tang THAT:
 *   - ghi/doc/xoa duoc mot doi tuong duoi tien to dong-bo/
 *   - lietKeTen() lat het duoc thu muc bo dem anh
 *
 * Khong dung du lieu that: chi ghi mot tep kiem tra roi xoa ngay.
 * Chay: npx tsx scripts/kiem-tra-dong-bo.mts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const { ghiTep, taiVe, xoaTep, lietKeTen } = await import("@/modules/media/storage");
const { THU_MUC_DEM_ANH } = await import("@/modules/media/khoa-anh");

const khoa = `dong-bo/_kiem-tra-${Date.now()}.json`;
try {
  await ghiTep(khoa, Buffer.from(JSON.stringify({ ok: true }), "utf8"), "application/json");
  const lai = JSON.parse((await taiVe(khoa)).toString("utf8"));
  console.log(`GHI/DOC dong-bo/: ${lai.ok === true ? "OK" : "SAI"}`);
} finally {
  await xoaTep([khoa]);
}

const ten = await lietKeTen(THU_MUC_DEM_ANH);
console.log(`LIET KE ${THU_MUC_DEM_ANH}/: OK — ${ten.size} tep dang co trong bo dem`);
