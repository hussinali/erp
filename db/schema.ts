import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  bigint,
  int,
  date,
  boolean,
} from "drizzle-orm/mysql-core";

// ========== Users (Auth) ==========
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ========== Chart of Accounts ==========
export const accounts = mysqlTable("accounts", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", [
    "asset",
    "liability",
    "equity",
    "revenue",
    "expense",
  ]).notNull(),
  parentId: bigint("parentId", { mode: "number", unsigned: true }),
  openingBalance: decimal("openingBalance", { precision: 18, scale: 2 }).default("0.00").notNull(),
  currentBalance: decimal("currentBalance", { precision: 18, scale: 2 }).default("0.00").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

// ========== Customers ==========
export const customers = mysqlTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  taxNumber: varchar("taxNumber", { length: 100 }),
  balance: decimal("balance", { precision: 18, scale: 2 }).default("0.00").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ========== Suppliers ==========
export const suppliers = mysqlTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  taxNumber: varchar("taxNumber", { length: 100 }),
  balance: decimal("balance", { precision: 18, scale: 2 }).default("0.00").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

// ========== Products ==========
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  unit: varchar("unit", { length: 50 }).default("piece").notNull(),
  purchasePrice: decimal("purchasePrice", { precision: 18, scale: 2 }).default("0.00").notNull(),
  salePrice: decimal("salePrice", { precision: 18, scale: 2 }).default("0.00").notNull(),
  quantity: int("quantity").default(0).notNull(),
  minQuantity: int("minQuantity").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ========== Invoices (Sales) ==========
export const invoices = mysqlTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }).notNull().unique(),
  customerId: bigint("customerId", { mode: "number", unsigned: true }).notNull(),
  date: date("date").notNull(),
  dueDate: date("dueDate"),
  subtotal: decimal("subtotal", { precision: 18, scale: 2 }).default("0.00").notNull(),
  taxAmount: decimal("taxAmount", { precision: 18, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 18, scale: 2 }).default("0.00").notNull(),
  paidAmount: decimal("paidAmount", { precision: 18, scale: 2 }).default("0.00").notNull(),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"])
    .default("draft")
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ========== Invoice Items ==========
export const invoiceItems = mysqlTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: bigint("invoiceId", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("productId", { mode: "number", unsigned: true }),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 18, scale: 2 }).default("0.00").notNull(),
  taxRate: decimal("taxRate", { precision: 5, scale: 2 }).default("0.00").notNull(),
  taxAmount: decimal("taxAmount", { precision: 18, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 18, scale: 2 }).default("0.00").notNull(),
});

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

// ========== Journal Entries ==========
export const journalEntries = mysqlTable("journal_entries", {
  id: serial("id").primaryKey(),
  entryNumber: varchar("entryNumber", { length: 100 }).notNull().unique(),
  date: date("date").notNull(),
  reference: varchar("reference", { length: 255 }),
  description: text("description"),
  totalDebit: decimal("totalDebit", { precision: 18, scale: 2 }).default("0.00").notNull(),
  totalCredit: decimal("totalCredit", { precision: 18, scale: 2 }).default("0.00").notNull(),
  isBalanced: boolean("isBalanced").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

// ========== Journal Entry Items ==========
export const journalEntryItems = mysqlTable("journal_entry_items", {
  id: serial("id").primaryKey(),
  journalEntryId: bigint("journalEntryId", { mode: "number", unsigned: true }).notNull(),
  accountId: bigint("accountId", { mode: "number", unsigned: true }).notNull(),
  debit: decimal("debit", { precision: 18, scale: 2 }).default("0.00").notNull(),
  credit: decimal("credit", { precision: 18, scale: 2 }).default("0.00").notNull(),
  description: text("description"),
});

export type JournalEntryItem = typeof journalEntryItems.$inferSelect;
export type InsertJournalEntryItem = typeof journalEntryItems.$inferInsert;

// ========== Receipts (سندات القبض) ==========
export const receipts = mysqlTable("receipts", {
  id: serial("id").primaryKey(),
  receiptNumber: varchar("receiptNumber", { length: 100 }).notNull().unique(),
  customerId: bigint("customerId", { mode: "number", unsigned: true }),
  date: date("date").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).default("0.00").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "bank_transfer", "check", "credit_card", "other"])
    .default("cash")
    .notNull(),
  reference: varchar("reference", { length: 255 }),
  accountId: bigint("accountId", { mode: "number", unsigned: true }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = typeof receipts.$inferInsert;

// ========== Payments (سندات الصرف) ==========
export const payments = mysqlTable("payments", {
  id: serial("id").primaryKey(),
  paymentNumber: varchar("paymentNumber", { length: 100 }).notNull().unique(),
  supplierId: bigint("supplierId", { mode: "number", unsigned: true }),
  date: date("date").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).default("0.00").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "bank_transfer", "check", "credit_card", "other"])
    .default("cash")
    .notNull(),
  reference: varchar("reference", { length: 255 }),
  accountId: bigint("accountId", { mode: "number", unsigned: true }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
