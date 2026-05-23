'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useOrgSummary() {
  return useQuery({ queryKey: ['insights', 'summary'], queryFn: api.insights.summary });
}

export function useCountryStats() {
  return useQuery({ queryKey: ['insights', 'country-stats'], queryFn: api.insights.countryStats });
}

export function useJobTitleStats() {
  return useQuery({ queryKey: ['insights', 'jobtitle-stats'], queryFn: api.insights.jobTitleStats });
}
