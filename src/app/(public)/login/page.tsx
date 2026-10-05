import type { Metadata } from "next";
import AuthLayout from "@/components/authSpecific/AuthLayout";
import LoginForm from "@/components/authSpecific/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Securely sign in to manage your business, stores, inventory, sales and reports.",
  // Auth pages are not search landing pages. Adjust to your SEO policy.
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  // TODO(integration): if a valid session already exists, redirect to the
  // role-based dashboard here (server side) instead of rendering the form.
  return (
    <>
    
       <AuthLayout>
      <LoginForm />
    </AuthLayout>
    
    </>
  
  );
}