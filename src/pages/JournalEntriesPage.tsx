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
import { Plus, Search, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

export default function JournalEntriesPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState<number | null>(null);
  const [form, setForm] = useState({
    entryNumber: "",
    date: new Date().toISOString().split("T")[0],
    reference: "",
    description: "",
    items: [] as Array<{
      accountId: string;
      debit: string;
      credit: string;
      description: string;
    }>,
  });

  const utils = trpc.useUtils();
  const { data: entries, isLoading } = trpc.journalEntries.list.useQuery();
  const { data: accounts } = trpc.accounts.list.useQuery();
  const { data: entryDetail } = trpc.journalEntries.getById.useQuery(
    { id: viewEntry ?? 0 },
    { enabled: viewEntry !== null },
  );
  const createMutation = trpc.journalEntries.create.useMutation({
    onSuccess: () => {
      utils.journalEntries.list.invalidate();
      utils.accounts.list.invalidate();
      utils.reports.dashboard.invalidate();
      setOpen(false);
      resetForm();
      toast.success("تم إنشاء القيد بنجاح");
    },
  });
  const deleteMutation = trpc.journalEntries.delete.useMutation({
    onSuccess: () => {
      utils.journalEntries.list.invalidate();
      toast.success("تم حذف القيد بنجاح");
    },
  });

  const filtered = entries?.filter(
    (e) =>
      e.entryNumber.includes(search) ||
      e.reference?.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase()),
  );

  function resetForm() {
    setForm({
      entryNumber: "",
      date: new Date().toISOString().split("T")[0],
      reference: "",
      description: "",
      items: [],
    });
  }

  function addItem() {
    setForm({
      ...form,
      items: [...form.items, { accountId: "", debit: "", credit: "", description: "" }],
    });
  }

  function updateItem(index: number, field: string, value: any) {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, items });
  }

  function removeItem(index: number) {
    const items = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items });
  }

  function handleSubmit() {
    const totalDebit = form.items.reduce((sum, item) => sum + parseFloat(item.debit || "0"), 0);
    const totalCredit = form.items.reduce((sum, item) => sum + parseFloat(item.credit || "0"), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      toast.error("القيد غير متوازن: إجمالي المدين لا يساوي إجمالي الدائن");
      return;
    }
    createMutation.mutate({
      ...form,
      items: form.items.map((item) => ({
        accountId: parseInt(item.accountId),
        debit: item.debit || "0.00",
        credit: item.credit || "0.00",
        description: item.description,
      })),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">القيود المحاسبية</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); }}>
              <Plus className="h-4 w-4 ml-2" />
              قيد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>قيد محاسبي جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>رقم القيد</Label>
                  <Input
                    value={form.entryNumber}
                    onChange={(e) => setForm({ ...form, entryNumber: e.target.value })}
                    placeholder="JE-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>التاريخ</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>المرجع</Label>
                  <Input
                    value={form.reference}
                    onChange={(e) => setForm({ ...form, reference: e.target.value })}
                    placeholder="رقم المرجع"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف القيد"
                />
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">بنود القيد</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة بند
                  </Button>
                </div>
                {form.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 items-end">
                    <div className="col-span-2">
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={item.accountId}
                        onChange={(e) => updateItem(index, "accountId", e.target.value)}
                      >
                        <option value="">اختر الحساب</option>
                        {accounts?.map((a) => (
                          <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="مدين"
                        value={item.debit}
                        onChange={(e) => updateItem(index, "debit", e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="دائن"
                        value={item.credit}
                        onChange={(e) => updateItem(index, "credit", e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="وصف"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                      />
                      <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="text-sm">
                    <span className="text-gray-500">إجمالي المدين:</span>{" "}
                    <span className="font-bold">{form.items.reduce((sum, item) => sum + parseFloat(item.debit || "0"), 0).toFixed(2)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">إجمالي الدائن:</span>{" "}
                    <span className="font-bold">{form.items.reduce((sum, item) => sum + parseFloat(item.credit || "0"), 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={createMutation.isPending}>
                إنشاء القيد
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
              placeholder="البحث في القيود..."
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
                    <TableHead>رقم القيد</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المرجع</TableHead>
                    <TableHead>المدين</TableHead>
                    <TableHead>الدائن</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.entryNumber}</TableCell>
                      <TableCell>{new Date(entry.date).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell>{entry.reference ?? "-"}</TableCell>
                      <TableCell>{parseFloat(entry.totalDebit).toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>{parseFloat(entry.totalCredit).toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${entry.isBalanced ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {entry.isBalanced ? "متوازن" : "غير متوازن"}
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setViewEntry(entry.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              if (confirm("هل أنت متأكد من حذف هذا القيد؟")) {
                                deleteMutation.mutate({ id: entry.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        لا توجد قيود محاسبية
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Entry Dialog */}
      <Dialog open={viewEntry !== null} onOpenChange={() => setViewEntry(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل القيد {entryDetail?.entryNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">التاريخ:</span> {entryDetail?.date ? new Date(entryDetail.date).toLocaleDateString("ar-SA") : ""}</div>
              <div><span className="text-gray-500">المرجع:</span> {entryDetail?.reference ?? "-"}</div>
              <div><span className="text-gray-500">الوصف:</span> {entryDetail?.description ?? "-"}</div>
              <div><span className="text-gray-500">الحالة:</span> {entryDetail?.isBalanced ? "متوازن" : "غير متوازن"}</div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الحساب</TableHead>
                  <TableHead>مدين</TableHead>
                  <TableHead>دائن</TableHead>
                  <TableHead>الوصف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entryDetail?.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.account?.name ?? item.accountId}</TableCell>
                    <TableCell>{parseFloat(item.debit).toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{parseFloat(item.credit).toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{item.description ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
