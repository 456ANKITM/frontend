import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "@/config/businessDefaults";

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{7,15}$/, "Enter a valid phone number");

export const registerSchema = z
  .object({
    // Owner
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(80, "Name is too long"),
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address")
      .max(254)
      .email("Enter a valid email address"),
    phone,

    // Business
    businessName: z
      .string()
      .trim()
      .min(2, "Enter your business name")
      .max(100, "Business name is too long"),
    businessEmail: z
      .string()
      .trim()
      .max(254)
      .email("Enter a valid email address")
      .or(z.literal("")),
    businessPhone: phone.or(z.literal("")),
    country: z.string().min(1, "Select a country"),
    currency: z.string().min(1, "Select a currency"),
    timezone: z.string().min(1, "Select a timezone"),
    fiscalYearStart: z
      .string()
      .trim()
      .regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, "Use MM-DD format, e.g. 07-16"),

    // Address
    addressLine: z.string().trim().max(150).optional().or(z.literal("")),
    city: z.string().trim().max(80).optional().or(z.literal("")),
    state: z.string().trim().max(80).optional().or(z.literal("")),
    postalCode: z.string().trim().max(20).optional().or(z.literal("")),

    // Security
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
      .max(72, "Password is too long")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Confirm your password"),

    // Consent
    terms: z.boolean().refine((v) => v === true, {
      message: "You must agree to continue",
    }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;