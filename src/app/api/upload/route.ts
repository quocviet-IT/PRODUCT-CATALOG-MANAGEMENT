import { NextResponse } from "next/server";
import { requireUser } from "@/auth/guard";
import {
  napNhieuTep, kiemTraTep, TOI_DA_TEP, type KetQuaMotTep,
} from "@/modules/media/upload.service";

export const maxDuration = 300;

export async function POST(req: Request): Promise<NextResponse> {
  const user = await requireUser();
  const form = await req.formData();
  const tepList = form.getAll("tep").filter((t): t is File => t instanceof File);

  if (tepList.length === 0) {
    return NextResponse.json({ loi: "Chưa chọn tệp nào." }, { status: 400 });
  }
  if (tepList.length > TOI_DA_TEP) {
    return NextResponse.json(
      { loi: `Tối đa ${TOI_DA_TEP} ảnh mỗi lần. Bạn đã chọn ${tepList.length}.` },
      { status: 400 },
    );
  }

  // Kiem tra kich thuoc TRUOC khi doc vao bo nho, va doc TUAN TU.
  // Promise.all + arrayBuffer() se vat hoa toan bo lo cung luc: 200 tep x 20 MB
  // la khoang 4 GB nam trong RAM, va tep qua co chi bi tu choi SAU khi da doc xong.
  const ds: { ten: string; noiDung: Buffer }[] = [];
  const loiSom: KetQuaMotTep[] = [];
  for (const t of tepList) {
    const so_bo = kiemTraTep(t.name, t.size);
    if (!so_bo.hopLe) {
      loiSom.push({ tenTep: t.name, trangThai: "loi", thongBao: so_bo.thongBao });
      continue;
    }
    ds.push({ ten: t.name, noiDung: Buffer.from(await t.arrayBuffer()) });
  }

  const ketQua = [...loiSom, ...(await napNhieuTep(ds, user.id))];
  return NextResponse.json({ ketQua });
}
