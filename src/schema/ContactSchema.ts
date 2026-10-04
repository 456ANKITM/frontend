import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  businessName: z
    .string()
    .trim()
    .max(150, "Business name is too long")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  storeCount: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || (Number.isInteger(Number(value)) && Number(value) > 0),
      "Enter a whole number greater than 0"
    ),
  message: z.string().trim().max(2000, "Message is too long").optional().or(z.literal("")),
  // Honeypot: must stay empty. Real users never see or fill this field.
  website: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const contactFormDefaults: ContactFormValues = {
  name: "",
  businessName: "",
  email: "",
  phone: "",
  storeCount: "",
  message: "",
  website: "",
};