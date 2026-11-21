"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import EmptyState from "@/components/adminSpecific/EmptyState";
import PosTerminal from "./PosTerminal";
import { useMockRole } from "@/hooks/useMockRole";

// Sales are recorded by Store Managers, who sell for their own store.
// TODO(integration): enforce this on the server (role + storeId from the session).
export default function PosView() {
  const role = useMockRole();

  if (role !== "store_manager") {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Sales are recorded by Store Managers"
        description="The sales terminal belongs to a store, so it is only available when you are signed in as a Store Manager."
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

  return <PosTerminal />;
}