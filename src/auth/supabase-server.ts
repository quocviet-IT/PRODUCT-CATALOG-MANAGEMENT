import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";

export async function taoSupabaseServer() {
  const kho = await cookies();
  const env = getEnv();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => kho.getAll(),
      setAll: (ds) => {
        try {
          ds.forEach(({ name, value, options }) => kho.set(name, value, options));
        } catch {
          // Duoc goi tu Server Component — middleware da lam moi phien, bo qua.
        }
      },
    },
  });
}
