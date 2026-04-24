import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, TrendingUp } from "lucide-react";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"income" | "balance" | "trial">("income");
  const { data: income, isLoading: incomeLoading } = trpc.reports.incomeStatement.useQuery();
  const { data: balance, isLoading: balanceLoading } = trpc.reports.balanceSheet.useQuery();
  const { data: trial, isLoading: trialLoading } = trpc.reports.trialBalance.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">التقارير المالية</h1>
      </div>

      <div className="flex gap-2">
        <Button
          variant={activeTab === "income" ? "default" : "outline"}
          onClick={() => setActiveTab("income")}
          className="gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          قائمة الدخل
        </Button>
        <Button
          variant={activeTab === "balance" ? "default" : "outline"}
          onClick={() => setActiveTab("balance")}
          className="gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          الميزانية العمومية
        </Button>
        <Button
          variant={activeTab === "trial" ? "default" : "outline"}
          onClick={() => setActiveTab("trial")}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          ميزان المراجعة
        </Button>
      </div>

      {activeTab === "income" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              قائمة الدخل
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-green-700 mb-3">الإيرادات</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الحساب</TableHead>
                        <TableHead className="text-left">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {income?.revenues?.map((rev) => (
                        <TableRow key={rev.id}>
                          <TableCell>{rev.name}</TableCell>
                          <TableCell className="text-left">{rev.balance.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-green-50">
                        <TableCell>إجمالي الإيرادات</TableCell>
                        <TableCell className="text-left">{income?.totalRevenue?.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-3">المصروفات</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الحساب</TableHead>
                        <TableHead className="text-left">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {income?.expenses?.map((exp) => (
                        <TableRow key={exp.id}>
                          <TableCell>{exp.name}</TableCell>
                          <TableCell className="text-left">{exp.balance.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-red-50">
                        <TableCell>إجمالي المصروفات</TableCell>
                        <TableCell className="text-left">{income?.totalExpenses?.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="p-4 rounded-lg bg-blue-50">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-900">صافي الدخل</span>
                    <span className="text-2xl font-bold text-blue-700">
                      {income?.netIncome?.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "balance" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              الميزانية العمومية
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-3">الأصول</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الحساب</TableHead>
                        <TableHead className="text-left">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balance?.assets?.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell>{asset.name}</TableCell>
                          <TableCell className="text-left">{asset.balance.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-blue-50">
                        <TableCell>إجمالي الأصول</TableCell>
                        <TableCell className="text-left">{balance?.totalAssets?.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-3">الخصوم</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الحساب</TableHead>
                        <TableHead className="text-left">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balance?.liabilities?.map((liab) => (
                        <TableRow key={liab.id}>
                          <TableCell>{liab.name}</TableCell>
                          <TableCell className="text-left">{liab.balance.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-red-50">
                        <TableCell>إجمالي الخصوم</TableCell>
                        <TableCell className="text-left">{balance?.totalLiabilities?.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-700 mb-3">حقوق الملكية</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الحساب</TableHead>
                        <TableHead className="text-left">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balance?.equity?.map((eq) => (
                        <TableRow key={eq.id}>
                          <TableCell>{eq.name}</TableCell>
                          <TableCell className="text-left">{eq.balance.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-purple-50">
                        <TableCell>إجمالي حقوق الملكية</TableCell>
                        <TableCell className="text-left">{balance?.totalEquity?.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">إجمالي الخصوم + حقوق الملكية</span>
                    <span className="text-2xl font-bold text-gray-700">
                      {balance?.totalLiabilitiesAndEquity?.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "trial" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              ميزان المراجعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trialLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الرمز</TableHead>
                      <TableHead>الحساب</TableHead>
                      <TableHead className="text-left">مدين</TableHead>
                      <TableHead className="text-left">دائن</TableHead>
                      <TableHead className="text-left">الرصيد</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trial?.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-left">{parseFloat(item.totalDebit).toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-left">{parseFloat(item.totalCredit).toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-left font-medium">{parseFloat(item.balance).toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-indigo-50">
                      <TableCell colSpan={2}>الإجمالي</TableCell>
                      <TableCell className="text-left">{parseFloat(trial?.totalDebit ?? "0").toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-left">{parseFloat(trial?.totalCredit ?? "0").toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-left">-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
