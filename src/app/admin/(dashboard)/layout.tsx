"use client";

import type { ReactNode } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { ToastProvider } from "@/components/admin/Toast";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <ToastProvider>
        <AdminLayout>{children}</AdminLayout>
      </ToastProvider>
    </AdminGuard>
  );
}
