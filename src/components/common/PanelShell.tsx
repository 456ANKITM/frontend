"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import OwnerShell from "@/components/ownerSpecific/OwnerShell";
import ManagerShell from "@/components/managerSpecific/ManagerShell";
import { useMockRole } from "@/hooks/useMockRole";

const subscribeNone = () => () => {};

// Owners and Store Managers share the same URLs (/dashboard, /inventory, /sales, ...), so the
// shell (sidebar + header) is picked by role. While the role is still unknown (server render and
// first paint) we show an empty frame instead of flashing the wrong navigation.
// TODO(integration): replace the mock role with the session role verified on the server.
export default function PanelShell({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(subscribeNone, () => true, () => false);
  const role = useMockRole();

  if (!mounted) return <div className="min-h-dvh bg-gray-50" aria-hidden="true" />;
  return role === "store_manager" ? <ManagerShell>{children}</ManagerShell> : <OwnerShell>{children}</OwnerShell>;
}