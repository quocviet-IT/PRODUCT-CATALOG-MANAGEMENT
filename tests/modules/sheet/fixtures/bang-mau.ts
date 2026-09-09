import type { OTho } from "@/modules/sheet/catalogue.mapper";

const o = (v: string): OTho => ({ formattedValue: v });
const rong: OTho = {};
const anh = (id: string): OTho => ({
  userEnteredValue: { formulaValue: `=IMAGE("https://lh3.google.com/u/0/d/${id}")` },
});
const lien = (v: string, url: string): OTho => ({ formattedValue: v, hyperlink: url });

const THU_MUC = "https://drive.google.com/drive/folders/1On2rBPpBzpLsU7xTyvg0H8v7MM12foE8";
/** Thu muc anh DA XU LY — cot moi, luc chuyen chi vai mau co. */
const THU_MUC_XU_LY = "https://drive.google.com/drive/folders/1QqXuLy0000000000000000000000";

/**
 * Dong 1 la bang tieu de gop o. Dong 2 la tieu de cot.
 * O tieu de "TL VANG" trong bang that CO ky tu xuong dong — giu nguyen o day,
 * vi chinh no la thu lam moi phep so khop truc tiep bi truot.
 */
export const bangMau: OTho[][] = [
  [rong, o("ONLINE CATALOGUE")],
  [
    o("SKU"), o("SO"), o("MO"), o("Chi tiết SP"), o("MÃ MẪU"), o("LOẠI"),
    o("DÒNG"), o("CHẤT LIỆU"), o("TL VÀNG\n (gr)"), o("SIZE"), o("Ổ chủ"),
    o("HÌNH"), o("FOLDER HÌNH"), o("Hình đã xử lý"),
  ],
  // 3 — day du, size nam o cot SIZE, xoan lab
  [o("108632"), o("25.10006"), o("25.34648"),
   o("LGDRI: 14KY 7RD/0.326cts 2.85gr D12741 Size: 10"), o("D12741"), o("Complete"),
   o("NHẪN"), o("14KY"), o("2.78"), o("10"), rong,
   anh("18I_Y9I_tLtnizSbupQclY48QBxG3I3XB"), lien("CQ1", THU_MUC)],
  // 4 — cot SIZE trong, size chi co trong mo ta, xoan tu nhien
  [o("204779"), o("25.10271"), o("25.35019"),
   o("DIARI: 18KW 11RD/0.398cts 4.07gr D11031 Size: 18VN"), o("D11031"), o("Complete"),
   o("NHẪN"), o("18KW"), o("3.99"), rong, rong,
   anh("1aXAYbzgcH8J_4GkS_3gkUAvjQA6mR5be"), lien("CQ1", THU_MUC),
   // Dong DUY NHAT co ca hai cot thu muc — de kiem thu tu uu tien.
   lien("CQ1-xu-ly", THU_MUC_XU_LY)],
  // 5 — MAT ANH (o HINH rong)
  [o("108930"), o("25.10272"), o("25.35020"),
   o("DIARI: 18KW 11RD/0.400cts 4.00gr D11032 Size: 6"), o("D11032"), o("Complete"),
   o("NHẪN"), o("18KW"), o("3.92"), rong, rong, rong, lien("CQ1", THU_MUC)],
  // 6 — THIEU SKU
  [rong, o("26.10455"), o("26.35607"),
   o("DIARI: 18KY 20RD/0.150cts 3.71gr D11039 Size: 7"), o("D11039"), o("Complete"),
   o("NHẪN"), o("18KY"), o("3.68"), rong, rong,
   anh("1lEQM2d-xJ6YxmFCOforzUnl8RgqoyRaM"), lien("CQ1", THU_MUC)],
  // 7 — THIEU MO TA (va thieu SKU)
  [rong, o("26.10456"), o("26.35608"), rong, o("D11040"), o("Complete"),
   o("NHẪN"), o("18KY"), o("3.68"), rong, rong,
   anh("1CNLZ0aCG3_OJM9kWIittylsQvV3zapPP"), lien("CQ1", THU_MUC)],
  // 8 — TL VANG LECH: 2.41 - 0.2*0.234 = 2.3632, bang ghi 2.41 (quen tru da)
  [o("109177"), o("26.10307"), o("26.35171"),
   o("LGDRI: 18KY 15RD/0.234cts 2.41gr D12800 Size: 5"), o("D12800"), o("Complete"),
   o("NHẪN"), o("18KY"), o("2.41"), rong, rong,
   anh("1a-y9LfglXbLQGfH9ybafsMjzv4-O1mWC"), lien("CQ1", THU_MUC)],
  // 9 va 10 — TRUNG KHIT nhau theo cap (MA MAU, MO).
  // Dung 0.500cts chu khong phai 0.525: voi 0.525 thi 3.68-0.105=3.575 va bien do
  // lech la 0.00499999999999989 — nam duoi nguong 0.005 CHI NHO SAI SO DAU PHAY DONG.
  // Mot fixture nhu vay bien test thanh tro choi may rui. 0.500 cho bien do bang 0.
  [rong, o("26.10393"), o("26.35535"),
   o("LGDRI: PT900PD 6BG/0.500cts 3.68gr D12751-01 Size: 6"), o("D12751-01"), o("Complete"),
   o("NHẪN"), o("PT900PD"), o("3.58"), rong, rong,
   anh("1hDzs73oviksvqJsp9UBIbIVwylZoL9F_"), lien("CQ1", THU_MUC)],
  [rong, o("26.10393"), o("26.35535"),
   o("LGDRI: PT900PD 6BG/0.500cts 3.68gr D12751-01 Size: 6"), o("D12751-01"), o("Complete"),
   o("NHẪN"), o("PT900PD"), o("3.58"), rong, rong,
   anh("1hDzs73oviksvqJsp9UBIbIVwylZoL9F_"), lien("CQ1", THU_MUC)],
  // 11 — NHIEU cum cts trong mot mo ta: 5.18 - 0.2*(0.116+0.441) = 5.0686
  [o("109800"), o("25.10258"), o("26.35145"),
   o("LGDRI: 18KY 4RD/0.116cts+6MQ/0.441cts 5.18gr B12741 Size: 7"), o("B12741"),
   o("Complete"), o("NHẪN"), o("18KY"), o("5.07"), rong, rong,
   anh("1QAIP8HdAFiZMHczOQ7G-dD9ACQJfdqIv"), lien("CQ1", THU_MUC)],
  // 12 va 13 — DONG RONG NHUNG CON DINH DANG: includeGridData=true tra ca
  // dong da to mau/ke vien nhung chua go du lieu gi. Khong co sku/maMau/mo/
  // chiTiet/fileIdAnh — phai bi anhXaBang bo qua, khong duoc bien thanh the.
  [rong, rong, rong, rong, rong, rong, rong, rong, rong, rong, rong, rong, rong],
  [rong, rong, rong, rong, rong, rong, rong, rong, rong, rong, rong, rong, rong],
];
