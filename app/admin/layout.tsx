import type { Metadata } from "next";
import AdminAuth from "@/components/admin/admin-auth";
import AdminShell from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuth><AdminShell>{children}</AdminShell></AdminAuth>;
}
