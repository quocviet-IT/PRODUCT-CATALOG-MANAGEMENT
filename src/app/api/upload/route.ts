import { NextResponse } from "next/server";
import { requireUser } from "@/auth/guard";
import { napNhieuTep, TOI_DA_TEP } from "@/modules/media/upload.service";

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

  const ds = await Promise.all(
    tepList.map(async (t) => ({ ten: t.name, noiDung: Buffer.from(await t.arrayBuffer()) })),
  );

  return NextResponse.json({ ketQua: await napNhieuTep(ds, user.id) });
}
