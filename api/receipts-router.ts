import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { receipts, accounts, customers } from "@db/schema";
import { eq } from "drizzle-orm";

export const receiptsRouter = createRouter({
  list: authedQuery.query(async () => {
    const db = getDb();
    return db.query.receipts.findMany({
      with: { customer: true, account: true },
      orderBy: (receipts, { desc }) => [desc(receipts.date)],
    });
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.query.receipts.findFirst({
        where: eq(receipts.id, input.id),
        with: { customer: true, account: true },
      });
      return result ?? null;
    }),

  create: authedQuery
    .input(
      z.object({
        receiptNumber: z.string().min(1).max(100),
        customerId: z.number().optional(),
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
      const result = await db.insert(receipts).values({
        receiptNumber: input.receiptNumber,
        customerId: input.customerId,
        date: new Date(input.date),
        amount: input.amount,
        paymentMethod: input.paymentMethod ?? "cash",
        reference: input.reference,
        accountId: input.accountId,
        notes: input.notes,
      });
      const receiptId = Number((result as unknown as [any])[0].insertId);

      // Update customer balance
      if (input.customerId) {
        const customer = await db.query.customers.findFirst({
          where: eq(customers.id, input.customerId),
        });
        if (customer) {
          const newBalance = parseFloat(customer.balance) - parseFloat(input.amount);
          await db
            .update(customers)
            .set({ balance: newBalance.toFixed(2) })
            .where(eq(customers.id, input.customerId));
        }
      }

      // Update account balance
      const account = await db.query.accounts.findFirst({
        where: eq(accounts.id, input.accountId),
      });
      if (account) {
        const newBalance = parseFloat(account.currentBalance) + parseFloat(input.amount);
        await db
          .update(accounts)
          .set({ currentBalance: newBalance.toFixed(2) })
          .where(eq(accounts.id, input.accountId));
      }

      return { id: receiptId };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(receipts).where(eq(receipts.id, input.id));
      return { success: true };
    }),
});
