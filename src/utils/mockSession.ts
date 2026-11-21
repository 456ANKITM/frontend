import type { Role } from "./roleRedirect";

/**
 * UI-ONLY stand-in for a real session. Delete when auth is wired up: the role must come from
 * the backend (GET /api/v1/auth/me) and be verified on the server, never trusted from the browser.
 */
const KEY = "erp.mockRole";
const listeners = new Set<() => void>();

const isRole = (v: unknown): v is Role => v === "owner" || v === "store_manager" || v === "super_admin";

export function getMockRole(): Role | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return isRole(v) ? v : null;
  } catch {
    return null;
  }
}

export function setMockRole(role: Role) {
  try {
    window.localStorage.setItem(KEY, role);
  } catch {
    /* storage can be unavailable; the app falls back to the Owner view */
  }
  listeners.forEach((l) => l());
}

export function clearMockRole() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function subscribeMockRole(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback); // other tabs
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}