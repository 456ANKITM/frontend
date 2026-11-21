"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import EmptyState from "@/components/adminSpecific/EmptyState";
import ManagerPurchasesList from "./ManagerPurchasesList";
import { useMockRole } from "@/hooks/useMockRole";

// Stock received at a store is recorded by that store's Manager.
// TODO(integration): enforce this on the server (role + storeId from the session).
export default function ManagerPurchasesView() {
  const role = useMockRole();

  if (role !== "store_manager") {
    return (
      <EmptyState
        icon={ClipboardList}
        title="This page is for Store Managers"
        description="Stock received belongs to one store, so it is only available when you are signed in as a Store Manager. Owners can see every store from the Purchases page."
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

  return <ManagerPurchasesList />;
}