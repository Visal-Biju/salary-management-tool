'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmployeeFilters } from '@/types';

const COUNTRIES = [
  'USA', 'UK', 'India', 'Germany', 'France', 'Canada', 'Australia',
  'Brazil', 'Japan', 'Singapore', 'UAE', 'Netherlands', 'Spain',
  'Mexico', 'Sweden', 'Poland', 'South Africa', 'Nigeria', 'Egypt', 'Argentina',
];

interface Props {
  filters: EmployeeFilters;
  onChange: (filters: EmployeeFilters) => void;
}

export function EmployeeFiltersBar({ filters, onChange }: Props) {
  const update = (key: keyof EmployeeFilters, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap gap-3">
      <Input
        placeholder="Search by name or email..."
        value={filters.search}
        onChange={(e) => update('search', e.target.value)}
        className="w-64"
      />
      <Select value={filters.country} onValueChange={(v) => update('country', v === 'all' ? '' : v)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All countries" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All countries</SelectItem>
          {COUNTRIES.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
