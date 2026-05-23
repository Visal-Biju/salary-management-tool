'use client';

import { useState } from 'react';
import { JobTitleStat } from '@/types';
import { formatSalary } from '@/lib/formatters';
import { convertSalary, CurrencyCode } from '@/lib/currencies';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

type SortKey = 'job_title' | 'country' | 'avg_salary' | 'headcount';

interface Props {
  stats: JobTitleStat[];
  selectedCountry: string;
  currency: CurrencyCode;
}

export function InsightsTable({ stats, selectedCountry, currency }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('avg_salary');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = selectedCountry ? stats.filter((s) => s.country === selectedCountry) : stats;
  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortButton = ({ col }: { col: SortKey }) => (
    <Button variant="ghost" size="sm" className="-ml-3 h-7" onClick={() => toggleSort(col)}>
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title <SortButton col="job_title" /></TableHead>
            <TableHead>Country <SortButton col="country" /></TableHead>
            <TableHead>Avg Salary <SortButton col="avg_salary" /></TableHead>
            <TableHead>Headcount <SortButton col="headcount" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((s, i) => (
            <TableRow key={`${s.job_title}-${s.country}-${i}`}>
              <TableCell>{s.job_title}</TableCell>
              <TableCell>{s.country}</TableCell>
              <TableCell>{formatSalary(convertSalary(s.avg_salary, currency))}</TableCell>
              <TableCell>{s.headcount.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
