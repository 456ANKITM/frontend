"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import EmptyState from "@/components/adminSpecific/EmptyState";
import ManagerInventoryList from "./ManagerInventoryList";
import { useMockRole } from "@/hooks/useMockRole";
import type { StockFilter } from "@/types/owner";

// Store inventory is managed by the Store Manager of that store.
// TODO(integration): enforce this on the server (role + storeId from the session).
export default function ManagerInventoryView({ initialStock = "all" }: { initialStock?: StockFilter }) {
  const role = useMockRole();

  if (role !== "store_manager") {
    return (
      <EmptyState
        icon={Package}
        title="This page is for Store Managers"
        description="Store inventory belongs to one store, so it is only available when you are signed in as a Store Manager. Owners can see every store from the Inventory page."
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

  return <ManagerInventoryList initialStock={initialStock} />;
}