"use client";

import { useSyncExternalStore } from "react";
import { chonGocLink } from "@/modules/catalogue-share/duong-dan.model";

const khongNghe = () => () => {};

/**
 * Goc cua link gui khach, dung chung cho moi cho hien hoac chep link.
 *
 * Phai tinh o trinh duyet: khi chua khai NEXT_PUBLIC_DIA_CHI_LINK_KHACH, may
 * chu khong biet ten mien that su sale dang mo (hpcatalogue.app, ban xem thu
 * tren Vercel hay localhost). Gia tri khong bao gio doi giua chung nen nguoi
 * nghe la mot ham rong. May chu ve ra chuoi rong.
 */
export function useGocLink(): string {
  return useSyncExternalStore(
    khongNghe,
    // Viet NGUYEN VAN process.env.NEXT_PUBLIC_...: Next chi dan gia tri vao goi
    // trinh duyet khi gap dung chuoi nay, doc qua bien trung gian la ra undefined.
    () => chonGocLink(process.env.NEXT_PUBLIC_DIA_CHI_LINK_KHACH, window.location.origin),
    () => "",
  );
}
