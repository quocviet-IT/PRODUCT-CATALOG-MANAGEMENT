import { requireUser } from "@/auth/guard";
import { FormTaiAnh } from "./upload-form";
import { vi } from "@/messages/vi";

export default async function TrangTaiAnh() {
  await requireUser();
  return (
    <>
      <h1 className="mb-2 text-xl font-bold">{vi.dieu_huong.tai_anh}</h1>
      <p className="mb-6 text-sm text-neutral-600">
        {vi.tai_anh.mo_ta}
      </p>
      <FormTaiAnh />
    </>
  );
}
