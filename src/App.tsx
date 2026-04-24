import { Routes, Route, Navigate } from 'react-router'
import { useAuth } from "@/hooks/useAuth";
import { SidebarLayout } from "@/components/SidebarLayout";
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import Home from "./pages/Home"
import AccountsPage from "./pages/AccountsPage"
import CustomersPage from "./pages/CustomersPage"
import SuppliersPage from "./pages/SuppliersPage"
import ProductsPage from "./pages/ProductsPage"
import InvoicesPage from "./pages/InvoicesPage"
import ReceiptsPage from "./pages/ReceiptsPage"
import PaymentsPage from "./pages/PaymentsPage"
import JournalEntriesPage from "./pages/JournalEntriesPage"
import ReportsPage from "./pages/ReportsPage"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <SidebarLayout>{children}</SidebarLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
      <Route path="/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
      <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
      <Route path="/receipts" element={<ProtectedRoute><ReceiptsPage /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
      <Route path="/journal-entries" element={<ProtectedRoute><JournalEntriesPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
