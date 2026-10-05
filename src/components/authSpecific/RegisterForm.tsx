"use client";

import { useState } from "react";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import LoadingButton from "@/components/common/LoadingButton";
import OwnerInformationSection from "./OwnerInformationSection";
import BusinessInformationSection from "./BusinessInformationSection";
import ContactInformationSection from "./ContactInformationSection";
import PasswordSection from "./PasswordSection";
import TermsConsent from "./TermsConsent";
import RegisterAlert, { type RegisterFailure } from "./RegisterAlert";
import RegisterSuccess from "./RegisterSuccess";
import { registerSchema, type RegisterValues } from "@/schema/registerSchema";
import { BUSINESS_DEFAULTS } from "@/config/businessDefaults";

export default function RegisterForm() {
  const [failure, setFailure] = useState<RegisterFailure | null>(null);
  const [success, setSuccess] = useState(false);

  const methods = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched", // validate after leaving a field, not on every keystroke
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      businessName: "",
      businessEmail: "",
      businessPhone: "",
      country: BUSINESS_DEFAULTS.country,
      currency: BUSINESS_DEFAULTS.currency,
      timezone: BUSINESS_DEFAULTS.timezone,
      fiscalYearStart: BUSINESS_DEFAULTS.fiscalYearStart,
      addressLine: "",
      city: "",
      state: "",
      postalCode: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const {
    handleSubmit,
    resetField,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (values: RegisterValues) => {
    setFailure(null);
    try {
      // TODO(integration): replace with POST /api/v1/auth/register-business
      // Send only the fields the backend contract expects (never role or businessId).
      void values;
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess(true);
    } catch {
      setFailure({ kind: "network" });
      // Keep non-sensitive fields; clear only passwords.
      resetField("password");
      resetField("confirmPassword");
    }
  };

  if (success) return <RegisterSuccess />;

  return (
    <div>
      <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
        Create your business account
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
        Set up your ERP workspace and start managing your stores, inventory, sales and operations in
        one place.
      </p>

      <RegisterAlert failure={failure} />

      <FormProvider {...methods}>
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-7">
          <OwnerInformationSection />
          <BusinessInformationSection />
          <ContactInformationSection />
          <PasswordSection />
          <TermsConsent />

          <LoadingButton type="submit" loading={isSubmitting} loadingLabel="Creating account...">
            Create business account
          </LoadingButton>

          <p role="status" className="sr-only">
            {isSubmitting ? "Creating account..." : ""}
          </p>
        </form>
      </FormProvider>

      <hr className="my-6 border-gray-200" />

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="rounded font-semibold text-black outline-none hover:underline focus-visible:ring-4 focus-visible:ring-black/20"
        >
          Sign in
        </Link>
      </p>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-[13px] leading-snug text-gray-600">
        <Info className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
        <span>You can invite store managers after your workspace is created.</span>
      </p>
    </div>
  );
}