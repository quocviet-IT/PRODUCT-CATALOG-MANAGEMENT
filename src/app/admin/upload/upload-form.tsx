"use client";

import { useState } from "react";
import type { KetQuaMotTep } from "@/modules/media/upload.service";
import { vi } from "@/messages/vi";

export function FormTaiAnh() {
  const [dangChay, datDangChay] = useState(false);
  const [ketQua, datKetQua] = useState<KetQuaMotTep[] | null>(null);
  const [loi, datLoi] = useState<string | null>(null);

  async function gui(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    datDangChay(true);
    datLoi(null);
    datKetQua(null);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: new FormData(e.currentTarget) });
      const data = await res.json();
      if (!res.ok) datLoi(data.loi ?? vi.tai_anh.that_bai);
      else datKetQua(data.ketQua as KetQuaMotTep[]);
    } catch {
      datLoi(vi.tai_anh.khong_ket_noi);
    } finally {
      datDangChay(false);
    }
  }

  const dem = (t: KetQuaMotTep["trangThai"]) => ketQua?.filter((r) => r.trangThai === t).length ?? 0;

  return (
    <div className="max-w-2xl">
      <form onSubmit={gui} className="flex flex-col gap-4">
        <input type="file" name="tep" multiple required
               accept=".jpg,.jpeg,.png,.webp,.heic"
               className="rounded border p-3 text-sm" />
        <button type="submit" disabled={dangChay}
                className="w-fit rounded bg-teal-800 px-4 py-2 text-sm text-white disabled:opacity-50">
          {dangChay ? vi.tai_anh.dang_tai_len : vi.tai_anh.nut_tai_len}
        </button>
      </form>

      {loi && <p role="alert" className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-800">{loi}</p>}

      {ketQua && (
        <div className="mt-6">
          <p className="mb-3 text-sm">
            {vi.tai_anh.thanh_cong} <b>{dem("thanh_cong")}</b> · {vi.tai_anh.trung} <b>{dem("trung")}</b> ·{" "}
            {vi.tai_anh.loi} <b>{dem("loi")}</b>
          </p>
          <ul className="divide-y rounded border text-sm">
            {ketQua.map((r) => (
              <li key={r.tenTep} className="flex items-start justify-between gap-4 px-3 py-2">
                <span className="truncate">{r.tenTep}</span>
                <span className="shrink-0 text-neutral-600">
                  {r.trangThai === "thanh_cong" && vi.tai_anh.da_nap}
                  {r.trangThai === "trung" && vi.tai_anh.da_co_trong_kho}
                  {r.trangThai === "loi" && r.thongBao}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
