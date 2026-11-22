"use client";

import { useState } from "react";
import { Check, Circle, Loader2, Lock } from "lucide-react";
import TextField from "@/components/common/TextField";
import type { ToastState } from "@/components/ui/Toast";
import { card, primaryBtn } from "./managerSettingsStyles";
import { changeManagerPassword, ManagerSettingsApiError } from "@/dummy/managerSettings";
import { PASSWORD_RULES, validatePasswordChange, type PasswordErrors } from "@/utils/managerSettings";

type Props = { onNotify: (toast: ToastState) => void };

const FIELD_IDS = {
  currentPassword: "current-password",
  newPassword: "new-password",
  confirmPassword: "confirm-password",
} as const;

export default function ChangePasswordForm({ onNotify }: Props) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [saving, setSaving] = useState(false);

  const clear = (key: keyof PasswordErrors) => setErrors((prev) => ({ ...prev, [key]: undefined }));

  const handleSubmit = async () => {
    const found = validatePasswordChange(current, next, confirm);
    setErrors(found);
    const first = (Object.keys(FIELD_IDS) as (keyof typeof FIELD_IDS)[]).find((k) => found[k]);
    if (first) return document.getElementById(FIELD_IDS[first])?.focus();

    setSaving(true);
    try {
      await changeManagerPassword({ currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      setErrors({});
      onNotify({ type: "success", message: "Your password was changed." });
    } catch (err) {
      if (err instanceof ManagerSettingsApiError && err.fieldErrors) {
        setErrors(err.fieldErrors as PasswordErrors);
        const k = (Object.keys(FIELD_IDS) as (keyof typeof FIELD_IDS)[]).find((key) => err.fieldErrors?.[key]);
        if (k) document.getElementById(FIELD_IDS[k])?.focus();
      }
      onNotify({ type: "error", message: "We couldn't change your password. Check the form and try again." });
    } finally {
      setSaving(false);
    }
  };

  const type = show ? "text" : "password";

  return (
    <form
      noValidate
      aria-labelledby="password-title"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className={card}
    >
      <h2 id="password-title" className="text-[15px] font-semibold text-black">
        Change password
      </h2>
      <p className="mt-1 text-sm text-gray-600">Use a password you don&apos;t use anywhere else.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <TextField
          full
          label="Current password"
          name="current-password"
          type={type}
          icon={Lock}
          value={current}
          onChange={(e) => {
            setCurrent(e.target.value);
            clear("currentPassword");
          }}
          error={errors.currentPassword}
          autoComplete="current-password"
        />
        <TextField
          label="New password"
          name="new-password"
          type={type}
          icon={Lock}
          value={next}
          onChange={(e) => {
            setNext(e.target.value);
            clear("newPassword");
          }}
          error={errors.newPassword}
          autoComplete="new-password"
        />
        <TextField
          label="Confirm new password"
          name="confirm-password"
          type={type}
          icon={Lock}
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            clear("confirmPassword");
          }}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
      </div>

      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm text-gray-800">
        <input
          type="checkbox"
          checked={show}
          onChange={(e) => setShow(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 accent-black"
        />
        Show passwords
      </label>

      <ul aria-label="Password requirements" className="mt-4 grid gap-1.5 sm:grid-cols-2">
        {PASSWORD_RULES.map((r) => {
          const met = r.test(next);
          const Icon = met ? Check : Circle;
          return (
            <li key={r.id} className={`flex items-center gap-2 text-[13px] ${met ? "font-medium text-black" : "text-gray-600"}`}>
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {r.label}
              <span className="sr-only">{met ? " (met)" : " (not met yet)"}</span>
            </li>
          );
        })}
      </ul>

      <div className="mt-6">
        <button type="submit" disabled={saving} aria-busy={saving} className={primaryBtn}>
          {saving && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          {saving ? "Changing..." : "Change password"}
        </button>
      </div>
    </form>
  );
}