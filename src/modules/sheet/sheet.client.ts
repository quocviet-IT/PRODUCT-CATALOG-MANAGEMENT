import { layAccessToken } from "./google-auth";
import type { OTho } from "./catalogue.mapper";

// values.get chi tra chu da dinh dang, khong thay cong thuc IMAGE lan hyperlink.
// spreadsheets.get kem field mask nay lay du moi tang trong MOT lan goi.
//
// chipRuns la bat buoc: lien ket cua "chip" Drive (chen bang @ hoac keo tep tu
// Drive vao o) KHONG nam trong hyperlink. Cot FOLDER HINH dung ca hai kieu, bo
// chipRuns ra thi nhung dong dung chip mat thu vien anh ma khong bao loi gi.
const FIELD_MASK =
  "sheets.data.rowData.values(formattedValue,userEnteredValue,hyperlink,chipRuns)";

/**
 * Boc ten tab theo cu phap pham vi A1: dat trong dau nhay don, moi dau nhay
 * don co san trong ten phai nhan doi. Ten tab la cau hinh (CATALOGUE_SHEET_TAB)
 * nen co the mang dau cach, dau hai cham... (vi du "Online Cataloge") — thieu
 * buoc boc nay thi Google khong parse duoc pham vi va tra ve loi 400.
 * encodeURIComponent chi ma hoa ky tu, khong tu them dau nhay.
 */
function boPhamViA1(tab: string): string {
  return `'${tab.replace(/'/g, "''")}'`;
}

export async function docBangTho(sheetId: string, tab: string): Promise<OTho[][]> {
  const token = await layAccessToken();
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}` +
    `?ranges=${encodeURIComponent(boPhamViA1(tab))}&includeGridData=true&fields=${encodeURIComponent(FIELD_MASK)}`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Không đọc được bảng tính (${res.status}): ${await res.text()}`);
  }
  const body = (await res.json()) as {
    sheets?: { data?: { rowData?: { values?: OTho[] }[] }[] }[];
  };
  const rowData = body.sheets?.[0]?.data?.[0]?.rowData ?? [];
  return rowData.map((h) => h.values ?? []);
}
