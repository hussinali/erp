import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Truck,
  Package,
  FileText,
  Receipt,
  Banknote,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { path: "/", label: "الرئيسية", icon: LayoutDashboard },
  { path: "/accounts", label: "دليل الحسابات", icon: BookOpen },
  { path: "/customers", label: "العملاء", icon: Users },
  { path: "/suppliers", label: "الموردين", icon: Truck },
  { path: "/products", label: "المنتجات", icon: Package },
  { path: "/invoices", label: "الفواتير", icon: FileText },
  { path: "/receipts", label: "سندات القبض", icon: Receipt },
  { path: "/payments", label: "سندات الصرف", icon: Banknote },
  { path: "/journal-entries", label: "القيود", icon: BookOpen },
  { path: "/reports", label: "التقارير", icon: BarChart3 },
];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-l border-gray-200 fixed right-0 top-0 h-screen z-40">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-700 text-center">نظام ERP المحاسبي</h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 mr-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
              {user?.name?.charAt(0) ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name ?? "المستخدم"}</p>
              <p className="text-xs text-gray-500">{user?.role === "admin" ? "مدير" : "مستخدم"}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={logout}>
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 right-0 left-0 h-14 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <h1 className="text-lg font-bold text-blue-700">نظام ERP</h1>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h1 className="text-lg font-bold text-blue-700">نظام ERP</h1>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={logout}>
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:mr-64 min-h-screen">
        <div className="lg:p-6 p-4 pt-20 lg:pt-6">{children}</div>
      </main>
    </div>
  );
}
