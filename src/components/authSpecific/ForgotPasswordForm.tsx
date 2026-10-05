"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Info, Mail } from "lucide-react";
import LoadingButton from "@/components/common/LoadingButton";
import TextField from "@/components/common/TextField";
import AuthNotice from "./AuthNotice";
import RecoverySuccessState from "./RecoverySuccessState";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/schema/recoverySchema";

export default function ForgotPasswordForm() {
  const [failure, setFailure] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setFailure(null);
    try {
      // TODO(integration): replace with POST /api/v1/auth/forgot-password
      // Always show the same generic success, whether or not the account exists.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSentTo(values.email);
    } catch {
      // Rate limit: "Too many requests. Please wait and try again."
      setFailure("We couldn't process your request right now. Please try again.");
    }
  };

  if (sentTo) return <RecoverySuccessState email={sentTo} onReset={() => setSentTo(null)} />;

  return (
    <div>
      <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
        Reset your password
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
        Enter the email address associated with your ERP account and we&apos;ll send instructions to
        reset your password.
      </p>

      <AuthNotice message={failure} />

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        <TextField
          label="Email address"
          type="email"
          icon={Mail}
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={254}
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <LoadingButton type="submit" loading={isSubmitting} loadingLabel="Sending...">
          Send reset instructions
        </LoadingButton>

        <p role="status" className="sr-only">
          {isSubmitting ? "Sending..." : ""}
        </p>
      </form>

      <hr className="my-5 border-gray-200" />

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 rounded text-sm font-semibold text-black outline-none hover:underline focus-visible:ring-4 focus-visible:ring-black/20"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to login
      </Link>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-[13px] leading-snug text-gray-600">
        <Info className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
        <span>For your security, we send the same message whether or not an account exists.</span>
      </p>
    </div>
  );
}