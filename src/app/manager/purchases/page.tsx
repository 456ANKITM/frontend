import type { Metadata } from "next";
import ManagerPurchasesView from "@/components/managerSpecific/ManagaerPurchasesView";

export const metadata: Metadata = {
  title: "Purchases",
  description: "Record stock received from suppliers at your store.",
};

// The store is never read from the URL: a manager only ever sees their own store.
export default function ManagerPurchasesPage() {
  return <ManagerPurchasesView />;
}