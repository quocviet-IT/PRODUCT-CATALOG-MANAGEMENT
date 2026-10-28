/**
 * Thu muc nao can Apps Script liet ke (lai), va gop ket qua vao ban do.
 * Ham THUAN — test duoc.
 *
 * Truoc 11/09/2026 moi thu muc chi duoc liet ke MOT lan: co mat trong ban do la
 * "da xong" vinh vien. He qua: them hay bot anh BEN TRONG mot thu muc "Hinh da
 * xu ly" da co thi web khong bao gio thay — trong khi doi anh dang xu ly anh va
 * bo sung vao thu muc cu la chuyen hang ngay, va khong ai biet la thieu.
 *
 * Nay thu muc da liet ke qua HAN_LIET_KE_LAI_MS thi duoc liet ke lai. Moc thoi
 * gian nam o tep rieng (dong-bo/thu-muc-luc.json) de ban do anh giu nguyen hinh
 * dang — moi cho dang doc ban do khong phai sua.
 */

/** 30 phut. Voi 12 thu muc, moi vong liet ke lai mat khoang 15 giay. */
export const HAN_LIET_KE_LAI_MS = 30 * 60_000;

/**
 * Thu muc can liet ke: MOI (chua co trong ban do) truoc, roi CU (liet ke qua han)
 * — cu nhat truoc.
 *
 * Chi xet thu muc bang DANG tro toi (canCo). Thu muc con sot trong ban do ma
 * bang khong con dung toi thi khong bao gio liet ke lai — do la cong viec vut di.
 */
export function thuMucCanLietKe(
  canCo: readonly string[],
  daCo: Readonly<Record<string, unknown>>,
  lucLietKe: Readonly<Record<string, string>>,
  bayGio: number,
  hanMs: number = HAN_LIET_KE_LAI_MS,
): { moi: string[]; cu: string[] } {
  const moi: string[] = [];
  const cu: { id: string; luc: number }[] = [];
  const daXet = new Set<string>();

  for (const id of canCo) {
    if (daXet.has(id)) continue;
    daXet.add(id);
    if (!Object.prototype.hasOwnProperty.call(daCo, id)) {
      moi.push(id);
      continue;
    }
    // Khong co moc (liet ke tu truoc khi co tep moc) hay moc hong: coi nhu cu
    // nhat. Ban do vua chuyen sang co moc thi moi thu muc duoc lam moi mot luot.
    const doc = Date.parse(lucLietKe[id] ?? "");
    const luc = Number.isFinite(doc) ? doc : Number.NEGATIVE_INFINITY;
    if (bayGio - luc >= hanMs) cu.push({ id, luc });
  }

  cu.sort((a, b) => (a.luc === b.luc ? 0 : a.luc < b.luc ? -1 : 1));
  return { moi, cu: cu.map((x) => x.id) };
}

/**
 * Toi da bao nhieu thu muc CU (qua han) dua cho MOT luot Apps Script — 10 phut
 * mot luot.
 *
 * Liet ke lai ton gio chay Apps Script, ma han muc trigger 6 GIO/NGAY DUNG CHUNG
 * cho ca ba job: can no thi dongBoBang (moi phut) cung dung theo, het ngay.
 * DriveApp mat ~0,55 giay mot thu muc; bang tung tro toi 1.476 thu muc, liet ke
 * lai het moi 30 phut la ~10,8 gio chay moi ngay.
 *
 * Chan 30: toi da ~17 giay moi luot, ~40 phut moi ngay, bang lon co nao cung
 * vay. Doi lai, bang lon thi vong lam moi dai ra (300 thu muc: ~100 phut) thay
 * vi lam sap dong bo. Thu muc MOI khong bi chan: moi cai chi liet ke mot lan, va
 * la thu nguoi dung dang cho thay.
 */
export const SO_LIET_KE_LAI_MOI_LUOT = 30;

/** Danh sach cho mot luot: het thu muc MOI, roi toi da `toiDaCu` thu muc CU (cu nhat truoc). */
export function luotLietKe(
  { moi, cu }: { moi: readonly string[]; cu: readonly string[] },
  toiDaCu: number = SO_LIET_KE_LAI_MOI_LUOT,
): string[] {
  return [...moi, ...cu.slice(0, toiDaCu)];
}

