"use client";

import { useState, type ChangeEvent } from "react";
import { Building2, Loader2, Mail, MapPin, Phone } from "lucide-react";
import TextField from "@/components/common/TextField";
import FieldError from "@/components/common/FieldError";
import type { ToastState } from "@/components/ui/Toast";
import { card, outlineBtn, primaryBtn } from "./settingStyles";
import { SettingsApiError } from "@/dummy/ownerSettings";
import { LOGO_TYPES, MAX_LOGO_BYTES } from "@/config/settings";
import { validateProfile, type ProfileErrors } from "@/utils/settings";
import type { BusinessSettings, BusinessSettingsPayload } from "@/types/settings";

type Props = {
  saved: BusinessSettings;
  onSave: (payload: BusinessSettingsPayload) => Promise<void>;
  onNotify: (toast: ToastState) => void;
};

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const FIELD_IDS: [keyof ProfileErrors, string][] = [
  ["name", "business-name"],
  ["contactEmail", "contact-email"],
  ["contactPhone", "contact-phone"],
  ["address", "business-address"],
];

export default function BusinessProfileForm({ saved, onSave, onNotify }: Props) {
  const [draft, setDraft] = useState({
    name: saved.name,
    contactEmail: saved.contactEmail,
    contactPhone: saved.contactPhone,
    address: saved.address,
  });
  const [logo, setLogo] = useState<string | null>(saved.logoUrl);
  const [logoError, setLogoError] = useState<string | undefined>();
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);

  const trimmed = {
    name: draft.name.trim(),
    contactEmail: draft.contactEmail.trim(),
    contactPhone: draft.contactPhone.trim(),
    address: draft.address.trim(),
  };
  const dirty =
    trimmed.name !== saved.name ||
    trimmed.contactEmail !== saved.contactEmail ||
    trimmed.contactPhone !== saved.contactPhone ||
    trimmed.address !== saved.address ||
    logo !== saved.logoUrl;

  const set = (key: keyof typeof draft) => (e: ChangeEvent<HTMLInputElement>) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleLogo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be chosen again
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) {
      setLogoError("Use a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("The image must be 2 MB or smaller.");
      return;
    }
    try {
      setLogo(await readAsDataUrl(file));
      setLogoError(undefined);
    } catch {
      setLogoError("We couldn't read that image. Try another file.");
    }
  };

  const discard = () => {
    setDraft({
      name: saved.name,
      contactEmail: saved.contactEmail,
      contactPhone: saved.contactPhone,
      address: saved.address,
    });
    setLogo(saved.logoUrl);
    setLogoError(undefined);
    setErrors({});
  };

  const handleSubmit = async () => {
    const found = validateProfile(trimmed);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      const first = FIELD_IDS.find(([key]) => found[key]);
      if (first) document.getElementById(first[1])?.focus();
      return;
    }

    setSaving(true);
    try {
      await onSave({ ...trimmed, logoUrl: logo });
      setErrors({});
      onNotify({ type: "success", message: "Business profile saved." });
    } catch (err) {
      if (err instanceof SettingsApiError && err.fieldErrors) {
        const fe = err.fieldErrors;
        setErrors({
          name: fe.name,
          contactEmail: fe.contactEmail,
          contactPhone: fe.contactPhone,
          address: fe.address,
          logoUrl: fe.logoUrl,
        });
      }
      onNotify({ type: "error", message: "We couldn't save your business profile. Check the form and try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      noValidate
      aria-labelledby="profile-title"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className={card}
    >
      <h2 id="profile-title" className="text-[15px] font-semibold text-black">
        Business profile
      </h2>
      <p className="mt-1 text-sm text-gray-600">Shown on your invoices and to your Store Managers.</p>

      <div className="mt-5 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-300 bg-gray-50 text-gray-500">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="Current business logo" className="h-full w-full object-contain" />
          ) : (
            <Building2 className="h-6 w-6" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-black">Logo</p>
          <p className="mt-0.5 text-[13px] text-gray-500">PNG, JPG or WebP, up to 2 MB.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <label className={`${outlineBtn} cursor-pointer has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-black/20`}>
              <input
                type="file"
                accept={LOGO_TYPES.join(",")}
                onChange={(e) => void handleLogo(e)}
                aria-describedby={logoError || errors.logoUrl ? "logo-error" : undefined}
                className="sr-only"
              />
              {logo ? "Change logo" : "Upload logo"}
            </label>
            {logo && (
              <button
                type="button"
                onClick={() => {
                  setLogo(null);
                  setLogoError(undefined);
                }}
                className={outlineBtn}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
      <FieldError id="logo-error" message={logoError ?? errors.logoUrl} />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <TextField
          full
          label="Business name"
          name="business-name"
          icon={Building2}
          value={draft.name}
          onChange={set("name")}
          error={errors.name}
          autoComplete="organization"
          maxLength={80}
        />
        <TextField
          label="Contact email"
          name="contact-email"
          type="email"
          icon={Mail}
          value={draft.contactEmail}
          onChange={set("contactEmail")}
          error={errors.contactEmail}
          autoComplete="email"
        />
        <TextField
          label="Contact phone"
          name="contact-phone"
          type="tel"
          icon={Phone}
          optional
          value={draft.contactPhone}
          onChange={set("contactPhone")}
          error={errors.contactPhone}
          autoComplete="tel"
        />
        <TextField
          full
          label="Address"
          name="business-address"
          icon={MapPin}
          optional
          value={draft.address}
          onChange={set("address")}
          error={errors.address}
          autoComplete="street-address"
          maxLength={200}
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