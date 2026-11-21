"use client";

import OwnerDashboard from "@/components/ownerSpecific/OwnerDashboard";
import StoreManagerDashboard from "@/components/managerSpecific/StoreManagerDashboard";
import { useMockRole } from "@/hooks/useMockRole";

// /dashboard is the same URL for Owners and Store Managers (see utils/roleRedirect.ts).
export default function RoleDashboard() {
  const role = useMockRole();
  return role === "store_manager" ? <StoreManagerDashboard /> : <OwnerDashboard />;
}