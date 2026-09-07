import { layAccessToken } from "./google-auth";

export async function taiTepDrive(fileId: string): Promise<Buffer> {
  const token = await layAccessToken();
  const url =
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}` +
    `?alt=media&supportsAllDrives=true`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Không tải được tệp ${fileId} (${res.status}): ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export type AnhTrongThuMuc = { fileId: string; ten: string };

/**
 * Liet ke anh trong mot thu muc Drive. Dung cho trang chi tiet: cot HINH cua
 * bang tinh chi co MOT anh, con toan bo anh cua mau nam trong thu muc ma cot
 * FOLDER HINH tro toi.
 *
 * supportsAllDrives + includeItemsFromAllDrives la bat buoc: thu muc nam trong
 * Shared Drive, thieu hai co nay thi API tra ve danh sach RONG kem HTTP 200 —
 * hong am tham, khong bao loi.
 */
export async function lietKeAnhTrongThuMuc(idThuMuc: string): Promise<AnhTrongThuMuc[]> {
  const token = await layAccessToken();
  const q = `'${idThuMuc}' in parents and trashed = false and mimeType contains 'image/'`;
  const url =
    "https://www.googleapis.com/drive/v3/files" +
    `?q=${encodeURIComponent(q)}` +
    "&supportsAllDrives=true&includeItemsFromAllDrives=true" +
    "&pageSize=200&orderBy=name" +
    `&fields=${encodeURIComponent("files(id,name)")}`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Không liệt kê được thư mục ${idThuMuc} (${res.status}): ${await res.text()}`);
  }
  const body = (await res.json()) as { files?: { id: string; name: string }[] };
  return (body.files ?? []).map((f) => ({ fileId: f.id, ten: f.name }));
}
