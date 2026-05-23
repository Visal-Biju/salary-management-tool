import { convertSalary, CURRENCIES } from '@/lib/currencies';

describe('convertSalary', () => {
  it('returns same amount for USD', () => {
    expect(convertSalary(100000, 'USD')).toBe(100000);
  });

  it('converts USD to INR correctly', () => {
    const inr = convertSalary(1000, 'INR');
    expect(inr).toBeCloseTo(1000 * CURRENCIES.INR.rate, 0);
  });

  it('converts USD to AED', () => {
    const aed = convertSalary(1000, 'AED');
    expect(aed).toBeCloseTo(1000 * CURRENCIES.AED.rate, 0);
  });
});
