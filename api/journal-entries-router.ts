import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { journalEntries, journalEntryItems, accounts } from "@db/schema";
import { eq } from "drizzle-orm";

export const journalEntriesRouter = createRouter({
  list: authedQuery.query(async () => {
    const db = getDb();
    return db.query.journalEntries.findMany({
      orderBy: (entries, { desc }) => [desc(entries.date)],
    });
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.query.journalEntries.findFirst({
        where: eq(journalEntries.id, input.id),
        with: {
          items: {
            with: { account: true },
          },
        },
      });
      return result ?? null;
    }),

  create: authedQuery
    .input(
      z.object({
        entryNumber: z.string().min(1).max(100),
        date: z.string(),
        reference: z.string().optional(),
        description: z.string().optional(),
        items: z.array(
          z.object({
            accountId: z.number(),
            debit: z.string().optional(),
            credit: z.string().optional(),
            description: z.string().optional(),
          }),
        ).min(2),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { items, ...entryData } = input;

      const totalDebit = items.reduce((sum, item) => sum + parseFloat(item.debit ?? "0"), 0);
      const totalCredit = items.reduce((sum, item) => sum + parseFloat(item.credit ?? "0"), 0);

      const result = await db.insert(journalEntries).values({
        entryNumber: entryData.entryNumber,
        date: new Date(entryData.date),
        reference: entryData.reference,
        description: entryData.description,
        totalDebit: totalDebit.toFixed(2),
        totalCredit: totalCredit.toFixed(2),
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.001,
      });
      const entryId = Number((result as unknown as [any])[0].insertId);

      await db.insert(journalEntryItems).values(
        items.map((item) => ({
          journalEntryId: entryId,
          accountId: item.accountId,
          debit: item.debit ?? "0.00",
          credit: item.credit ?? "0.00",
          description: item.description,
        })),
      );

      // Update account balances
      for (const item of items) {
        const account = await db.query.accounts.findFirst({
          where: eq(accounts.id, item.accountId),
        });
        if (account) {
          const debit = parseFloat(item.debit ?? "0");
          const credit = parseFloat(item.credit ?? "0");
          let newBalance = parseFloat(account.currentBalance);
          if (account.type === "asset" || account.type === "expense") {
            newBalance += debit - credit;
          } else {
            newBalance += credit - debit;
          }
          await db
            .update(accounts)
            .set({ currentBalance: newBalance.toFixed(2) })
            .where(eq(accounts.id, item.accountId));
        }
      }

      return { id: entryId };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(journalEntryItems).where(eq(journalEntryItems.journalEntryId, input.id));
      await db.delete(journalEntries).where(eq(journalEntries.id, input.id));
      return { success: true };
    }),
});
