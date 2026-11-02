import type { ReactNode } from "react";
import type { Metadata } from "next";
import AdminShell from "@/components/adminSpecific/AdminShell";

export const metadata: Metadata = {
  title: { default: "Admin | ERP System", template: "%s | ERP System Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  // TODO(integration): verify the session server-side here. Redirect unauthenticated users
  // to /login, and users whose role is not SUPER_ADMIN away from /admin/*.
  // This is only a UX layer; the backend must enforce SUPER_ADMIN on every admin API.
  return <AdminShell>{children}</AdminShell>;
}