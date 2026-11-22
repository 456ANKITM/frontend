import type { Metadata } from "next";
import ManagerSettingsView from "@/components/managerSpecific/ManagerSettingsView";

export const metadata: Metadata = {
  title: "Settings",
  description: "Your profile, password and your store's receipt settings.",
};

export default function ManagerSettingsPage() {
  return <ManagerSettingsView />;
}