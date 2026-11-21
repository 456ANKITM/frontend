import { getManagers } from "@/dummy/ownerStaff";

// TODO(integration): the signed-in manager comes from GET /api/v1/auth/me (user.id, user.storeId).
// Until then the manager pages use this dummy manager (Hari Basnet).
export const CURRENT_MANAGER_ID = "u_1";

export const getCurrentManager = () => getManagers().find((m) => m.id === CURRENT_MANAGER_ID) ?? null;