import type { Metadata } from "next";
import AdminDashboard from "@/components/adminSpecific/AdminDashboard";

export const metadata: Metadata = {
  title: "Platform Overview",
  description: "Monitor businesses, platform growth and account activity.",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}