export type Role = "owner" | "store_manager" | "super_admin";

// The role must come from the backend response, never from client input.
export function getRoleDestination(role: Role): string {
  switch (role) {
    case "super_admin":
      return "/admin/dashboard";
    case "store_manager":
      return "/manager/dashboard";
    case "owner":
    default:
      return "/dashboard";
  }
}