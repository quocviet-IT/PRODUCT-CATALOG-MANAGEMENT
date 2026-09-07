import { layAccessToken } from "./google-auth";
import type { OTho } from "./catalogue.mapper";

// values.get chi tra chu da dinh dang, khong thay cong thuc IMAGE lan hyperlink.
// spreadsheets.get kem field mask nay lay du ca ba tang trong MOT lan goi.
const FIELD_MASK = "sheets.data.rowData.values(formattedValue,userEnteredValue,hyperlink)";

export async function docBangTho(sheetId: string, tab: string): Promise<OTho[][]> {
  const token = await layAccessToken();
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}` +
    `?ranges=${encodeURIComponent(tab)}&includeGridData=true&fields=${encodeURIComponent(FIELD_MASK)}`;

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
