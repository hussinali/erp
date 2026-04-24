import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { customers } from "@db/schema";
import { eq, like, and } from "drizzle-orm";

export const customersRouter = createRouter({
  list: authedQuery.query(async () => {
    const db = getDb();
    return db.query.customers.findMany({
      orderBy: (customers) => [customers.name],
    });
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.query.customers.findFirst({
        where: eq(customers.id, input.id),
      });
      return result ?? null;
    }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        taxNumber: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(customers).values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        address: input.address,
        taxNumber: input.taxNumber,
      });
      return { id: Number((result as unknown as [any])[0].insertId) };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        taxNumber: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(customers).set(data).where(eq(customers.id, id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(customers).where(eq(customers.id, input.id));
      return { success: true };
    }),

  search: authedQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.customers.findMany({
        where: and(
          like(customers.name, `%${input.query}%`),
          eq(customers.isActive, true),
        ),
        limit: 10,
      });
    }),
});
