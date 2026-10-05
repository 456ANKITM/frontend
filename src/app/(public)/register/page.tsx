import type { Metadata } from "next";
import AuthLayout from "@/components/authSpecific/AuthLayout";
import RegisterForm from "@/components/authSpecific/RegisterForm";

export const metadata: Metadata = {
  title: "Create Your Business Account | ERP System",
  description:
    "Create your ERP business workspace to manage stores, inventory, sales, purchases and reports.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <AuthLayout wide>
      <RegisterForm />
    </AuthLayout>
  );
}