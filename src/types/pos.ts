import type { PaymentMethod, PaymentStatus, Product } from "@/types/owner";

export type DiscountType = "amount" | "percent";

export interface PosStore {
  id: string;
  name: string;
  location: string;
}

export interface PosData {
  store: PosStore | null; // null = the manager is not assigned to a store yet
  cashierName: string;
  products: Product[]; // this store's products only
  customers: string[]; // known customers, for suggestions
  defaultTaxRate: number; // percent
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CompleteSalePayload {
  storeId: string;
  customerName: string; // "" = walk-in customer
  items: CartLine[];
  discountType: DiscountType;
  discountValue: number;
  taxRate: number; // percent
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}