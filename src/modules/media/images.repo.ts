import { eq } from "drizzle-orm";
import { db, type Tx } from "@/db/client";
import { productImages } from "@/db/schema";

type Handle = Tx | typeof db;
const h = (tx?: Tx): Handle => tx ?? db;

export async function timTheoMaBam(contentHash: string, tx?: Tx) {
  const [r] = await h(tx).select().from(productImages)
    .where(eq(productImages.contentHash, contentHash)).limit(1);
  return r ?? null;
}

export async function chen(gt: typeof productImages.$inferInsert, tx?: Tx) {
  const [r] = await h(tx).insert(productImages).values(gt).returning();
  return r;
}

export async function layTheoSanPham(productId: string, tx?: Tx) {
  return h(tx).select().from(productImages).where(eq(productImages.productId, productId));
}
