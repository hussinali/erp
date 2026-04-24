import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">الصفحة غير موجودة</h2>
        <p className="text-gray-500 mb-6">الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
        <Link to="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
}
