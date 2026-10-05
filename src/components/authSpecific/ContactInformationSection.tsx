"use client";

import { useFormContext } from "react-hook-form";
import { MapPin } from "lucide-react";
import FormSection from "@/components/common/FormSection";
import TextField from "@/components/common/TextField";
import type { RegisterValues } from "@/schema/registerSchema";

export default function ContactInformationSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegisterValues>();

  return (
    <FormSection step={3} title="Business address" description="Optional. You can add or change this later.">
      <TextField
        label="Address"
        icon={MapPin}
        optional
        autoComplete="address-line1"
        placeholder="Street, area"
        error={errors.addressLine?.message}
        full
        {...register("addressLine")}
      />
      <TextField
        label="City"
        optional
        autoComplete="address-level2"
        error={errors.city?.message}
        {...register("city")}
      />
      <TextField
        label="State / Province"
        optional
        autoComplete="address-level1"
        error={errors.state?.message}
        {...register("state")}
      />
      <TextField
        label="Postal code"
        optional
        autoComplete="postal-code"
        error={errors.postalCode?.message}
        {...register("postalCode")}
      />
    </FormSection>
  );
}