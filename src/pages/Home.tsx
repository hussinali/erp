import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Receipt,
  Banknote,
  Package,
} from "lucide-react";

export default function Home() {
  const { data: dashboard, isLoading } = trpc.reports.dashboard.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "إجمالي المبيعات",
      value: dashboard?.totalSales ?? "0",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "الأرصدة المستحقة",
      value: dashboard?.outstanding ?? "0",
      icon: FileText,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "إجمالي الأصول",
      value: dashboard?.totalAssets ?? "0",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "صافي الدخل",
      value: dashboard?.netIncome ?? "0",
      icon: TrendingDown,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const secondaryStats = [
    {
      title: "سندات القبض",
      value: dashboard?.totalReceipts ?? "0",
      icon: Receipt,
      color: "text-emerald-600",
    },
    {
      title: "سندات الصرف",
      value: dashboard?.totalPayments ?? "0",
      icon: Banknote,
      color: "text-red-600",
    },
    {
      title: "عدد الفواتير",
      value: String(dashboard?.invoiceCount ?? 0),
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "عدد الحسابات",
      value: String(dashboard?.accountCount ?? 0),
      icon: Package,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {parseFloat(stat.value).toLocaleString("ar-SA", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">الموجودات والخصوم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الأصول</span>
                <span className="font-semibold text-blue-600">
                  {parseFloat(dashboard?.totalAssets ?? "0").toLocaleString("ar-SA", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${Math.min((parseFloat(dashboard?.totalAssets ?? "0") / (parseFloat(dashboard?.totalAssets ?? "1") || 1)) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الخصوم</span>
                <span className="font-semibold text-red-600">
                  {parseFloat(dashboard?.totalLiabilities ?? "0").toLocaleString("ar-SA", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{
                    width: `${Math.min((parseFloat(dashboard?.totalLiabilities ?? "0") / (parseFloat(dashboard?.totalAssets ?? "1") || 1)) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">حقوق الملكية</span>
                <span className="font-semibold text-green-600">
                  {parseFloat(dashboard?.totalEquity ?? "0").toLocaleString("ar-SA", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${Math.min((parseFloat(dashboard?.totalEquity ?? "0") / (parseFloat(dashboard?.totalAssets ?? "1") || 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">ملخص النشاط</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">إجمالي المبيعات المدفوعة</span>
                <span className="font-bold text-green-600">
                  {parseFloat(dashboard?.totalPaid ?? "0").toLocaleString("ar-SA", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">نسبة التحصيل</span>
                <span className="font-bold text-blue-600">
                  {parseFloat(dashboard?.totalSales ?? "0") > 0
                    ? `${((parseFloat(dashboard?.totalPaid ?? "0") / parseFloat(dashboard?.totalSales ?? "0")) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">عدد العملاء النشطين</span>
                <span className="font-bold text-purple-600">{dashboard?.customerCount ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
