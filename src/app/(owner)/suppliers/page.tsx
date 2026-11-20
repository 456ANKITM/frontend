import type { Metadata } from "next";
import SuppliersList from "@/components/ownerSpecific/SuppliersList";

export const metadata: Metadata = {
  title: "Suppliers",
  description: "Your supplier directory and purchase history.",
};

export default function OwnerSuppliersPage() {
  return <SuppliersList />;
}