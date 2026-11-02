import type { Metadata } from "next";
import BusinessesList from "@/components/adminSpecific/BusinessList";

export const metadata: Metadata = {
  title: "Businesses",
  description: "Review every business on the platform and suspend or activate accounts.",
};

export default function AdminBusinessesPage() {
  return <BusinessesList />;
}