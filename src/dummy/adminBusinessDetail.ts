import { AdminApiError } from "@/dummy/adminDashboard";
import { findBusiness, getStatusLog } from "@/dummy/adminBusinesses";
import { PLAN_LABEL } from "@/config/admin";
import type { ActivityEntry, BusinessDetailData, StoreSummary } from "@/types/admin";

type Scenario = "ok" | "forbidden" | "session" | "network";
// Change this to preview each state: "ok" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;

const CITIES = [
  "Kathmandu", "Lalitpur", "Pokhara", "Bhaktapur", "Biratnagar", "Butwal",
  "Dharan", "Chitwan", "Hetauda", "Itahari", "Janakpur", "Nepalgunj",
];
const MANAGERS = [
  "Hari Basnet", "Sabina Tamang", "Krishna Oli", "Pooja Khadka", "Narayan Acharya",
  "Laxmi Dahal", "Sanjay Chaudhary", "Nisha Poudel", "Bipin Regmi", "Rupa Ghimire",
];

// Builds an ISO date-time `days` after a start date, never later than now.
const when = (startDate: string, days: number, hour = 10) => {
  const d = new Date(`${startDate}T${String(hour).padStart(2, "0")}:15:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return new Date(Math.min(d.getTime(), Date.now())).toISOString();
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO(integration): replace with GET /api/v1/businesses/:id (business, owner and stores)
// plus a Super Admin activity feed for the tenant. The activity log has no endpoint in the
// API docs yet, so it must be added there first. Return null (or a 404) for unknown ids.
export async function fetchBusinessDetail(id: string): Promise<BusinessDetailData | null> {
  await wait(700);

  if (SCENARIO !== "ok") throw new AdminApiError(SCENARIO);

  const business = findBusiness(id);
  if (!business) return null;

  const n = Number(id.replace(/\D/g, "")) || 1;
  const suspended = business.status === "suspended";

  const stores: StoreSummary[] = Array.from({ length: business.storeCount }, (_, i) => {
    const city = CITIES[(n + i) % CITIES.length];
    return {
      id: `s_${n}_${i + 1}`,
      name: i === 0 ? "Main store" : `${city} branch`,
      location: `${city}, Nepal`,
      managerName: (n + i) % 5 === 0 ? null : MANAGERS[(n * 3 + i) % MANAGERS.length],
      status: suspended || (n + i) % 7 === 6 ? "inactive" : "active",
      createdAt: when(business.createdAt, i * 9 + 1).slice(0, 10),
    };
  });

  const entries: ActivityEntry[] = [
    {
      id: "a_reg",
      type: "registered",
      message: business.status === "trial" ? "Registered and started a free trial" : "Registered on the platform",
      actor: business.ownerName,
      at: when(business.createdAt, 0, 9),
    },
    ...stores.map((s, i): ActivityEntry => ({
      id: `a_store_${s.id}`,
      type: "store_created",
      message: `Created ${s.name} (${s.location})`,
      actor: business.ownerName,
      at: when(business.createdAt, i * 9 + 1, 11),
    })),
    ...stores
      .filter((s) => s.managerName)
      .map((s, i): ActivityEntry => ({
        id: `a_mgr_${s.id}`,
        type: "manager_invited",
        message: `Invited ${s.managerName} as Store Manager of ${s.name}`,
        actor: business.ownerName,
        at: when(business.createdAt, i * 9 + 2, 14),
      })),
    ...(business.plan !== "starter"
      ? [{
          id: "a_plan",
          type: "plan_changed" as const,
          message: `Upgraded to the ${PLAN_LABEL[business.plan]} plan`,
          actor: business.ownerName,
          at: when(business.createdAt, 14, 16),
        }]
      : []),
    ...getStatusLog(id),
  ];

  const activity = entries.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);

  return {
    business,
    contactEmail: business.ownerEmail,
    contactPhone: `+977 1 ${String(4000000 + ((n * 131) % 999999)).slice(0, 7)}`,
    address: `Ward ${(n % 32) + 1}, ${CITIES[n % CITIES.length]}, Nepal`,
    ownerPhone: `+977 98${String(10000000 + ((n * 7919) % 89999999))}`,
    ownerLastLoginAt: suspended ? null : new Date(Date.now() - ((n % 6) + 1) * 3_600_000 * 7).toISOString(),
    stores,
    activity,
    updatedAt: new Date().toISOString(),
  };
}