import type { Metadata } from "next";
import OwnerDashboard from "@/components/ownerSpecific/OwnerDashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Sales, stock alerts and recent activity across your stores.",
};

export default function DashboardPage() {
  return <OwnerDashboard />;
}