"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import EmptyState from "@/components/adminSpecific/EmptyState";
import ManagerCustomersList from "./ManagerCustomersList";
import { useMockRole } from "@/hooks/useMockRole";

// A store's customers are handled by that store's Manager.
// TODO(integration): enforce this on the server (role + storeId from the session).
export default function ManagerCustomersView() {
  const role = useMockRole();

  if (role !== "store_manager") {
    return (
      <EmptyState
        icon={Users}
        title="This page is for Store Managers"
        description="Customers belong to one store, so this page is only available when you are signed in as a Store Manager."
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

  return <ManagerCustomersList />;
}