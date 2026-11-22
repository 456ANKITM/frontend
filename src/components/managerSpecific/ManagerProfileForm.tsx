"use client";

import { useState, type ChangeEvent } from "react";
import { Loader2, Mail, Phone, User } from "lucide-react";
import TextField from "@/components/common/TextField";
import type { ToastState } from "@/components/ui/Toast";
import { card, outlineBtn, primaryBtn } from "./managerSettingsStyles";
import { ManagerSettingsApiError, updateManagerProfile } from "@/dummy/managerSettings";
import { validateProfile, type ProfileErrors } from "@/utils/managerSettings";
import type { ManagerProfile } from "@/types/managerSettings";

type Props = {
  saved: ManagerProfile;
  onSaved: (profile: ManagerProfile) => void;
  onNotify: (toast: ToastState) => void;
};

const FIELD_IDS = { name: "profile-name", phone: "profile-phone" } as const;

export default function ManagerProfileForm({ saved, onSaved, onNotify }: Props) {
  const [draft, setDraft] = useState({ name: saved.name, phone: saved.phone });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);

  const trimmed = { name: draft.name.trim(), phone: draft.phone.trim() };
  const dirty = trimmed.name !== saved.name || trimmed.phone !== saved.phone;

  const set = (key: keyof typeof draft) => (e: ChangeEvent<HTMLInputElement>) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const discard = () => {
    setDraft({ name: saved.name, phone: saved.phone });
    setErrors({});
  };

  const handleSubmit = async () => {
    const found = validateProfile(trimmed);
    setErrors(found);
    const first = (Object.keys(FIELD_IDS) as (keyof typeof FIELD_IDS)[]).find((k) => found[k]);
    if (first) return document.getElementById(FIELD_IDS[first])?.focus();

    setSaving(true);
    try {
      onSaved(await updateManagerProfile(trimmed));
      onNotify({ type: "success", message: "Your profile was saved." });
    } catch (err) {
      if (err instanceof ManagerSettingsApiError && err.fieldErrors) setErrors(err.fieldErrors as ProfileErrors);
      onNotify({ type: "error", message: "We couldn't save your profile. Check the form and try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      noValidate
      aria-labelledby="manager-profile-title"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className={card}
    >
      <h2 id="manager-profile-title" className="text-[15px] font-semibold text-black">
        Personal profile
      </h2>
      <p className="mt-1 text-sm text-gray-600">Your owner and teammates see these details.</p>

      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-gray-500">Role</dt>
          <dd className="mt-1 text-sm font-medium text-black">Store Manager</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Store</dt>
          <dd className="mt-1 text-sm font-medium text-black">
            {saved.storeName ?? <span className="font-normal text-gray-500">Not assigned yet</span>}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Account</dt>
          <dd className="mt-1 text-sm font-medium capitalize text-black">{saved.status}</dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <TextField
          full
          label="Full name"
          name="profile-name"
          icon={User}
          value={draft.name}
          onChange={set("name")}
          error={errors.name}
          autoComplete="name"
          maxLength={80}
        />
        <TextField
          label="Email"
          name="profile-email"
          type="email"
          icon={Mail}
          value={saved.email}
          readOnly
          hint="This is your sign-in email. Ask your owner if it needs to change."
        />
        <TextField
          label="Phone"
          name="profile-phone"
          type="tel"
          icon={Phone}
          optional
          value={draft.phone}
          onChange={set("phone")}
          error={errors.phone}
          autoComplete="tel"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={!dirty || saving} aria-busy={saving} className={primaryBtn}>
          {saving && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          {saving ? "Saving..." : "Save profile"}
        </button>
        {dirty && !saving && (
          <>
            <button type="button" onClick={discard} className={outlineBtn}>
              Discard changes
            </button>
            <p className="text-[13px] text-gray-600">You have unsaved changes.</p>
          </>
        )}
      </div>
    </form>
  );
}