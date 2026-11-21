"use client";

import Link from "next/link";
import { Receipt } from "lucide-react";
import EmptyState from "@/components/adminSpecific/EmptyState";
import ManagerSalesList from "./ManagerSalesList";
import { useMockRole } from "@/hooks/useMockRole";

// A store's invoices and refunds are handled by that store's Manager.
// TODO(integration): enforce this on the server (role + storeId from the session).
export default function ManagerSalesView() {
  const role = useMockRole();

  if (role !== "store_manager") {
    return (
      <EmptyState
        icon={Receipt}
        title="This page is for Store Managers"
        description="Sales history and refunds belong to one store, so this page is only available when you are signed in as a Store Manager. Owners can see every store from the Sales page."
      >
        <Link
          href="/dashboard"
          className="mt-5 inline-flex h-10 items-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black"
        >
          Back to dashboard
        </Link>
      </EmptyState>
    );
  }

  return <ManagerSalesList />;
}