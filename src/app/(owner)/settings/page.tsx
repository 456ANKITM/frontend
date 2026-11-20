import type { Metadata } from "next";
import SettingsView from "@/components/ownerSpecific/SettingsView";

export const metadata: Metadata = {
  title: "Settings",
  description: "Your business profile, currency and tax settings, and subscription.",
};

export default function OwnerSettingsPage() {
  return <SettingsView />;
}