"use client";

import { useFormContext } from "react-hook-form";
import { Building2, Mail, Phone } from "lucide-react";
import FormSection from "@/components/common/FormSection";
import TextField from "@/components/common/TextField";
import SelectField from "@/components/common/SelectedField";
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/config/businessDefaults";
import type { RegisterValues } from "@/schema/registerSchema";

export default function BusinessInformationSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegisterValues>();

  return (
    <FormSection step={2} title="Business information" description="Review the regional defaults for your business.">
      <TextField
        label="Business name"
        icon={Building2}
        autoComplete="organization"
        maxLength={100}
        placeholder="Your business name"
        error={errors.businessName?.message}
        full
        {...register("businessName")}
      />
      <TextField
        label="Business email"
        type="email"
        icon={Mail}
        optional
        autoComplete="off"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="info@business.com"
        error={errors.businessEmail?.message}
        {...register("businessEmail")}
      />
      <TextField
        label="Business phone"
        type="tel"
        icon={Phone}
        optional
        autoComplete="off"
        inputMode="tel"
        placeholder="+977 01XXXXXXX"
        error={errors.businessPhone?.message}
        {...register("businessPhone")}
      />
      <SelectField
        label="Country"
        options={COUNTRY_OPTIONS}
        error={errors.country?.message}
        {...register("country")}
      />
      <SelectField
        label="Currency"
        options={CURRENCY_OPTIONS}
        error={errors.currency?.message}
        {...register("currency")}
      />
      <SelectField
        label="Timezone"
        options={TIMEZONE_OPTIONS}
        error={errors.timezone?.message}
        {...register("timezone")}
      />
      <TextField
        label="Fiscal year start"
        placeholder="MM-DD"
        maxLength={5}
        hint="Month and day, e.g. 07-16."
        error={errors.fiscalYearStart?.message}
        {...register("fiscalYearStart")}
      />
    </FormSection>
  );
}