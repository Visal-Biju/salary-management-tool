'use client';

import { useEffect, useState } from 'react';
import { Employee, CreateEmployeeInput } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose,
} from '@/components/ui/drawer';

const EMPTY_FORM: CreateEmployeeInput = {
  full_name: '',
  job_title: '',
  department: '',
  country: '',
  salary: 0,
  email: '',
  hired_at: '',
};

interface Props {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSave: (data: CreateEmployeeInput) => Promise<void>;
}

export function EmployeeDrawer({ open, employee, onClose, onSave }: Props) {
  const [form, setForm] = useState<CreateEmployeeInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm({
        full_name: employee.full_name,
        job_title: employee.job_title,
        department: employee.department,
        country: employee.country,
        salary: employee.salary,
        email: employee.email,
        hired_at: employee.hired_at,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [employee, open]);

  const update = (key: keyof CreateEmployeeInput, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.full_name.trim()) errs.full_name = 'Required';
    if (!form.job_title.trim()) errs.job_title = 'Required';
    if (!form.department.trim()) errs.department = 'Required';
    if (!form.country.trim()) errs.country = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.salary || form.salary <= 0) errs.salary = 'Must be positive';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof CreateEmployeeInput, label: string, type = 'text') => (
    <div className="space-y-1">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type={type}
        value={String(form[key] ?? '')}
        onChange={(e) => update(key, type === 'number' ? Number(e.target.value) : e.target.value)}
      />
      {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{employee ? 'Edit Employee' : 'Add Employee'}</DrawerTitle>
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-4 px-4 py-2">
          {field('full_name', 'Full Name')}
          {field('email', 'Email', 'email')}
          {field('job_title', 'Job Title')}
          {field('department', 'Department')}
          {field('country', 'Country')}
          {field('salary', 'Salary (USD)', 'number')}
          {field('hired_at', 'Hire Date', 'date')}
        </div>
        <DrawerFooter className="flex flex-row justify-end gap-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
