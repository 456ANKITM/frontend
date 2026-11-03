import type { ReactNode } from "react";
import type { Metadata } from "next";
import OwnerShell from "@/components/ownerSpecific/OwnerShell";

export const metadata: Metadata = {
  title: { default: "Dashboard | ERP System", template: "%s | ERP System" },
  robots: { index: false, follow: false },
};

export default function OwnerLayout({ children }: { children: ReactNode }) {
  // TODO(integration): verify the session server-side here. Redirect unauthenticated users
  // to /login and Super Admins to /admin/dashboard. Store Managers also land on /dashboard
  // (see utils/roleRedirect.ts), so pick the shell/page by role when that panel is built.
  // This is only a UX layer; the backend must enforce roles and businessId scoping on every API.
  return <OwnerShell>{children}</OwnerShell>;
}