import type { ReactNode } from "react";
import type { Metadata } from "next";
import OwnerShell from "@/components/ownerSpecific/OwnerShell";

export const metadata: Metadata = {
  title: { default: "Dashboard | ERP System", template: "%s | ERP System" },
  robots: { index: false, follow: false },
};

export default function OwnerLayout({ children }: { children: ReactNode }) {
  // TODO(integration): verify the session server-side here. Redirect unauthenticated users
  // to /login, Super Admins to /admin/dashboard and Store Managers to /manager/dashboard.
  // The backend must still enforce roles and businessId/storeId scoping on every API.
  return <OwnerShell>{children}</OwnerShell>;
}