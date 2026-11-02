import { AdminApiError } from "@/dummy/adminDashboard";
import type {
  ActivityEntry,
  Business,
  BusinessListData,
  BusinessListQuery,
  BusinessPlan,
  BusinessStatus,
} from "@/types/admin";

type Scenario = "ok" | "empty" | "forbidden" | "session" | "network";
// Change this to preview each list state: "ok" | "empty" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;
// Set to true to preview a failed suspend/activate request in the confirm dialog.
const FAIL_STATUS_UPDATE = false;

const biz = (
  id: number,
  name: string,
  ownerName: string,
  plan: BusinessPlan,
  status: BusinessStatus,
  storeCount: number,
  createdAt: string,
): Business => ({
  id: `b_${id}`,
  name,
  ownerName,
  ownerEmail: `${ownerName.toLowerCase().replace(/\s+/g, ".")}@${name.toLowerCase().replace(/[^a-z]+/g, "")}.com`,
  plan,
  status,
  storeCount,
  createdAt,
});

// In-memory store so suspend/activate visibly works while we are UI-only.
const DB: Business[] = [
  biz(101, "Himalayan Mart", "Sita Sharma", "starter", "trial", 1, "2026-10-06"),
  biz(102, "Everest Electronics", "Rajan Thapa", "growth", "active", 3, "2026-10-04"),
  biz(103, "Lumbini Fresh Foods", "Anita Gurung", "growth", "active", 4, "2026-10-01"),
  biz(104, "Patan Stationery", "Bikash Shrestha", "starter", "suspended", 1, "2026-09-27"),
  biz(105, "Pokhara Home Needs", "Maya Rai", "starter", "trial", 1, "2026-09-24"),
  biz(106, "Bhaktapur Hardware", "Dipesh Karki", "growth", "active", 2, "2026-09-19"),
  biz(107, "Annapurna Pharmacy", "Kabita Adhikari", "enterprise", "active", 9, "2026-09-12"),
  biz(108, "Kathmandu Kitchenware", "Suman Joshi", "growth", "suspended", 2, "2026-09-05"),
  biz(109, "Chitwan Agro Supplies", "Prakash Bhandari", "enterprise", "active", 7, "2026-08-29"),
  biz(110, "Janakpur Garments", "Sunita Mahato", "starter", "active", 1, "2026-08-21"),
  biz(111, "Biratnagar Books", "Nabin Khanal", "starter", "trial", 1, "2026-08-14"),
  biz(112, "Dharan Sports Hub", "Roshan Limbu", "growth", "active", 3, "2026-08-02"),
  biz(113, "Butwal Mobile Zone", "Asmita Pandey", "growth", "suspended", 2, "2026-07-25"),
  biz(114, "Hetauda Grocery Chain", "Gopal Neupane", "enterprise", "active", 12, "2026-07-11"),
  biz(115, "Nepalgunj Medical Store", "Sarita Yadav", "starter", "active", 1, "2026-06-30"),
  biz(116, "Dhulikhel Organics", "Tshering Sherpa", "starter", "trial", 1, "2026-06-18"),
  biz(117, "Itahari Auto Parts", "Binod Magar", "growth", "active", 2, "2026-06-03"),
  biz(118, "Lalitpur Furniture", "Rina Maharjan", "growth", "active", 3, "2026-05-20"),
];

// Status changes made in this session, so the detail page's activity log shows them.
const LOG: Record<string, ActivityEntry[]> = {};

export const findBusiness = (id: string) => DB.find((b) => b.id === id) ?? null;
export const getStatusLog = (id: string): ActivityEntry[] => LOG[id] ?? [];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO(integration): replace with
// GET /api/v1/businesses?search=&status=&plan=&page=&limit=
// (Super Admin only). Filtering, sorting and pagination must happen on the backend.
export async function fetchBusinesses(query: BusinessListQuery): Promise<BusinessListData> {
  await wait(700);

  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    throw new AdminApiError(SCENARIO);
  }

  const source = SCENARIO === "empty" ? [] : DB;
  const term = query.search.trim().toLowerCase();

  const filtered = source
    .filter((b) => query.status === "all" || b.status === query.status)
    .filter((b) => query.plan === "all" || b.plan === query.plan)
    .filter(
      (b) =>
        !term ||
        b.name.toLowerCase().includes(term) ||
        b.ownerName.toLowerCase().includes(term) ||
        b.ownerEmail.toLowerCase().includes(term),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const start = (query.page - 1) * query.pageSize;
  return {
    items: filtered.slice(start, start + query.pageSize),
    total: filtered.length,
    page: query.page,
    pageSize: query.pageSize,
  };
}

// TODO(integration): replace with PATCH /api/v1/businesses/:id/status  { status }
export async function updateBusinessStatus(id: string, status: BusinessStatus): Promise<Business> {
  await wait(600);
  if (FAIL_STATUS_UPDATE) throw new Error("Status update failed");
  const row = DB.find((b) => b.id === id);
  if (!row) throw new Error("Business not found");
  row.status = status;
  (LOG[id] ??= []).push({
    id: `log_${Date.now()}`,
    type: status === "active" ? "activated" : "suspended",
    message: status === "active" ? "Business activated" : "Business suspended",
    actor: "Super Admin",
    at: new Date().toISOString(),
  });
  return { ...row };
}