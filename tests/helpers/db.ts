import { db } from "@/db/client";
import type { Tx } from "@/db/client";

/** Chay ham trong mot giao dich roi huy — test khong de lai du lieu rac. */
export async function withRollback<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const HUY = Symbol("huy-giao-dich");
  try {
    return await db.transaction(async (tx) => {
      const kq = await fn(tx);
      throw Object.assign(new Error("rollback"), { [HUY]: true, kq });
    });
  } catch (e) {
    if (e && typeof e === "object" && (e as Record<symbol, unknown>)[HUY]) {
      return (e as { kq: T }).kq;
    }
    throw e;
  }
}
