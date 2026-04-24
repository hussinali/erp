import { relations } from "drizzle-orm";
import {
  accounts,
  customers,
  suppliers,
  products,
  invoices,
  invoiceItems,
  journalEntries,
  journalEntryItems,
  receipts,
  payments,
} from "./schema";

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  parent: one(accounts, {
    fields: [accounts.parentId],
    references: [accounts.id],
  }),
  children: many(accounts),
  journalEntryItems: many(journalEntryItems),
  receipts: many(receipts),
  payments: many(payments),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
  receipts: many(receipts),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  payments: many(payments),
}));

export const productsRelations = relations(products, ({ many }) => ({
  invoiceItems: many(invoiceItems),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  product: one(products, {
    fields: [invoiceItems.productId],
    references: [products.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ many }) => ({
  items: many(journalEntryItems),
}));

export const journalEntryItemsRelations = relations(journalEntryItems, ({ one }) => ({
  journalEntry: one(journalEntries, {
    fields: [journalEntryItems.journalEntryId],
    references: [journalEntries.id],
  }),
  account: one(accounts, {
    fields: [journalEntryItems.accountId],
    references: [accounts.id],
  }),
}));

export const receiptsRelations = relations(receipts, ({ one }) => ({
  customer: one(customers, {
    fields: [receipts.customerId],
    references: [customers.id],
  }),
  account: one(accounts, {
    fields: [receipts.accountId],
    references: [accounts.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [payments.supplierId],
    references: [suppliers.id],
  }),
  account: one(accounts, {
    fields: [payments.accountId],
    references: [accounts.id],
  }),
}));
