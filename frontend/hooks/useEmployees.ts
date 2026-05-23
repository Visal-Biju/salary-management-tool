'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CreateEmployeeInput, EmployeeFilters } from '@/types';

export function useEmployees(page: number, limit: number, filters: EmployeeFilters) {
  return useQuery({
    queryKey: ['employees', page, limit, filters],
    queryFn: () =>
      api.employees.list({
        page,
        limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.country && { country: filters.country }),
        ...(filters.jobTitle && { jobTitle: filters.jobTitle }),
      }),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeInput) => api.employees.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateEmployeeInput> }) =>
      api.employees.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.employees.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
}
