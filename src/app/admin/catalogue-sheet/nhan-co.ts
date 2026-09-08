import type { CoBatThuong } from "@/modules/sheet/catalogue.mapper";
import type { BoChu } from "@/messages";

/**
 * Nhan cua cac co canh bao chat luong du lieu.
 *
 * Ba man hinh cung hien nhung co nay: bang, the trong luoi, va khung chi tiet.
 * Truoc day moi noi giu mot ban sao — them mot loai co la phai nho sua ca ba,
 * va quen mot cho thi no hien ra ma khong co chu.
 *
 * La HAM chu khong phai hang so vi ngon ngu doi theo tung yeu cau, con hang so
 * o pham vi module chi tinh mot lan luc nap tep.
 */
export function nhanCo(t: BoChu): Record<CoBatThuong, string> {
  return {
    "thieu-sku": t.catalogue_sheet.co_thieu_sku,
    "thieu-anh": t.catalogue_sheet.co_thieu_anh,
    "thieu-mo-ta": t.catalogue_sheet.co_thieu_mo_ta,
    "trung": t.catalogue_sheet.co_trung,
    "tl-vang-lech": t.catalogue_sheet.co_tl_vang_lech,
  };
}
