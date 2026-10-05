import type { Role } from "./roleRedirect";

/**
 * UI-ONLY stand-in. Delete when POST /api/v1/auth/login is wired up.
 * Try in the form (any password except "wrong"):
 *   admin@...     -> Super Admin       disabled@...  -> account disabled
 *   suspended@... -> business suspended limit@...     -> rate limited (30s)
 *   offline@...   -> network error     password "wrong" -> invalid credentials
 *   anything else -> Owner
 */

export type AuthFailure =
  | { kind: "invalid" }
  | { kind: "disabled" }
  | { kind: "businessSuspended" }
  | { kind: "rateLimited"; retryAfterSeconds?: number }
  | { kind: "network" };

export class AuthFailureError extends Error {
  failure: AuthFailure;
  constructor(failure: AuthFailure) {
    super(failure.kind);
    this.failure = failure;
  }
}

export async function mockLogin(email: string, password: string): Promise<{ role: Role }> {
  await new Promise((r) => setTimeout(r, 900));

  if (email.startsWith("offline@")) throw new AuthFailureError({ kind: "network" });
  if (email.startsWith("limit@"))
    throw new AuthFailureError({ kind: "rateLimited", retryAfterSeconds: 30 });
  if (email.startsWith("disabled@")) throw new AuthFailureError({ kind: "disabled" });
  if (email.startsWith("suspended@")) throw new AuthFailureError({ kind: "businessSuspended" });
  if (password === "wrong") throw new AuthFailureError({ kind: "invalid" });

  return { role: email.startsWith("admin@") ? "super_admin" : "owner" };
}