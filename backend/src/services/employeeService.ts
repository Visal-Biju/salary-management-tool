import pool from '../db/client';
import { CreateEmployeeInput, Employee, EmployeeListParams, PaginatedResult } from '../types';

export async function listEmployees(params: EmployeeListParams): Promise<PaginatedResult<Employee>> {
  const { page, limit, search, country, jobTitle } = params;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (search) {
    conditions.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }
  if (country) {
    conditions.push(`country = $${idx++}`);
    values.push(country);
  }
  if (jobTitle) {
    conditions.push(`job_title = $${idx++}`);
    values.push(jobTitle);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [dataResult, countResult] = await Promise.all([
    pool.query<Employee>(
      `SELECT * FROM employees ${where} ORDER BY id ASC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM employees ${where}`,
      values
    ),
  ]);

  return {
    data: dataResult.rows.map((r) => ({ ...r, salary: Number(r.salary) })),
    total: parseInt(countResult.rows[0].count, 10),
    page,
    limit,
  };
}

export async function getEmployeeById(id: number): Promise<Employee | null> {
  const result = await pool.query<Employee>('SELECT * FROM employees WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  return { ...result.rows[0], salary: Number(result.rows[0].salary) };
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  const { full_name, job_title, department, country, salary, email, hired_at } = input;
  const result = await pool.query<Employee>(
    `INSERT INTO employees (full_name, job_title, department, country, salary, email, hired_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [full_name, job_title, department, country, salary, email, hired_at ?? new Date().toISOString().split('T')[0]]
  );
  return { ...result.rows[0], salary: Number(result.rows[0].salary) };
}

export async function updateEmployee(id: number, input: Partial<CreateEmployeeInput>): Promise<Employee | null> {
  const fields = Object.keys(input) as (keyof CreateEmployeeInput)[];
  if (fields.length === 0) return getEmployeeById(id);

  const setClauses = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
  const values = [...fields.map((f) => input[f]), new Date().toISOString(), id];

  const result = await pool.query<Employee>(
    `UPDATE employees SET ${setClauses}, updated_at = $${fields.length + 1} WHERE id = $${fields.length + 2} RETURNING *`,
    values
  );
  if (result.rows.length === 0) return null;
  return { ...result.rows[0], salary: Number(result.rows[0].salary) };
}

export async function deleteEmployee(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM employees WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
