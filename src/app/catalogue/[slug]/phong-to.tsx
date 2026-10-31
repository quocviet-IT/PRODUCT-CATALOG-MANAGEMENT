"use client";

import { useCallback, useState, type ReactNode } from "react";
import { KhungXemAnh } from "@/ui/khung-xem-anh";

/**
 * Boc danh sach mau va cho khach bam vao anh de phong to.
 *
 * Dung uy quyen su kien nhu NganChiTiet ben khu quan tri, va vi cung mot ly do:
 * danh sach anh do server component dung nen khong nhan duoc ham callback. Moi
 * anh chi can mang data-anh="<fileId>".
 *
 * Giu nguyen viec server dung danh sach anh — khong chuyen sang dung o phia
 * trinh duyet — vi hai ly do: khach mo link tren dien thoai thay anh ngay tu
 * lan son dau, va ban IN (nut "Tai PDF") van co day du anh.
 *
 * Phan khung xem (nut qua lai, phim mui ten, quet tay, khoa cuon) nam o
 * KhungXemAnh, dung chung voi man quan tri. Tep nay chi lo viec BIET khach vua
 * bam vao tam nao.
 */
export function PhongToAnh({
  anh,
  children,
}: {
  /** Toan bo anh trong catalogue, dung THU TU tren trang, de bam qua lai. */
  anh: { fileId: string; ten: string }[];
  children: ReactNode;
}) {
  const [viTri, setViTri] = useState<number | null>(null);
  const dong = useCallback(() => setViTri(null), []);

  function batClick(e: React.MouseEvent) {
    const o = (e.target as HTMLElement).closest<HTMLElement>("[data-anh]");
    if (!o?.dataset.anh) return;
    const i = anh.findIndex((a) => a.fileId === o.dataset.anh);
    if (i >= 0) setViTri(i);
  }

  return (
    <>
      <div onClick={batClick}>{children}</div>

      {viTri !== null && (
        <KhungXemAnh anh={anh} viTri={viTri} datViTri={setViTri} dong={dong} />
      )}
    </>
  );
}
