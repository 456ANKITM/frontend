import type { Metadata } from "next";
import RoleDashboard from "@/components/common/RoleDashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Sales, stock alerts and recent activity for your business or store.",
};

export default function DashboardPage() {
  return <RoleDashboard />;
}