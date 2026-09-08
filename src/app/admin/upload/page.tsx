import { requireUser } from "@/auth/guard";
import { FormTaiAnh } from "./upload-form";
import { layChu } from "@/messages/may-chu";

export default async function TrangTaiAnh() {
  await requireUser();
  const t = await layChu();
  return (
    <>
      <h1 className="mb-2 text-xl font-bold">{t.dieu_huong.tai_anh}</h1>
      <p className="mb-6 text-sm text-neutral-600">
        {t.tai_anh.mo_ta}
      </p>
      <FormTaiAnh />
    </>
  );
}
