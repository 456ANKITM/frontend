import type { ReactNode } from "react";
import type { Metadata } from "next";
import ManagerShell from "@/components/managerSpecific/ManagerShell";

export const metadata: Metadata = {
  title: { default: "Store Dashboard | ERP System", template: "%s | ERP System" },
  robots: { index: false, follow: false },
};

export default function ManagerLayout({ children }: { children: ReactNode }) {
  // TODO(integration): verify the session server-side here. Only store_manager may enter;
  // redirect owners to /dashboard and Super Admins to /admin/dashboard.
  return <ManagerShell>{children}</ManagerShell>;
}