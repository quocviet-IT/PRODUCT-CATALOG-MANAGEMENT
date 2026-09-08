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

/**
 * Ban thumbnail xin cua Drive. 1600px du de thu nho xuong 1400 (ban lon nhat
 * man hinh dung) ma khong bi mem; xin to hon chi ton bang thong.
 */
const RONG_THUMBNAIL = 1600;

type ThongTinAnh = { taiDuocGoc: boolean; thumbnailLink: string | null };

async function docThongTinAnh(fileId: string, token: string): Promise<ThongTinAnh> {
  const url =
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}` +
    "?supportsAllDrives=true" +
    `&fields=${encodeURIComponent("thumbnailLink,capabilities(canDownload)")}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Không đọc được thông tin tệp ${fileId} (${res.status}): ${await res.text()}`);
  }
  const body = (await res.json()) as {
    thumbnailLink?: string;
    capabilities?: { canDownload?: boolean };
  };
  return {
    taiDuocGoc: body.capabilities?.canDownload === true,
    thumbnailLink: body.thumbnailLink ?? null,
  };
}

/**
 * Lay BYTES cua mot anh Drive, tu chon duong di theo quyen that su co.
 *
 * Vi sao khong goi thang alt=media: hai Shared Drive chua anh san pham dat
 * downloadRestriction.restrictedForReaders. Co do chan alt=media doi voi tai
 * khoan chi co vai tro Nguoi xem — service account se nhan 403 tren TUNG anh,
 * trong khi bang tinh va danh sach thu muc van doc binh thuong. Ket qua la
 * moi thu chay tru anh, mot kieu hong rat de doc nham thanh loi khac.
 *
 * Nhung co do KHONG chan thumbnailLink. Nen: hoi Drive xem tai khoan co tai
 * duoc ban goc khong; co thi lay ban goc (net nhat), khong thi lay thumbnail.
 * Nho vay he thong chay dung ca khi service account chi duoc cap quyen Nguoi
 * xem — muc quyen thap nhat, va la muc de xin nhat.
 */
export async function taiAnhDrive(fileId: string): Promise<Buffer> {
  const token = await layAccessToken();
  const tt = await docThongTinAnh(fileId, token);

  if (tt.taiDuocGoc) return taiTepDrive(fileId);

  if (!tt.thumbnailLink) {
    throw new Error(
      `Không tải được ảnh ${fileId}: tài khoản không được tải bản gốc và Drive cũng không cấp thumbnail.`,
    );
  }
  // thumbnailLink co san hau to kich thuoc (vi du "=s220") — thay bang co minh
  // can. Link nay tai duoc ma khong can gui token.
  const url = tt.thumbnailLink.replace(/=[^=]*$/, `=w${RONG_THUMBNAIL}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Không tải được thumbnail của ${fileId} (${res.status}).`);
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
