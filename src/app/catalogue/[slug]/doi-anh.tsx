"use client";

import { type ReactNode } from "react";

/**
 * Bam vao mot anh nho thi no DOI CHO voi anh lon cua mau do.
 *
 * Vi sao doi cho chu khong phai "chon": neu anh lon chi doi theo o duoc chon thi tam anh
 * dang chon hien HAI lan tren man hinh (mot lon mot nho). Doi cho thi khong tam nao lap,
 * va bam lan nua vao dung o do la ve nhu cu.
 *
 * Uy quyen su kien va sua thang tren DOM — cung cach va cung ly do voi PhongToAnh: danh
 * sach anh do server component dung nen khong nhan duoc ham callback, va phai giu nguyen
 * viec server dung san day du anh (khach mo tren dien thoai thay anh ngay lan son dau, ban
 * IN co du anh). React khong bao gio ve lai nhung nut nay — chung la `children` tu server —
 * nen viec sua thang thuoc tinh o day khong bi ghi de.
 *
 * KHONG chan su kien: bam anh nho thi no vua mo to ra vua nhay len o lon (16/09/2026, sau
 * khi anh bao "khach mo link, bam to anh khong duoc"). Ban dau lop nay chan su kien lai nen
 * anh nho mat kha nang phong to — muon xem to phai bam hai lan. Bam vao anh la muon XEM TO,
 * doi cho chi la cai duoc them.
 *
 * Vi the o trang khach lop nay boc NGOAI PhongToAnh: div cua PhongToAnh nam trong nen chay
 * TRUOC, doc duoc ma anh GOC roi mo dung tam vua bam; sau do lop nay moi doi cho. Dao thu tu
 * long nhau la khung phong to mo nham tam anh cu cua o lon.
 * Man hinh Xem truoc khong co PhongToAnh nen o do chi doi cho, khong mo to — dung nhu truoc.
 */
export function DoiAnhLon({ children }: { children: ReactNode }) {
  function bat(e: React.MouseEvent) {
    const o = (e.target as HTMLElement).closest<HTMLElement>("[data-anh]");
    if (!o || o.hasAttribute("data-anh-chinh")) return;

    const lon = oLonCungMau(o);
    if (!lon) return;

    doiCho(o, lon);
  }

  return <div onClick={bat}>{children}</div>;
}

/**
 * O lon cua CUNG MAU voi `o`.
 *
 * Di nguoc len tung cap cha va dung o cap dau tien co chua mot o lon — do chinh la the
 * cua mau. Khong dung closest("li") vi anh nho thuong nam trong <li> rieng cua no, long
 * ben trong <li> cua mau. Dung lai o goc ul[data-bo-cuc] de khong voi sang mau khac.
 */
function oLonCungMau(o: HTMLElement): HTMLElement | null {
  const goc = o.closest("[data-bo-cuc]");
  if (!goc) return null;
  // Dung lai TRUOC goc: den goc thi querySelector se vo phai o lon cua mau khac.
  for (let cha = o.parentElement; cha && cha !== goc; cha = cha.parentElement) {
    const lon = cha.querySelector<HTMLElement>("[data-anh-chinh]");
    if (lon) return lon;
  }
  return null;
}

function doiCho(o: HTMLElement, lon: HTMLElement): void {
  const anhO = o.querySelector("img");
  const anhLon = lon.querySelector("img");
  const idO = o.dataset.anh;
  const idLon = lon.dataset.anh;
  if (!anhO || !anhLon || !idO || !idLon || idO === idLon) return;

  o.dataset.anh = idLon;
  lon.dataset.anh = idO;

  const tenO = o.getAttribute("title");
  const tenLon = lon.getAttribute("title");
  datHoacBo(o, "title", tenLon);
  datHoacBo(lon, "title", tenO);

  datNguon(anhO, idLon);
  datNguon(anhLon, idO);
}

function datHoacBo(e: HTMLElement, ten: string, gt: string | null): void {
  if (gt === null) e.removeAttribute(ten);
  else e.setAttribute(ten, gt);
}

/**
 * Doi ma anh trong duong dan `/api/anh-drive/<ma>?w=<rong>`, GIU NGUYEN `?w=`: o lon van
 * lay ban rong, o nho van lay ban nho. Trong lúc ban moi chua ve toi thi lam mo anh di —
 * khong co dau hieu nay thi anh cu dung y nguyen vai giay, khach tuong bam khong an.
 */
function datNguon(a: HTMLImageElement, ma: string): void {
  const u = new URL(a.getAttribute("src") ?? "", window.location.href);
  u.pathname = u.pathname.replace(/[^/]+$/, encodeURIComponent(ma));

  a.style.opacity = "0.45";
  const xong = () => {
    a.style.opacity = "";
  };
  a.addEventListener("load", xong, { once: true });
  a.addEventListener("error", xong, { once: true });
  a.src = u.pathname + u.search;
}
