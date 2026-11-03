import type { Metadata } from "next";
import StoresList from "@/components/ownerSpecific/StoresList";

export const metadata: Metadata = {
  title: "Stores",
  description: "Today's sales and stock alerts for every store in your business.",
};

export default function OwnerStoresPage() {
  return <StoresList />;
}