import type { Metadata } from "next";
import StaffList from "@/components/ownerSpecific/StaffList";

export const metadata: Metadata = {
  title: "Staff",
  description: "Invite Store Managers, assign them to stores and control who can sign in.",
};

export default function OwnerStaffPage() {
  return <StaffList />;
}