'use client';

import { useState } from 'react';
import { JobTitleStat } from '@/types';
import { formatConvertedSalary } from '@/lib/currencies';
import { CurrencyCode } from '@/lib/currencies';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

type SortKey = 'job_title' | 'country' | 'avg_salary' | 'headcount';

interface Props {
  stats: JobTitleStat[];
  selectedCountry: string;
  selectedJobTitle: string;
  currency: CurrencyCode;
}

export function InsightsTable({ stats, selectedCountry, selectedJobTitle, currency }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('avg_salary');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = stats
    .filter((s) => !selectedCountry || s.country === selectedCountry)
    .filter((s) => !selectedJobTitle || s.job_title === selectedJobTitle);
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
              <TableCell>{formatConvertedSalary(s.avg_salary, currency)}</TableCell>
              <TableCell>{s.headcount.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