/**
 * Gop mot lo vua liet ke vao ban do.
 *
 * MANG RONG KHONG DUOC XOA DANH SACH DANG CO. Apps Script gui [] ca khi thu muc
 * rong THAT lan khi no KHONG MO DUOC thu muc (loi Drive tam thoi, mat quyen) —
 * tu phia may chu khong phan biet duoc hai truong hop. Khi moi thu muc chi liet
 * ke mot lan thi khong sao; khi liet ke LAI moi 30 phut, mot lan Drive truc trac
 * se xoa sach thu vien anh cua mau dang nam tren catalogue.
 *
 * Nen: thu muc dang co anh ma nhan [] thi GIU NGUYEN (giuLai), va noi goi KHONG
 * duoc cap moc thoi gian cho no — luot sau se thu lai. Thu muc chua co, hoac dang
 * rong, thi nhan [] binh thuong: co mat trong ban do la thu ngan hoi lai mai.
 *
 * Khong sua dau vao.
 */
export function tronBanDo(
  cu: Readonly<Record<string, readonly unknown[]>>,
  them: Readonly<Record<string, readonly unknown[]>>,
): { banDo: Record<string, unknown[]>; daGhi: string[]; giuLai: string[] } {
  const banDo = { ...cu } as Record<string, unknown[]>;
  const daGhi: string[] = [];
  const giuLai: string[] = [];

  for (const [id, ds] of Object.entries(them)) {
    if (ds.length === 0 && (cu[id]?.length ?? 0) > 0) {
      giuLai.push(id);
      continue;
    }
    banDo[id] = [...ds];
    daGhi.push(id);
  }
  return { banDo, daGhi, giuLai };
}

/**
 * Bao nhieu luot LIEN TIEP mot thu muc bi giu lai duoc thu lai NGAY, truoc khi
 * phai lui ve nhip 30 phut nhu moi thu muc khac.
 *
 * Hai, khong phai mot: mot truc trac Drive thoang qua van duoc thu lai ngay o
 * luot sau — do la y cua chot giuLai. Ba thi qua nhieu: moi luot giu lai la mot
 * suat trong 30 suat cua luot do.
 */
export const SO_LAN_THU_LAI_NGAY = 2;

/**
 * Thu muc nao duoc cap moc thoi gian sau mot lan gop, va so lan hong moi.
 * Ham THUAN — test duoc.
 *
 * VI SAO PHAI CO HAM NAY. Ban dau thu muc bi giu lai (nhan mang rong trong khi
 * dang co anh) KHONG duoc cap moc, de luot sau thu lai ngay. Nhung "khong co
 * moc" dong nghia voi "mai mai qua han", ma hang doi lai xep CU NHAT TRUOC —
 * nen thu muc do dung dau hang doi o MOI luot chay, va 174 thu muc con lai
 * khong bao gio toi luot. Do dung la cai kep da dong bang G10322, G10323,
 * G10302, G10303, G10305, G10306 tu 07/10 toi 28/10/2026: hai tam anh nguoi
 * dung xoa khoi Drive van nam nguyen tren web suot 21 ngay.
 *
 * Nay: thu lai ngay toi SO_LAN_THU_LAI_NGAY luot, sau do van cap moc — thu muc
 * chet that cung chi ton mot suat moi vong, khong chan ai.
 *
 * So dem hong duoc giu lai (khong xoa khi cap moc) de man quan tri noi duoc
 * "thu muc nay hong N luot roi" thay vi im lang.
 */
export function mocSauKhiGop(
  daGhi: readonly string[],
  giuLai: readonly string[],
  hongTruoc: Readonly<Record<string, number>>,
): { capMoc: string[]; hong: Record<string, number> } {
  const hong = { ...hongTruoc };
  const capMoc = [...daGhi];

  for (const id of daGhi) delete hong[id];
  for (const id of giuLai) {
    const lan = (hongTruoc[id] ?? 0) + 1;
    hong[id] = lan;
    if (lan > SO_LAN_THU_LAI_NGAY) capMoc.push(id);
  }

  return { capMoc, hong };
}
