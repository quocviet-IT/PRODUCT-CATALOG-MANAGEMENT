import { getSessionUser } from "@/auth/guard";
import { layUrlAnhSheet } from "@/modules/media/anh-drive";

// fileId den tu duong dan URL nen khong tin duoc. Chan truoc khi dung no
// de dung khoa Storage hay goi Drive.
const DANG_FILE_ID = /^[A-Za-z0-9_-]{10,80}$/;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ fileId: string }> },
): Promise<Response> {
  const user = await getSessionUser();
  if (user === null || !user.isActive) {
    return new Response(null, { status: 401 });
  }

  const { fileId } = await params;
  if (!DANG_FILE_ID.test(fileId)) {
    return new Response(null, { status: 400 });
  }

  try {
    const url = await layUrlAnhSheet(fileId);
    return new Response(null, { status: 302, headers: { Location: url } });
  } catch {
    // Mot anh hong khong duoc lam hong ca luoi.
    return new Response(null, { status: 502 });
  }
}
