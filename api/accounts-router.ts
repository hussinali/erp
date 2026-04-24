import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { accounts } from "@db/schema";
import { eq, like, and } from "drizzle-orm";

export const accountsRouter = createRouter({
  list: authedQuery.query(async () => {
    const db = getDb();
    return db.query.accounts.findMany({
      orderBy: (accounts) => [accounts.code],
    });
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.query.accounts.findFirst({
        where: eq(accounts.id, input.id),
      });
      return result ?? null;
    }),

  create: authedQuery
    .input(
      z.object({
        code: z.string().min(1).max(50),
        name: z.string().min(1).max(255),
        type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
        parentId: z.number().optional(),
        openingBalance: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(accounts).values({
        code: input.code,
        name: input.name,
        type: input.type,
        parentId: input.parentId,
        openingBalance: input.openingBalance ?? "0.00",
        currentBalance: input.openingBalance ?? "0.00",
      });
      return { id: Number((result as unknown as [any])[0].insertId) };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        code: z.string().min(1).max(50).optional(),
        name: z.string().min(1).max(255).optional(),
        type: z.enum(["asset", "liability", "equity", "revenue", "expense"]).optional(),
        parentId: z.number().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(accounts).set(data).where(eq(accounts.id, id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(accounts).where(eq(accounts.id, input.id));
      return { success: true };
    }),

  search: authedQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.accounts.findMany({
        where: and(
          like(accounts.name, `%${input.query}%`),
          eq(accounts.isActive, true),
        ),
        limit: 10,
      });
    }),
});
