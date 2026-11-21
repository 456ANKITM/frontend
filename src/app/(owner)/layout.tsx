import type { ReactNode } from "react";
import type { Metadata } from "next";
import PanelShell from "@/components/common/PanelShell";

export const metadata: Metadata = {
  title: { default: "Dashboard | ERP System", template: "%s | ERP System" },
  robots: { index: false, follow: false },
};

// Shared by the Owner and Store Manager panels (same URLs, different shell and content by role).
export default function OwnerLayout({ children }: { children: ReactNode }) {
  // TODO(integration): verify the session server-side here. Redirect unauthenticated users
  // to /login and Super Admins to /admin/dashboard, and pass the verified role to the shell.
  // This is only a UX layer; the backend must enforce roles and businessId/storeId scoping on every API.
  return <PanelShell>{children}</PanelShell>;
}