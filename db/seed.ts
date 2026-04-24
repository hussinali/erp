import { getDb } from "../api/queries/connection";
import { accounts, customers, suppliers, products } from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed Chart of Accounts
  await db.insert(accounts).values([
    { code: "1000", name: "الأصول", type: "asset", currentBalance: "0.00" },
    { code: "1100", name: "النقدية", type: "asset", currentBalance: "0.00" },
    { code: "1110", name: "الصندوق", type: "asset", currentBalance: "0.00" },
    { code: "1120", name: "البنك", type: "asset", currentBalance: "0.00" },
    { code: "1200", name: "العملاء", type: "asset", currentBalance: "0.00" },
    { code: "1300", name: "المخزون", type: "asset", currentBalance: "0.00" },
    { code: "2000", name: "الخصوم", type: "liability", currentBalance: "0.00" },
    { code: "2100", name: "الموردون", type: "liability", currentBalance: "0.00" },
    { code: "2200", name: "القروض", type: "liability", currentBalance: "0.00" },
    { code: "3000", name: "حقوق الملكية", type: "equity", currentBalance: "0.00" },
    { code: "3100", name: "رأس المال", type: "equity", currentBalance: "0.00" },
    { code: "3200", name: "الأرباح المحتجزة", type: "equity", currentBalance: "0.00" },
    { code: "4000", name: "الإيرادات", type: "revenue", currentBalance: "0.00" },
    { code: "4100", name: "مبيعات", type: "revenue", currentBalance: "0.00" },
    { code: "5000", name: "المصروفات", type: "expense", currentBalance: "0.00" },
    { code: "5100", name: "مصروفات تشغيلية", type: "expense", currentBalance: "0.00" },
    { code: "5200", name: "الرواتب", type: "expense", currentBalance: "0.00" },
    { code: "5300", name: "الإيجار", type: "expense", currentBalance: "0.00" },
  ]);

  // Seed Customers
  await db.insert(customers).values([
    { name: "أحمد محمد", email: "ahmed@test.com", phone: "0500000001", balance: "0.00" },
    { name: "شركة التقنية", email: "tech@company.com", phone: "0500000002", balance: "0.00" },
    { name: "محمد علي", email: "mohammed@test.com", phone: "0500000003", balance: "0.00" },
    { name: "سالم سعيد", email: "salem@test.com", phone: "0500000004", balance: "0.00" },
  ]);

  // Seed Suppliers
  await db.insert(suppliers).values([
    { name: "مؤسسة التوريدات", email: "supply@supplier.com", phone: "0500000010", balance: "0.00" },
    { name: "شركة الاستيراد", email: "import@supplier.com", phone: "0500000011", balance: "0.00" },
    { name: "مصنع المحليات", email: "local@factory.com", phone: "0500000012", balance: "0.00" },
  ]);

  // Seed Products
  await db.insert(products).values([
    { code: "PRD001", name: "لابتوب احترافي", description: "لابتوب للأعمال", unit: "قطعة", purchasePrice: "3500.00", salePrice: "4500.00", quantity: 20, minQuantity: 5 },
    { code: "PRD002", name: "شاشة 27 بوصة", description: "شاشة عالية الدقة", unit: "قطعة", purchasePrice: "800.00", salePrice: "1200.00", quantity: 15, minQuantity: 3 },
    { code: "PRD003", name: "كيبورد ميكانيكي", description: "كيبورد ألعاب", unit: "قطعة", purchasePrice: "150.00", salePrice: "250.00", quantity: 50, minQuantity: 10 },
    { code: "PRD004", name: "ماوس لاسلكي", description: "ماوس بلوتوث", unit: "قطعة", purchasePrice: "80.00", salePrice: "150.00", quantity: 40, minQuantity: 8 },
    { code: "PRD005", name: "سماعات رأس", description: "سماعات احترافية", unit: "قطعة", purchasePrice: "200.00", salePrice: "350.00", quantity: 25, minQuantity: 5 },
  ]);

  console.log("Done.");
  process.exit(0);
}

seed();
