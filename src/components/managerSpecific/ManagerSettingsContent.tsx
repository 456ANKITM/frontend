"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import Toast, { type ToastState } from "@/components/ui/Toast";
import ManagerProfileForm from "./ManagerProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";
import ReceiptSettingsForm from "./ReceiptSettingsForm";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchManagerSettings } from "@/dummy/managerSettings";
import { OWNER_ERROR_MESSAGES } from "@/config/owner";
import type { AdminErrorKind } from "@/types/admin";
import type { ManagerProfile, ManagerSettingsData, ReceiptSettings } from "@/types/managerSettings";

function Skeleton() {
  const bar = "animate-pulse rounded bg-gray-200 motion-reduce:animate-none";
  return (
    <div role="status" aria-label="Loading settings" className="space-y-6">
      {[4, 3, 3].map((fields, i) => (
        <div key={i} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5">
          <div className={`h-4 w-40 ${bar}`} />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: fields }, (_, j) => (
              <div key={j} className={`h-11 rounded-xl ${bar}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ManagerSettingsContent() {
  const [data, setData] = useState<ManagerSettingsData | null>(null);
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
      const result = await fetchManagerSettings();
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
  const profileSaved = useCallback((profile: ManagerProfile) => setData((d) => (d ? { ...d, profile } : d)), []);
  const receiptSaved = useCallback((receipt: ReceiptSettings) => setData((d) => (d ? { ...d, receipt } : d)), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">Settings</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            Your profile, your password and how your store&apos;s receipts look.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <RefreshButton onClick={() => void load()} refreshing={refreshing} />
        </div>
      </div>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !data ? (
        <Skeleton />
      ) : (
        <>
          {error && (
            <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} compact />
          )}
          <div aria-busy={refreshing} className={`space-y-6 ${refreshing ? "opacity-60 transition-opacity" : "transition-opacity"}`}>
            <ManagerProfileForm saved={data.profile} onSaved={profileSaved} onNotify={setToast} />
            <ChangePasswordForm onNotify={setToast} />
            <ReceiptSettingsForm saved={data.receipt} onSaved={receiptSaved} onNotify={setToast} />
          </div>
        </>
      )}

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}