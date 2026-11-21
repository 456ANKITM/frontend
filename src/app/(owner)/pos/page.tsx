import type { Metadata } from "next";
import PosView from "@/components/managerSpecific/PosView";

export const metadata: Metadata = {
  title: "New sale",
  description: "Search or scan products, set payment and print the invoice.",
};

export default function PosPage() {
  return <PosView />;
}