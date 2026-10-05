"use client";

import { useFormContext } from "react-hook-form";
import { Mail, Phone, User } from "lucide-react";
import FormSection from "@/components/common/FormSection";
import TextField from "@/components/common/TextField";
import type { RegisterValues } from "@/schema/registerSchema";

export default function OwnerInformationSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegisterValues>();

  return (
    <FormSection step={1} title="Owner information" description="You'll be the Owner of this workspace.">
      <TextField
        label="Full name"
        icon={User}
        autoComplete="name"
        maxLength={80}
        placeholder="Your full name"
        error={errors.fullName?.message}
        full
        {...register("fullName")}
      />
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
        hint="Used to sign in and recover your account."
        error={errors.email?.message}
        {...register("email")}
      />
      <TextField
        label="Phone number"
        type="tel"
        icon={Phone}
        autoComplete="tel"
        inputMode="tel"
        placeholder="+977 98XXXXXXXX"
        error={errors.phone?.message}
        {...register("phone")}
      />
    </FormSection>
  );
}