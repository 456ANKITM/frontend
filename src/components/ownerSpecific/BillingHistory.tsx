import { PaymentBadge } from "./PurchasesTable";
import { card } from "./settingStyles";
import { formatDay } from "@/utils/localDate";
import { formatPlanAmount } from "@/utils/settings";
import type { Invoice } from "@/types/settings";

const TH = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-600";
const TD = "px-4 py-3.5 align-middle";

type Props = { invoices: Invoice[]; billingCurrency: string };

export default function BillingHistory({ invoices, billingCurrency }: Props) {
  return (
    <section aria-labelledby="billing-title" className={card}>
      <h2 id="billing-title" className="text-[15px] font-semibold text-black">
        Billing history
      </h2>

      {invoices.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-600">
          No invoices yet. Your first invoice appears when your trial ends.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-300">
          <table className="w-full min-w-[640px] text-sm">
            <caption className="sr-only">Subscription invoices</caption>
            <thead className="border-b border-gray-300 bg-gray-50">
              <tr>
                <th scope="col" className={TH}>Invoice</th>
                <th scope="col" className={TH}>Date</th>
                <th scope="col" className={TH}>Description</th>
                <th scope="col" className={`${TH} text-right`}>Amount</th>
                <th scope="col" className={TH}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="transition-colors hover:bg-gray-50">
                  <td className={`${TD} font-medium text-black`}>{inv.number}</td>
                  <td className={`${TD} text-gray-900`}>{formatDay(inv.date)}</td>
                  <td className={`${TD} text-gray-700`}>{inv.description}</td>
                  <td className={`${TD} text-right font-medium tabular-nums text-black`}>
                    {formatPlanAmount(inv.amount, billingCurrency)}
                  </td>
                  <td className={TD}>
                    <PaymentBadge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}