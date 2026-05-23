'use client';

import { useState } from 'react';
import { useOrgSummary, useJobTitleStats, useCountryStats } from '@/hooks/useInsights';
import { KpiCards } from '@/components/insights/KpiCards';
import { SalaryBarChart } from '@/components/insights/SalaryBarChart';
import { InsightsTable } from '@/components/insights/InsightsTable';
import { CurrencySelector } from '@/components/insights/CurrencySelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyCode } from '@/lib/currencies';

export default function InsightsPage() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  const { data: summary, isLoading: summaryLoading } = useOrgSummary();
  const { data: jobTitleStats } = useJobTitleStats();
  const { data: countryStats } = useCountryStats();

  const countries = countryStats?.map((s) => s.country).sort() ?? [];
  const jobTitles = jobTitleStats
    ? Array.from(new Set(jobTitleStats.map((s) => s.job_title))).sort()
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Salary Insights</h1>
        <div className="flex gap-3">
          <Select value={selectedCountry} onValueChange={(v) => setSelectedCountry(!v || v === 'all' ? '' : v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CurrencySelector value={currency} onChange={setCurrency} />
        </div>
      </div>

      {summaryLoading || !summary ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <KpiCards summary={summary} currency={currency} />
      )}

      {jobTitleStats && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Avg Salary by Job Title</h2>
          <SalaryBarChart stats={jobTitleStats} selectedCountry={selectedCountry} currency={currency} />
        </div>
      )}

      {jobTitleStats && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Breakdown by Job Title + Country</h2>
            <Select value={selectedJobTitle} onValueChange={(v) => setSelectedJobTitle(!v || v === 'all' ? '' : v)}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="All job titles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All job titles</SelectItem>
                {jobTitles.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <InsightsTable stats={jobTitleStats} selectedCountry={selectedCountry} selectedJobTitle={selectedJobTitle} currency={currency} />
        </div>
      )}
    </div>
  );
}
