"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";
import EmptyState from "@/components/adminSpecific/EmptyState";
import ManagerReportsBuilder from "./ManagerReportsBuilder";
import { useMockRole } from "@/hooks/useMockRole";

// Store-level reports are for that store's Manager. Owners use the Reports page for every store.
// TODO(integration): enforce this on the server (role + storeId from the session).
export default function ManagerReportsView() {
  const role = useMockRole();

  if (role !== "store_manager") {
    return (
      <EmptyState
        icon={BarChart3}
        title="This page is for Store Managers"
        description="Store reports belong to one store, so this page is only available when you are signed in as a Store Manager. Owners can build reports for every store from the Reports page."
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

  return <ManagerReportsBuilder />;
}