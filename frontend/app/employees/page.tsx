'use client';

import { useState } from 'react';
import { Employee, CreateEmployeeInput, EmployeeFilters } from '@/types';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '@/hooks/useEmployees';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { EmployeeFiltersBar } from '@/components/employees/EmployeeFilters';
import { EmployeeDrawer } from '@/components/employees/EmployeeDrawer';
import { DeleteDialog } from '@/components/employees/DeleteDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const INITIAL_FILTERS: EmployeeFilters = { search: '', country: '', jobTitle: '' };

export default function EmployeesPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<EmployeeFilters>(INITIAL_FILTERS);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  const { data, isLoading } = useEmployees(page, 20, filters);
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const handleFiltersChange = (newFilters: EmployeeFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setDrawerOpen(true);
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setDrawerOpen(true);
  };

  const handleSave = async (formData: CreateEmployeeInput) => {
    if (editingEmployee) {
      await updateEmployee.mutateAsync({ id: editingEmployee.id, data: formData });
    } else {
      await createEmployee.mutateAsync(formData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEmployee) return;
    await deleteEmployee.mutateAsync(deletingEmployee.id);
    setDeletingEmployee(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <EmployeeFiltersBar filters={filters} onChange={handleFiltersChange} />

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : data ? (
        <EmployeeTable
          employees={data.data}
          total={data.total}
          page={page}
          limit={20}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={setDeletingEmployee}
        />
      ) : null}

      <EmployeeDrawer
        open={drawerOpen}
        employee={editingEmployee}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      />

      <DeleteDialog
        employee={deletingEmployee}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingEmployee(null)}
      />
    </div>
  );
}
