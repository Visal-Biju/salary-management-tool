'use client';

import { JobTitleStat } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatConvertedSalary, CurrencyCode } from '@/lib/currencies';

interface Props {
  stats: JobTitleStat[];
  selectedCountry: string;
  currency: CurrencyCode;
}

export function SalaryBarChart({ stats, selectedCountry, currency }: Props) {
  const filtered = selectedCountry
    ? stats.filter((s) => s.country === selectedCountry)
    : stats;

  const aggregated = Object.values(
    filtered.reduce<Record<string, { job_title: string; avg_salary: number; count: number }>>(
      (acc, s) => {
        if (!acc[s.job_title]) {
          acc[s.job_title] = { job_title: s.job_title, avg_salary: 0, count: 0 };
        }
        acc[s.job_title].avg_salary += s.avg_salary;
        acc[s.job_title].count += 1;
        return acc;
      },
      {}
    )
  )
    .map((d) => ({ job_title: d.job_title, avg_salary: Math.round(d.avg_salary / d.count) }))
    .sort((a, b) => b.avg_salary - a.avg_salary);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={aggregated} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => formatConvertedSalary(typeof v === 'number' ? v : 0, currency)}
            tick={{ fontSize: 11 }}
          />
          <YAxis type="category" dataKey="job_title" tick={{ fontSize: 11 }} width={115} />
          <Tooltip formatter={(v) => [formatConvertedSalary(typeof v === 'number' ? v : 0, currency), 'Avg Salary']} />
          <Bar dataKey="avg_salary" fill="#3b82f6" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
