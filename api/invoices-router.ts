import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { invoices, invoiceItems } from "@db/schema";
import { eq, sql } from "drizzle-orm";

export const invoicesRouter = createRouter({
  list: authedQuery.query(async () => {
    const db = getDb();
    return db.query.invoices.findMany({
      with: { customer: true },
      orderBy: (invoices) => [sql`${invoices.createdAt} DESC`],
    });
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
        with: { customer: true, items: { with: { product: true } } },
      });
      return result ?? null;
    }),

  create: authedQuery
    .input(
      z.object({
        invoiceNumber: z.string().min(1).max(100),
        customerId: z.number(),
        date: z.string(),
        dueDate: z.string().optional(),
        subtotal: z.string().optional(),
        taxAmount: z.string().optional(),
        total: z.string().optional(),
        status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
        notes: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.number().optional(),
            description: z.string().min(1),
            quantity: z.number().min(1),
            unitPrice: z.string(),
            taxRate: z.string().optional(),
            taxAmount: z.string().optional(),
            total: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { items, ...invoiceData } = input;
      const result = await db.insert(invoices).values({
        invoiceNumber: invoiceData.invoiceNumber,
        customerId: invoiceData.customerId,
        date: new Date(invoiceData.date),
        dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined,
        status: invoiceData.status ?? "draft",
        subtotal: invoiceData.subtotal ?? "0.00",
        taxAmount: invoiceData.taxAmount ?? "0.00",
        total: invoiceData.total ?? "0.00",
        notes: invoiceData.notes,
      });
      const invoiceId = Number((result as unknown as [any])[0].insertId);

      if (items && items.length > 0) {
        await db.insert(invoiceItems).values(
          items.map((item) => ({
            invoiceId,
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate ?? "0.00",
            taxAmount: item.taxAmount ?? "0.00",
            total: item.total,
          })),
        );
      }
      return { id: invoiceId };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        invoiceNumber: z.string().min(1).max(100).optional(),
        customerId: z.number().optional(),
        date: z.string().optional(),
        dueDate: z.string().optional(),
        subtotal: z.string().optional(),
        taxAmount: z.string().optional(),
        total: z.string().optional(),
        paidAmount: z.string().optional(),
        status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.date) updateData.date = new Date(data.date);
      if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
      await db.update(invoices).set(updateData).where(eq(invoices.id, id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, input.id));
      await db.delete(invoices).where(eq(invoices.id, input.id));
      return { success: true };
    }),
});
