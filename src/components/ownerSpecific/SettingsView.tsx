"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import Toast, { type ToastState } from "@/components/ui/Toast";
import BusinessProfileForm from "./BusinessProfileForm";
import RegionalSettingsForm from "./ReginoalSettingsForm";
import SubscriptionCard from "./SubscriptionCard";
import BillingHistory from "./BillingHistory";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchSettings, updateBusinessSettings } from "@/dummy/ownerSettings";
import { OWNER_ERROR_MESSAGES } from "@/config/owner";
import type { AdminErrorKind } from "@/types/admin";
import type { BusinessSettingsPayload, SettingsData } from "@/types/settings";

export default function SettingsView() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchSettings();
      if (id !== requestId.current) return;
      setData(result);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof AdminApiError ? err.kind : "network");
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const closeToast = useCallback(() => setToast(null), []);

  // Both forms send a partial update to the same endpoint.
  const save = useCallback(async (payload: BusinessSettingsPayload) => {
    const business = await updateBusinessSettings(payload);
    setData((d) => (d ? { ...d, business } : d));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">Settings</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            Your business details, how money is shown, and your subscription.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <RefreshButton onClick={() => void load()} refreshing={refreshing} />
        </div>
      </div>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !data ? (
        <SettingsSkeleton />
      ) : (
        <>
          {error && (
            <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} compact />
          )}
          <div
            aria-busy={refreshing}
            className={`space-y-6 ${refreshing ? "opacity-60 transition-opacity" : "transition-opacity"}`}
          >
            <BusinessProfileForm saved={data.business} onSave={save} onNotify={setToast} />
            <RegionalSettingsForm saved={data.business} onSave={save} onNotify={setToast} />
            <SubscriptionCard subscription={data.subscription} />
            <BillingHistory
              invoices={data.subscription.invoices}
              billingCurrency={data.subscription.billingCurrency}
            />
          </div>
        </>
      )}

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

function SettingsSkeleton() {
  const bar = "animate-pulse rounded bg-gray-200 motion-reduce:animate-none";
  return (
    <div role="status" aria-label="Loading settings" className="space-y-6">
      <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5">
        <div className={`h-4 w-36 ${bar}`} />
        <div className="flex items-center gap-4">
          <div className={`h-16 w-16 rounded-2xl ${bar}`} />
          <div className={`h-3.5 w-48 ${bar}`} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={`h-11 rounded-xl ${bar}`} />
          ))}
        </div>
      </div>
      <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5">
        <div className={`h-4 w-44 ${bar}`} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={`h-11 rounded-xl ${bar}`} />
          <div className={`h-11 rounded-xl ${bar}`} />
        </div>
      </div>
      <div className={`h-64 rounded-2xl ${bar}`} />
    </div>
  );
}