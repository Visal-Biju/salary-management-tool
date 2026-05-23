export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'CAD' | 'AUD' | 'SGD';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.5 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rate: 1.36 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.34 },
};

export function convertSalary(usdAmount: number, targetCurrency: CurrencyCode): number {
  return usdAmount * CURRENCIES[targetCurrency].rate;
}

export function formatConvertedSalary(usdAmount: number, targetCurrency: CurrencyCode): string {
  const converted = convertSalary(usdAmount, targetCurrency);
  const { symbol } = CURRENCIES[targetCurrency];
  if (converted >= 1_000_000) return `${symbol}${(converted / 1_000_000).toFixed(1)}M`;
  if (converted >= 1_000) return `${symbol}${Math.round(converted / 1_000)}K`;
  return `${symbol}${Math.round(converted)}`;
}
