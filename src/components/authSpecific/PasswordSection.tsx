"use client";

import { useFormContext } from "react-hook-form";
import FormSection from "@/components/common/FormSection";
import PasswordInput from "@/components/common/PasswordInput";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import type { RegisterValues } from "@/schema/registerSchema";

export default function PasswordSection() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<RegisterValues>();
  const password = watch("password");

  return (
    <FormSection step={4} title="Password">
      <PasswordInput
        label="Password"
        placeholder="Create a password"
        maxLength={72}
        error={errors.password?.message}
        {...register("password")}
      >
        <PasswordStrengthIndicator password={password ?? ""} />
      </PasswordInput>
      <PasswordInput
        label="Confirm password"
        placeholder="Re-enter your password"
        maxLength={72}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
    </FormSection>
  );
}