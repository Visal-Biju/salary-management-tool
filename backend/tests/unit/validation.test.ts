import { z } from 'zod';

const createEmployeeSchema = z.object({
  full_name: z.string().min(1).max(255),
  job_title: z.string().min(1).max(255),
  department: z.string().min(1).max(255),
  country: z.string().min(1).max(100),
  salary: z.number().positive(),
  email: z.string().email().max(255),
  hired_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

describe('createEmployeeSchema', () => {
  const valid = {
    full_name: 'Jane Doe',
    job_title: 'Engineer',
    department: 'Engineering',
    country: 'USA',
    salary: 90000,
    email: 'jane@example.com',
  };

  it('accepts a valid employee payload', () => {
    expect(() => createEmployeeSchema.parse(valid)).not.toThrow();
  });

  it('rejects empty full_name', () => {
    expect(() => createEmployeeSchema.parse({ ...valid, full_name: '' })).toThrow();
  });

  it('rejects negative salary', () => {
    expect(() => createEmployeeSchema.parse({ ...valid, salary: -1 })).toThrow();
  });

  it('rejects invalid email', () => {
    expect(() => createEmployeeSchema.parse({ ...valid, email: 'not-an-email' })).toThrow();
  });

  it('rejects malformed hired_at date', () => {
    expect(() => createEmployeeSchema.parse({ ...valid, hired_at: '01/01/2024' })).toThrow();
  });

  it('accepts valid hired_at date', () => {
    expect(() => createEmployeeSchema.parse({ ...valid, hired_at: '2023-06-15' })).not.toThrow();
  });
});
