import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, BookOpen, BarChart3, Shield } from "lucide-react";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Calculator className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">نظام ERP المحاسبي</h1>
          <p className="text-gray-600">نظام متكامل لإدارة الموارد المؤسسية والمحاسبة</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">تسجيل الدخول</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
              onClick={() => {
                window.location.href = getOAuthUrl();
              }}
            >
              <Shield className="h-5 w-5 ml-2" />
              تسجيل الدخول بحساب Kimi
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">مميزات النظام</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-gray-50">
                <BookOpen className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                <p className="text-xs text-gray-600">دليل الحسابات</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <BarChart3 className="h-5 w-5 mx-auto text-green-600 mb-1" />
                <p className="text-xs text-gray-600">تقارير مالية</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <Calculator className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                <p className="text-xs text-gray-600">قيود محاسبية</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
