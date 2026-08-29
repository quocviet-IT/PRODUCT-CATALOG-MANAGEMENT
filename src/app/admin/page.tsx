import { requireUser } from "@/auth/guard";
import { vi } from "@/messages/vi";

export default async function TrangChuQuanTri() {
  const user = await requireUser();
  return (
    <h1 className="text-xl font-bold">
      {vi.quan_tri.xin_chao}, {user.fullName}
    </h1>
  );
}
