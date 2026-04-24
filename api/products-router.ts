import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products } from "@db/schema";
import { eq, like, and } from "drizzle-orm";

export const productsRouter = createRouter({
  list: authedQuery.query(async () => {
    const db = getDb();
    return db.query.products.findMany({
      orderBy: (products) => [products.name],
    });
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.query.products.findFirst({
        where: eq(products.id, input.id),
      });
      return result ?? null;
    }),

  create: authedQuery
    .input(
      z.object({
        code: z.string().min(1).max(100),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        unit: z.string().optional(),
        purchasePrice: z.string().optional(),
        salePrice: z.string().optional(),
        quantity: z.number().optional(),
        minQuantity: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(products).values({
        code: input.code,
        name: input.name,
        description: input.description,
        unit: input.unit,
        purchasePrice: input.purchasePrice ?? "0.00",
        salePrice: input.salePrice ?? "0.00",
        quantity: input.quantity ?? 0,
        minQuantity: input.minQuantity ?? 0,
      });
      return { id: Number((result as unknown as [any])[0].insertId) };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        code: z.string().min(1).max(100).optional(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        unit: z.string().optional(),
        purchasePrice: z.string().optional(),
        salePrice: z.string().optional(),
        quantity: z.number().optional(),
        minQuantity: z.number().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(products).set(data).where(eq(products.id, id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  search: authedQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.products.findMany({
        where: and(
          like(products.name, `%${input.query}%`),
          eq(products.isActive, true),
        ),
        limit: 10,
      });
    }),
});
