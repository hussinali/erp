import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { accounts, invoices, receipts, payments } from "@db/schema";
import { count } from "drizzle-orm";

export const reportsRouter = createRouter({
  dashboard: authedQuery.query(async () => {
    const db = getDb();

    const allAccounts = await db.select().from(accounts);
    const allInvoices = await db.select().from(invoices);
    const allReceipts = await db.select().from(receipts);
    const allPayments = await db.select().from(payments);

    const totalAssets = allAccounts
      .filter((a) => a.type === "asset")
      .reduce((sum, a) => sum + parseFloat(a.currentBalance), 0);
    const totalLiabilities = allAccounts
      .filter((a) => a.type === "liability")
      .reduce((sum, a) => sum + parseFloat(a.currentBalance), 0);
    const totalEquity = allAccounts
      .filter((a) => a.type === "equity")
      .reduce((sum, a) => sum + parseFloat(a.currentBalance), 0);
    const totalRevenue = allAccounts
      .filter((a) => a.type === "revenue")
      .reduce((sum, a) => sum + parseFloat(a.currentBalance), 0);
    const totalExpenses = allAccounts
      .filter((a) => a.type === "expense")
      .reduce((sum, a) => sum + parseFloat(a.currentBalance), 0);

    const totalSales = allInvoices
      .filter((i) => i.status !== "cancelled")
      .reduce((sum, i) => sum + parseFloat(i.total), 0);
    const totalPaid = allInvoices
      .filter((i) => i.status !== "cancelled")
      .reduce((sum, i) => sum + parseFloat(i.paidAmount), 0);
    const totalReceiptsAmount = allReceipts.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const totalPaymentsAmount = allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return {
      totalAssets: totalAssets.toFixed(2),
      totalLiabilities: totalLiabilities.toFixed(2),
      totalEquity: totalEquity.toFixed(2),
      netIncome: (totalRevenue - totalExpenses).toFixed(2),
      totalSales: totalSales.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      totalReceipts: totalReceiptsAmount.toFixed(2),
      totalPayments: totalPaymentsAmount.toFixed(2),
      outstanding: (totalSales - totalPaid).toFixed(2),
      accountCount: allAccounts.length,
      invoiceCount: allInvoices.length,
      customerCount: (await db.select({ count: count() }).from(invoices))[0].count,
    };
  }),

  trialBalance: authedQuery.query(async () => {
    const db = getDb();
    const allAccounts = await db.select().from(accounts);
    const items = await db.select().from(await import("@db/schema").then(m => m.journalEntryItems));

    const accountTotals = allAccounts.map((account) => {
      const accountItems = items.filter((i) => i.accountId === account.id);
      const totalDebit = accountItems.reduce((sum, i) => sum + parseFloat(i.debit), 0);
      const totalCredit = accountItems.reduce((sum, i) => sum + parseFloat(i.credit), 0);
      return {
        ...account,
        totalDebit: totalDebit.toFixed(2),
        totalCredit: totalCredit.toFixed(2),
        balance:
          account.type === "asset" || account.type === "expense"
            ? (totalDebit - totalCredit).toFixed(2)
            : (totalCredit - totalDebit).toFixed(2),
      };
    });

    const grandTotalDebit = items.reduce((sum, i) => sum + parseFloat(i.debit), 0);
    const grandTotalCredit = items.reduce((sum, i) => sum + parseFloat(i.credit), 0);

    return {
      items: accountTotals,
      totalDebit: grandTotalDebit.toFixed(2),
      totalCredit: grandTotalCredit.toFixed(2),
    };
  }),

  incomeStatement: authedQuery.query(async () => {
    const db = getDb();
    const allAccounts = await db.select().from(accounts);

    const revenueAccounts = allAccounts.filter((a) => a.type === "revenue");
    const expenseAccounts = allAccounts.filter((a) => a.type === "expense");

    const totalRevenue = revenueAccounts.reduce((sum, a) => sum + parseFloat(a.currentBalance), 0);
    const totalExpenses = expenseAccounts.reduce((sum, a) => sum + parseFloat(a.currentBalance), 0);

    return {
      revenues: revenueAccounts.map((a) => ({ ...a, balance: parseFloat(a.currentBalance) })),
      expenses: expenseAccounts.map((a) => ({ ...a, balance: parseFloat(a.currentBalance) })),
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
    };
  }),

  balanceSheet: authedQuery.query(async () => {
    const db = getDb();
    const allAccounts = await db.select().from(accounts);

    const assets = allAccounts.filter((a) => a.type === "asset");
    const liabilities = allAccounts.filter((a) => a.type === "liability");
    const equity = allAccounts.filter((a) => a.type === "equity");

    const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.currentBalance), 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + parseFloat(a.currentBalance), 0);
    const totalEquity = equity.reduce((sum, a) => sum + parseFloat(a.currentBalance), 0);

    return {
      assets: assets.map((a) => ({ ...a, balance: parseFloat(a.currentBalance) })),
      liabilities: liabilities.map((a) => ({ ...a, balance: parseFloat(a.currentBalance) })),
      equity: equity.map((a) => ({ ...a, balance: parseFloat(a.currentBalance) })),
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    };
  }),
});
