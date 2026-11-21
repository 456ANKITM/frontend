import type { Metadata } from "next";
import StoreManagerDashboard from "@/components/managerSpecific/StoreManagerDashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Today's sales, stock alerts and recent transactions for your store.",
};

export default function ManagerDashboardPage() {
  return <StoreManagerDashboard />;
}