import type { Metadata } from "next";
import BusinessDetail from "@/components/adminSpecific/BusinessDetail";

export const metadata: Metadata = {
  title: "Business details",
  description: "Business information, stores, owner contact and activity log.",
};

// Next.js 15+/16: `params` is a Promise in App Router pages.
export default async function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BusinessDetail id={id} />;
}