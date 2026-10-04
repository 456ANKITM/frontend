export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: "Can I manage more than one store?",
    answer:
      "Yes. As the Owner, you can add as many stores as your business needs and switch between them, or view them all together, from one dashboard.",
  },
  {
    question: "Can my staff only see their own store?",
    answer:
      "Yes. A Store Manager only sees the inventory, sales, purchases and reports for the store they're assigned to — never other stores in the business.",
  },
  {
    question: "Can I export reports?",
    answer:
      "Yes. Sales, inventory valuation, profit and loss, and other reports can be exported as PDF or Excel files whenever you need them.",
  },
  {
    question: "What happens when stock is low?",
    answer:
      "Products get a low-stock alert once they fall below the reorder level you set, so you can reorder before you run out.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Your business's data is kept isolated from every other business on the platform, logins use encrypted passwords and secure session tokens, and your data is backed up automatically.",
  },
  {
    question: "Can I cancel any time?",
    answer:
      "Yes. There's no long-term lock-in — you can cancel your subscription at any time from your account settings.",
  },
];