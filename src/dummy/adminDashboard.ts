import type {
  AdminErrorKind,
  DashboardData,
  GrowthPoint,
  GrowthRange,
} from "@/types/admin";

export class AdminApiError extends Error {
  kind: AdminErrorKind;
  constructor(kind: AdminErrorKind) {
    super(kind);
    this.kind = kind;
  }
}

type Scenario = "ok" | "empty" | "forbidden" | "session" | "network";
// Change this to preview each state: "ok" | "empty" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildGrowth(range: GrowthRange): GrowthPoint[] {
  const now = new Date();

  if (range === "12m") {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { label: MONTHS[d.getMonth()], count: 18 + ((i * 5) % 11) + i };
    });
  }

  const { n, step } = { "7d": { n: 7, step: 1 }, "30d": { n: 30, step: 1 }, "90d": { n: 13, step: 7 } }[range];

  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (n - 1 - i) * step);
    return {
      label: `${MONTHS[d.getMonth()]} ${d.getDate()}`,
      count: ((i * 7 + 3) % 9) + (step === 7 ? 8 : 1),
    };
  });
}

// TODO(integration): replace with GET /api/v1/admin/dashboard?range=<range>
// (a dedicated aggregate endpoint; it must be added to the API docs first).
// Totals must be calculated by the backend, never from cached business lists.
export async function fetchAdminDashboard(range: GrowthRange): Promise<DashboardData> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    throw new AdminApiError(SCENARIO);
  }

  if (SCENARIO === "empty") {
    return {
      summary: { total: 0, active: 0, suspended: 0, trial: 0 },
      growth: [],
      recent: [],
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    summary: { total: 248, active: 192, trial: 38, suspended: 18 },
    growth: buildGrowth(range),
    recent: [
      { id: "b_101", name: "Himalayan Mart", ownerName: "Sita Sharma", status: "trial", createdAt: "2026-10-06" },
      { id: "b_102", name: "Everest Electronics", ownerName: "Rajan Thapa", status: "active", createdAt: "2026-10-04" },
      { id: "b_103", name: "Lumbini Fresh Foods", ownerName: "Anita Gurung", status: "active", createdAt: "2026-10-01" },
      { id: "b_104", name: "Patan Stationery", ownerName: "Bikash Shrestha", status: "suspended", createdAt: "2026-09-27" },
      { id: "b_105", name: "Pokhara Home Needs", ownerName: "Maya Rai", status: "trial", createdAt: "2026-09-24" },
      { id: "b_106", name: "Bhaktapur Hardware", ownerName: "Dipesh Karki", status: "active", createdAt: "2026-09-19" },
    ],
    updatedAt: new Date().toISOString(),
  };
}