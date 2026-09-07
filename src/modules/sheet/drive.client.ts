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
