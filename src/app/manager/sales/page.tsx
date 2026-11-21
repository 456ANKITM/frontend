import type { Metadata } from "next";
import ManagerSalesView from "@/components/managerSpecific/ManagerSalesView";

export const metadata: Metadata = {
  title: "Sales",
  description: "Past invoices for your store, with refunds.",
};

// The store is never read from the URL: a manager only ever sees their own store.
export default function ManagerSalesPage() {
  return <ManagerSalesView />;
}