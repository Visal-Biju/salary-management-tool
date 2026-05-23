const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? 'Request failed'), { status: res.status, body });
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  employees: {
    list: (params: Record<string, string | number>) => {
      const qs = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== '' && v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString();
      return apiFetch<import('@/types').PaginatedEmployees>(`/api/employees?${qs}`);
    },
    get: (id: number) => apiFetch<import('@/types').Employee>(`/api/employees/${id}`),
    create: (data: import('@/types').CreateEmployeeInput) =>
      apiFetch<import('@/types').Employee>('/api/employees', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<import('@/types').CreateEmployeeInput>) =>
      apiFetch<import('@/types').Employee>(`/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => apiFetch<void>(`/api/employees/${id}`, { method: 'DELETE' }),
  },
  insights: {
    summary: () => apiFetch<import('@/types').OrgSummary>('/api/insights/summary'),
    countryStats: () => apiFetch<import('@/types').CountryStat[]>('/api/insights/country-stats'),
    jobTitleStats: () => apiFetch<import('@/types').JobTitleStat[]>('/api/insights/jobtitle-stats'),
  },
};
