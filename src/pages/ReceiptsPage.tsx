import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

const paymentMethodLabels: Record<string, string> = {
  cash: "نقدي",
  bank_transfer: "تحويل بنكي",
  check: "شيك",
  credit_card: "بطاقة ائتمان",
  other: "أخرى",
};

export default function ReceiptsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    receiptNumber: "",
    customerId: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    paymentMethod: "cash" as const,
    reference: "",
    accountId: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: receipts, isLoading } = trpc.receipts.list.useQuery();
  const { data: customers } = trpc.customers.list.useQuery();
  const { data: accounts } = trpc.accounts.list.useQuery();
  const createMutation = trpc.receipts.create.useMutation({
    onSuccess: () => {
      utils.receipts.list.invalidate();
      utils.reports.dashboard.invalidate();
      setOpen(false);
      resetForm();
      toast.success("تم إنشاء سند القبض بنجاح");
    },
  });
  const deleteMutation = trpc.receipts.delete.useMutation({
    onSuccess: () => {
      utils.receipts.list.invalidate();
      toast.success("تم حذف سند القبض بنجاح");
    },
  });

  const filtered = receipts?.filter(
    (r) =>
      r.receiptNumber.includes(search) ||
      r.customer?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  function resetForm() {
    setForm({
      receiptNumber: "",
      customerId: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      paymentMethod: "cash",
      reference: "",
      accountId: "",
      notes: "",
    });
  }

  function handleSubmit() {
    createMutation.mutate({
      ...form,
      customerId: form.customerId ? parseInt(form.customerId) : undefined,
      accountId: parseInt(form.accountId),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">سندات القبض</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); }}>
              <Plus className="h-4 w-4 ml-2" />
              سند قبض جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>سند قبض جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>رقم السند</Label>
                <Input
                  value={form.receiptNumber}
                  onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })}
                  placeholder="REC-001"
                />
              </div>
              <div className="space-y-2">
                <Label>العميل (اختياري)</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                >
                  <option value="">بدون عميل</option>
                  {customers?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>التاريخ</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>المبلغ</Label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>طريقة الدفع</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as any })}
                  >
                    <option value="cash">نقدي</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="check">شيك</option>
                    <option value="credit_card">بطاقة ائتمان</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>الحساب</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.accountId}
                    onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                  >
                    <option value="">اختر الحساب</option>
                    {accounts?.filter((a) => a.type === "asset").map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>المرجع</Label>
                <Input
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  placeholder="رقم المرجع"
                />
              </div>
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="ملاحظات..."
                />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={createMutation.isPending}>
                إنشاء سند القبض
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث في سندات القبض..."
              className="pr-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم السند</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>طريقة الدفع</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                      <TableCell>{receipt.customer?.name ?? "-"}</TableCell>
                      <TableCell>{new Date(receipt.date).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell>{parseFloat(receipt.amount).toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>{paymentMethodLabels[receipt.paymentMethod]}</TableCell>
                      <TableCell className="text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذا السند؟")) {
                              deleteMutation.mutate({ id: receipt.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        لا توجد سندات قبض
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
