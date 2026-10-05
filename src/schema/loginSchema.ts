import { z } from "zod";

export const loginSchema = z.object({
  // Trim + lowercase to match backend normalization. Adjust if it differs.
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your email address.")
    .max(254, "Email address is too long.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.").max(256, "Enter your password."),
  remember: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;