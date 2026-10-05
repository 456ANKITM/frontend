export type Role = "owner" | "store_manager" | "super_admin";

// The role must come from the backend response, never from client input.
export function getRoleDestination(role: Role): string {
  switch (role) {
    case "super_admin":
      return "/admin/dashboard";
    case "owner":
    case "store_manager":
    default:
      return "/dashboard";
  }
}