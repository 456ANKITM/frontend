import type { Metadata } from "next";
import AuthLayout from "@/components/authSpecific/AuthLayout";
import ForgotPasswordForm from "@/components/authSpecific/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | ERP System",
  description: "Request instructions to reset the password for your ERP account.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}