import type { Metadata } from "next";
import ManagerReportsView from "@/components/managerSpecific/ManagerReportsView";

export const metadata: Metadata = {
  title: "Reports",
  description: "Sales and inventory reports for your store.",
};

// The store is never read from the URL: a manager only ever sees their own store.
export default function ManagerReportsPage() {
  return <ManagerReportsView />;
}