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

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-orange-100 text-orange-800",
};

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  sent: "مرسلة",
  paid: "مدفوعة",
  overdue: "متأخرة",
  cancelled: "ملغاة",
};

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<number | null>(null);
  const [form, setForm] = useState({
    invoiceNumber: "",
    customerId: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
    items: [] as Array<{
      productId?: number;
      description: string;
      quantity: string;
      unitPrice: string;
      taxRate: string;
      taxAmount: string;
      total: string;
    }>,
  });

  const utils = trpc.useUtils();
  const { data: invoices, isLoading } = trpc.invoices.list.useQuery();
  const { data: customers } = trpc.customers.list.useQuery();
  const { data: invoiceDetail } = trpc.invoices.getById.useQuery(
    { id: viewInvoice ?? 0 },
    { enabled: viewInvoice !== null },
  );
  const createMutation = trpc.invoices.create.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      setOpen(false);
      resetForm();
      toast.success("تم إنشاء الفاتورة بنجاح");
    },
  });
  const deleteMutation = trpc.invoices.delete.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      toast.success("تم حذف الفاتورة بنجاح");
    },
  });

  const filtered = invoices?.filter(
    (inv) =>
      inv.invoiceNumber.includes(search) ||
      inv.customer?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  function resetForm() {
    setForm({
      invoiceNumber: "",
      customerId: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: "",
      notes: "",
      items: [],
    });
  }

  function addItem() {
    setForm({
      ...form,
      items: [
        ...form.items,
        { description: "", quantity: "1", unitPrice: "", taxRate: "0", taxAmount: "0", total: "" },
      ],
    });
  }

  function updateItem(index: number, field: string, value: any) {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    if (field === "quantity" || field === "unitPrice" || field === "taxRate") {
      const qty = parseFloat(items[index].quantity || "0");
      const price = parseFloat(items[index].unitPrice || "0");
      const rate = parseFloat(items[index].taxRate || "0");
      const subtotal = qty * price;
      const tax = subtotal * (rate / 100);
      items[index].taxAmount = tax.toFixed(2);
      items[index].total = (subtotal + tax).toFixed(2);
    }
    setForm({ ...form, items });
  }

  function removeItem(index: number) {
    const items = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items });
  }

  function handleSubmit() {
    const subtotal = form.items.reduce((sum, item) => sum + parseFloat(item.total || "0"), 0);
    const taxAmount = form.items.reduce((sum, item) => sum + parseFloat(item.taxAmount || "0"), 0);
    createMutation.mutate({
      ...form,
      customerId: parseInt(form.customerId),
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: subtotal.toFixed(2),
      items: form.items.map(item => ({...item, quantity: parseInt(item.quantity)})),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">الفواتير</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); }}>
              <Plus className="h-4 w-4 ml-2" />
              فاتورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>فاتورة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رقم الفاتورة</Label>
                  <Input
                    value={form.invoiceNumber}
                    onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                    placeholder="INV-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>العميل</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.customerId}
                    onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  >
                    <option value="">اختر العميل</option>
                    {customers?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
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
                  <Label>تاريخ الاستحقاق</Label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="ملاحظات..."
                />
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">البنود</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة بند
                  </Button>
                </div>
                {form.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 items-end">
                    <div className="col-span-2">
                      <Input
                        placeholder="الوصف"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="الكمية"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="السعر"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="الضريبة %"
                        value={item.taxRate}
                        onChange={(e) => updateItem(index, "taxRate", e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium whitespace-nowrap">{item.total}</span>
                      <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="text-lg font-bold">
                  الإجمالي: {form.items.reduce((sum, item) => sum + parseFloat(item.total || "0"), 0).toFixed(2)}
                </div>
                <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                  إنشاء الفاتورة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث في الفواتير..."
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
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customer?.name ?? "-"}</TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell>{parseFloat(invoice.total).toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
                          {statusLabels[invoice.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setViewInvoice(invoice.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
                                deleteMutation.mutate({ id: invoice.id });
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
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        لا توجد فواتير
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={viewInvoice !== null} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل الفاتورة {invoiceDetail?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">العميل:</span> {invoiceDetail?.customer?.name}</div>
              <div><span className="text-gray-500">التاريخ:</span> {invoiceDetail?.date ? new Date(invoiceDetail.date).toLocaleDateString("ar-SA") : ""}</div>
              <div><span className="text-gray-500">الحالة:</span> {invoiceDetail?.status ? statusLabels[invoiceDetail.status] : ""}</div>
              <div><span className="text-gray-500">الإجمالي:</span> {parseFloat(invoiceDetail?.total ?? "0").toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceDetail?.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{parseFloat(item.unitPrice).toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{parseFloat(item.total).toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
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
