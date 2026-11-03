import type { Metadata } from "next";
import OwnerDashboard from "@/components/ownerSpecific/OwnerDashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Sales, stock alerts and revenue across all your stores.",
};

export default function OwnerDashboardPage() {
  return <OwnerDashboard />;
}