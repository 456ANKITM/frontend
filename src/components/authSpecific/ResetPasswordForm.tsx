"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import LoadingButton from "@/components/common/LoadingButton";
import PasswordInput from "@/components/common/PasswordInput";
import AuthNotice from "./AuthNotice";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import ResetTokenErrorState from "./ResetTokenErrorState";
import ResetSuccessState from "./ResetSuccessState";
import { resetPasswordSchema, type ResetPasswordValues } from "@/schema/recoverySchema";

// TODO(integration): replace with POST /api/v1/auth/reset-password { token, newPassword }
// Demo only: open /reset-password?token=expired to preview the invalid-link state.
async function mockResetPassword(token: string, _password: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (token === "expired") throw new Error("TOKEN_INVALID");
}

export default function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = watch("password");

  if (!token || tokenInvalid) return <ResetTokenErrorState />;
  if (done) return <ResetSuccessState />;

  const onSubmit = async (values: ResetPasswordValues) => {
    setFailure(null);
    try {
      await mockResetPassword(token, values.password);
      setDone(true);
    } catch (err) {
      if (err instanceof Error && err.message === "TOKEN_INVALID") {
        setTokenInvalid(true);
        return;
      }
      // Policy failure: "Your new password does not meet the password requirements."
      setFailure("We couldn't reset your password. Please try again.");
      resetField("password");
      resetField("confirmPassword");
    }
  };

  return (
    <div>
      <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
        Create a new password
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
        Choose a strong password you haven&apos;t used before.
      </p>

      <AuthNotice message={failure} />

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        <PasswordInput
          label="New password"
          placeholder="Create a new password"
          maxLength={72}
          error={errors.password?.message}
          {...register("password")}
        >
          <PasswordStrengthIndicator password={password ?? ""} />
        </PasswordInput>

        <PasswordInput
          label="Confirm new password"
          placeholder="Re-enter your new password"
          maxLength={72}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <LoadingButton type="submit" loading={isSubmitting} loadingLabel="Resetting...">
          Reset password
        </LoadingButton>

        <p role="status" className="sr-only">
          {isSubmitting ? "Resetting your password..." : ""}
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
    </div>
  );
}