import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { payments, accounts, suppliers } from "@db/schema";
import { eq } from "drizzle-orm";

export const paymentsRouter = createRouter({
  list: authedQuery.query(async () => {
    const db = getDb();
    return db.query.payments.findMany({
      with: { supplier: true, account: true },
      orderBy: (payments, { desc }) => [desc(payments.date)],
    });
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.query.payments.findFirst({
        where: eq(payments.id, input.id),
        with: { supplier: true, account: true },
      });
      return result ?? null;
    }),

  create: authedQuery
    .input(
      z.object({
        paymentNumber: z.string().min(1).max(100),
        supplierId: z.number().optional(),
        date: z.string(),
        amount: z.string(),
        paymentMethod: z.enum(["cash", "bank_transfer", "check", "credit_card", "other"]).optional(),
        reference: z.string().optional(),
        accountId: z.number(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(payments).values({
        paymentNumber: input.paymentNumber,
        supplierId: input.supplierId,
        date: new Date(input.date),
        amount: input.amount,
        paymentMethod: input.paymentMethod ?? "cash",
        reference: input.reference,
        accountId: input.accountId,
        notes: input.notes,
      });
      const paymentId = Number((result as unknown as [any])[0].insertId);

      // Update supplier balance
      if (input.supplierId) {
        const supplier = await db.query.suppliers.findFirst({
          where: eq(suppliers.id, input.supplierId),
        });
        if (supplier) {
          const newBalance = parseFloat(supplier.balance) - parseFloat(input.amount);
          await db
            .update(suppliers)
            .set({ balance: newBalance.toFixed(2) })
            .where(eq(suppliers.id, input.supplierId));
        }
      }

      // Update account balance
      const account = await db.query.accounts.findFirst({
        where: eq(accounts.id, input.accountId),
      });
      if (account) {
        const newBalance = parseFloat(account.currentBalance) - parseFloat(input.amount);
        await db
          .update(accounts)
          .set({ currentBalance: newBalance.toFixed(2) })
          .where(eq(accounts.id, input.accountId));
      }

      return { id: paymentId };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(payments).where(eq(payments.id, input.id));
      return { success: true };
    }),
});
