"use client";

import { useSyncExternalStore } from "react";
import { getMockRole, subscribeMockRole } from "@/utils/mockSession";
import type { Role } from "@/utils/roleRedirect";

// null on the server and when nobody has "logged in" yet (the UI then falls back to the Owner view).
export function useMockRole(): Role | null {
  return useSyncExternalStore(subscribeMockRole, getMockRole, () => null);
}