"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import EmptyState from "@/components/adminSpecific/EmptyState";
import ManagerSettingsContent from "./ManagerSettingsContent";
import { useMockRole } from "@/hooks/useMockRole";

// This page is the Store Manager's own profile and store. Owners use the Settings page.
// TODO(integration): enforce this on the server (role + storeId from the session).
export default function ManagerSettingsView() {
  const role = useMockRole();

  if (role !== "store_manager") {
    return (
      <EmptyState
        icon={Settings}
        title="This page is for Store Managers"
        description="These settings belong to a Store Manager's profile and store, so this page is only available when you are signed in as a Store Manager. Owners can manage their business from the Settings page."
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

  return <ManagerSettingsContent />;
}