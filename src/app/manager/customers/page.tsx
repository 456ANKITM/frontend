import type { Metadata } from "next";
import ManagerCustomersView from "@/components/managerSpecific/ManagerCustomersView";

export const metadata: Metadata = {
  title: "Customers",
  description: "Your store's customers and what they have bought.",
};

// The store is never read from the URL: a manager only ever sees their own store.
export default function ManagerCustomersPage() {
  return <ManagerCustomersView />;
}