import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { accountsRouter } from "./accounts-router";
import { customersRouter } from "./customers-router";
import { suppliersRouter } from "./suppliers-router";
import { productsRouter } from "./products-router";
import { invoicesRouter } from "./invoices-router";
import { journalEntriesRouter } from "./journal-entries-router";
import { receiptsRouter } from "./receipts-router";
import { paymentsRouter } from "./payments-router";
import { reportsRouter } from "./reports-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  accounts: accountsRouter,
  customers: customersRouter,
  suppliers: suppliersRouter,
  products: productsRouter,
  invoices: invoicesRouter,
  journalEntries: journalEntriesRouter,
  receipts: receiptsRouter,
  payments: paymentsRouter,
  reports: reportsRouter,
});

export type AppRouter = typeof appRouter;
