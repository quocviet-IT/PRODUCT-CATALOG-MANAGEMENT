"use client";

import { tenVaiTro, type VaiTro } from "@/modules/nguoi-dung/nguoi-dung.model";
import { useNgonNgu } from "@/messages/dung-chu";

/**
 * O chon vai tro. Dung o CA hai cho — form cap tai khoan va bang tai khoan —
 * nen danh sach vai tro nhan qua prop chu khong tu doc: hai ban sao cua cung
 * mot danh sach la hai ban sao se lech nhau.
 *
 * Ten vai tro la du lieu nen khong nam trong tep messages; `tenVaiTro` chon
 * ban tieng Viet hay tieng Anh theo ngon ngu dang xem.
 */
export function ChonVaiTro({
  vaiTros,
  giaTri,
  macDinh,
  onChange,
  lop,
  id,
  ten = "vai_tro",
  nhanAria,
}: {
  vaiTros: readonly VaiTro[];
  /** Co dieu khien. Bo trong thi dung `macDinh`. */
  giaTri?: string;
  macDinh?: string;
  onChange?: (ma: string) => void;
  lop?: string;
  id?: string;
  ten?: string;
  nhanAria?: string;
}) {
  const nn = useNgonNgu();
  const dieuKhien = giaTri !== undefined;

  return (
    <select
      id={id}
      name={ten}
      aria-label={nhanAria}
      className={lop}
      {...(dieuKhien
        ? { value: giaTri, onChange: (e) => onChange?.(e.target.value) }
        : { defaultValue: macDinh })}
    >
      {vaiTros.map((v) => (
        <option key={v.ma} value={v.ma}>
          {tenVaiTro(v, nn === "en")}
        </option>
      ))}
    </select>
  );
}
