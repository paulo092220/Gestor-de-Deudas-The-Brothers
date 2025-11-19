export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  ZELLE = 'ZELLE',
  USDT = 'USDT',
  CUP = 'CUP',
}

// Fix: Add ExchangeRates type, allowing partial data to handle cases where not all rates are defined.
export type ExchangeRates = Partial<Record<Currency, number>>;

export interface Debt {
  id: string;
  amount: number;
  currency: Currency;
  notes: string;
  date: string;
  rateToCUP: number;
}

export interface BoxTransaction {
  id: string;
  type: 'ADD' | 'PAY';
  boxes: number; // Number of boxes added or paid for
  notes: string;
  date: string;
  // Fields for PAY transactions to record payment details
  paymentAmount?: number;
  paymentCurrency?: Currency;
  paymentRateToCUP?: number;
  boxValueInCUP?: number; // The agreed value of one box in CUP for this payment
  debtId?: string; // Links a payment to a specific debt
}

export interface Customer {
  id: string;
  name: string;
  debts: Debt[];
  boxTransactions: BoxTransaction[];
}