import { formatSalary, formatSalaryCompact, formatDate } from '@/lib/formatters';

describe('formatSalary', () => {
  it('formats a round number with commas', () => {
    expect(formatSalary(90000)).toBe('$90,000');
  });

  it('formats decimal salary', () => {
    expect(formatSalary(90000.5)).toBe('$90,001');
  });

  it('handles zero', () => {
    expect(formatSalary(0)).toBe('$0');
  });
});

describe('formatSalaryCompact', () => {
  it('abbreviates thousands', () => {
    expect(formatSalaryCompact(82000)).toBe('$82K');
  });

  it('abbreviates millions', () => {
    expect(formatSalaryCompact(1500000)).toBe('$1.5M');
  });

  it('handles sub-thousand', () => {
    expect(formatSalaryCompact(500)).toBe('$500');
  });
});

describe('formatDate', () => {
  it('formats ISO date to readable format', () => {
    expect(formatDate('2022-06-15')).toBe('Jun 15, 2022');
  });
});
