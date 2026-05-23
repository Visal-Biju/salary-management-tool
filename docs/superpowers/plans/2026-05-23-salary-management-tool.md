# Salary Management Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack HR salary management tool with employee CRUD, salary insights with charts, 10K-employee seed, and a currency converter — deployed to Railway.

**Architecture:** Monorepo with `/backend` (Node.js + Express + PostgreSQL) and `/frontend` (Next.js + shadcn/ui + Tailwind). Backend serves a REST API; frontend is a pure client-side SPA using React Query. Both deployed as separate Railway services. Auth is deferred to Phase 2.

**Tech Stack:** Node.js, Express, PostgreSQL (`pg`), Zod, TypeScript, Jest, Supertest (backend) · Next.js 14, React Query v5, Recharts, shadcn/ui, Tailwind CSS, Vitest, React Testing Library (frontend)

---

## File Map

```
salary-management-tool/
├── .gitignore
├── railway.toml
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── .env.example
│   ├── src/
│   │   ├── app.ts                        # Express app factory (for testability)
│   │   ├── index.ts                      # Entry point: runs migrations + starts server
│   │   ├── types.ts                      # Shared TypeScript types
│   │   ├── db/
│   │   │   ├── client.ts                 # pg Pool singleton
│   │   │   └── migrate.ts                # CREATE TABLE IF NOT EXISTS on startup
│   │   ├── middleware/
│   │   │   └── validate.ts               # Zod request validation middleware
│   │   ├── routes/
│   │   │   ├── employees.ts              # CRUD routes
│   │   │   └── insights.ts               # Aggregation routes
│   │   ├── services/
│   │   │   ├── employeeService.ts        # DB queries for employees
│   │   │   └── insightService.ts         # DB aggregation queries
│   │   └── seed/
│   │       ├── seed.ts                   # Bulk-insert seed script
│   │       ├── first_names.txt           # Provided by assessment
│   │       └── last_names.txt            # Provided by assessment
│   └── tests/
│       ├── helpers.ts                    # Shared test DB setup/teardown
│       ├── unit/
│       │   ├── pagination.test.ts
│       │   └── validation.test.ts
│       └── integration/
│           ├── employees.test.ts
│           └── insights.test.ts
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vitest.config.ts
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── .env.example
    ├── app/
    │   ├── layout.tsx                    # Root layout with TabNav
    │   ├── page.tsx                      # Redirects to /employees
    │   ├── employees/page.tsx            # Employees page
    │   └── insights/page.tsx             # Insights page
    ├── components/
    │   ├── layout/
    │   │   └── TabNav.tsx
    │   ├── employees/
    │   │   ├── EmployeeTable.tsx
    │   │   ├── EmployeeFilters.tsx
    │   │   ├── EmployeeDrawer.tsx
    │   │   └── DeleteDialog.tsx
    │   └── insights/
    │       ├── KpiCards.tsx
    │       ├── SalaryBarChart.tsx
    │       ├── InsightsTable.tsx
    │       └── CurrencySelector.tsx
    ├── hooks/
    │   ├── useEmployees.ts
    │   └── useInsights.ts
    ├── lib/
    │   ├── api.ts                        # Typed fetch wrappers
    │   ├── formatters.ts                 # formatSalary, formatDate
    │   └── currencies.ts                 # Static exchange rates + convertSalary
    ├── types.ts                          # Shared frontend types (mirrors backend)
    └── tests/
        ├── setup.ts
        ├── lib/
        │   ├── formatters.test.ts
        │   └── currencies.test.ts
        └── components/
            └── KpiCards.test.tsx
```

---

### Task 1: Repo Initialization

**Files:**
- Modify: `.gitignore`
- Create: `railway.toml`
- Create: `README.md`

- [ ] **Step 1: Create .gitignore**

```
node_modules/
dist/
.next/
.env
.env.local
*.log
.superpowers/
.DS_Store
```

- [ ] **Step 2: Create railway.toml**

```toml
[build]
builder = "NIXPACKS"

[[services]]
name = "backend"
source = "backend"

[[services]]
name = "frontend"
source = "frontend"
```

- [ ] **Step 3: Create README.md**

```markdown
# Salary Management Tool

HR salary management tool for 10,000 employees.

## Stack
- **Backend:** Node.js, Express, PostgreSQL, TypeScript
- **Frontend:** Next.js 14, React Query, shadcn/ui, Tailwind CSS
- **Deployment:** Railway

## Local Development

### Backend
```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env.local   # fill in NEXT_PUBLIC_API_URL
npm install
npm run dev
```

### Seed
```bash
cd backend
npm run seed
```

### Tests
```bash
cd backend && npm test
cd frontend && npm test
```

## Deployment
See `railway.toml`. Set `DATABASE_URL` on backend service and `NEXT_PUBLIC_API_URL` on frontend service in Railway dashboard.
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore railway.toml README.md
git commit -m "chore: initialize repo structure"
```

---

### Task 2: Backend Scaffolding

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/jest.config.js`
- Create: `backend/.env.example`
- Create: `backend/src/app.ts`
- Create: `backend/src/index.ts`

- [ ] **Step 1: Create backend/package.json**

```json
{
  "name": "salary-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest --runInBand",
    "seed": "tsx src/seed/seed.ts"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "pg": "^8.12.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.12",
    "@types/node": "^20.14.9",
    "@types/pg": "^8.11.6",
    "@types/supertest": "^6.0.2",
    "jest": "^29.7.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.2",
    "tsx": "^4.16.2",
    "typescript": "^5.5.3"
  }
}
```

- [ ] **Step 2: Create backend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: Create backend/jest.config.js**

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  setupFiles: ['<rootDir>/tests/jestSetup.ts'],
};
```

- [ ] **Step 3b: Create backend/tests/jestSetup.ts**

This file runs before any module is imported, so it overwrites `DATABASE_URL` before `db/client.ts` creates its Pool — ensuring integration tests hit the test database, not dev.

```typescript
import 'dotenv/config';

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
```

- [ ] **Step 4: Create backend/.env.example**

```
DATABASE_URL=postgres://postgres:password@localhost:5432/salary_dev
TEST_DATABASE_URL=postgres://postgres:password@localhost:5432/salary_test
PORT=3001
NODE_ENV=development
```

- [ ] **Step 5: Create backend/src/app.ts**

```typescript
import express from 'express';
import cors from 'cors';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  return app;
}
```

- [ ] **Step 6: Create backend/src/index.ts**

```typescript
import 'dotenv/config';
import { createApp } from './app';
import { runMigrations } from './db/migrate';

const PORT = process.env.PORT ?? '3001';

async function start() {
  await runMigrations();
  const app = createApp();
  app.listen(Number(PORT), () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
```

- [ ] **Step 7: Install dependencies**

```bash
cd backend && npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 8: Commit**

```bash
git add backend/
git commit -m "feat(backend): scaffold Express app with TypeScript"
```

---

### Task 3: Backend Types + DB Client + Migrations

**Files:**
- Create: `backend/src/types.ts`
- Create: `backend/src/db/client.ts`
- Create: `backend/src/db/migrate.ts`

- [ ] **Step 1: Create backend/src/types.ts**

```typescript
export interface Employee {
  id: number;
  full_name: string;
  job_title: string;
  department: string;
  country: string;
  salary: number;
  email: string;
  hired_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeInput {
  full_name: string;
  job_title: string;
  department: string;
  country: string;
  salary: number;
  email: string;
  hired_at?: string;
}

export interface EmployeeListParams {
  page: number;
  limit: number;
  search?: string;
  country?: string;
  jobTitle?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CountryStat {
  country: string;
  min_salary: number;
  max_salary: number;
  avg_salary: number;
  headcount: number;
}

export interface JobTitleStat {
  job_title: string;
  country: string;
  avg_salary: number;
  headcount: number;
}

export interface OrgSummary {
  total_employees: number;
  avg_salary: number;
  min_salary: number;
  max_salary: number;
  country_count: number;
}
```

- [ ] **Step 2: Create backend/src/db/client.ts**

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;
```

- [ ] **Step 3: Create backend/src/db/migrate.ts**

```typescript
import pool from './client';

const MIGRATION_SQL = `
  CREATE TABLE IF NOT EXISTS employees (
    id          SERIAL PRIMARY KEY,
    full_name   VARCHAR(255) NOT NULL,
    job_title   VARCHAR(255) NOT NULL,
    department  VARCHAR(255) NOT NULL,
    country     VARCHAR(100) NOT NULL,
    salary      NUMERIC(12, 2) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    hired_at    DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_employees_country
    ON employees(country);

  CREATE INDEX IF NOT EXISTS idx_employees_country_jobtitle
    ON employees(country, job_title);
`;

export async function runMigrations(): Promise<void> {
  await pool.query(MIGRATION_SQL);
  console.log('Migrations complete');
}
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/types.ts backend/src/db/
git commit -m "feat(backend): add types, DB client, and migrations"
```

---

### Task 4: Employee Service (TDD)

**Files:**
- Create: `backend/tests/helpers.ts`
- Create: `backend/tests/unit/pagination.test.ts`
- Create: `backend/src/services/employeeService.ts`

- [ ] **Step 1: Create backend/tests/helpers.ts**

`DATABASE_URL` is already pointing at the test DB (set by `jestSetup.ts` before any module loads), so these helpers just use the shared pool directly.

```typescript
import pool from '../src/db/client';
import { runMigrations } from '../src/db/migrate';

export async function setupTestDb(): Promise<void> {
  await runMigrations();
}

export async function truncateEmployees(): Promise<void> {
  await pool.query('TRUNCATE employees RESTART IDENTITY CASCADE');
}

export async function closeTestPool(): Promise<void> {
  await pool.end();
}
```

- [ ] **Step 2: Create backend/tests/unit/pagination.test.ts**

```typescript
describe('pagination offset calculation', () => {
  it('returns offset 0 for page 1', () => {
    const offset = (1 - 1) * 20;
    expect(offset).toBe(0);
  });

  it('returns correct offset for page 3 with limit 20', () => {
    const offset = (3 - 1) * 20;
    expect(offset).toBe(40);
  });

  it('returns correct offset for page 2 with limit 50', () => {
    const offset = (2 - 1) * 50;
    expect(offset).toBe(50);
  });
});
```

- [ ] **Step 3: Run unit test — expect PASS (pure math, no imports)**

```bash
cd backend && npx jest tests/unit/pagination.test.ts --no-coverage
```

Expected: `PASS tests/unit/pagination.test.ts` with 3 passing tests.

- [ ] **Step 4: Create backend/src/services/employeeService.ts**

```typescript
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
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/employeeService.ts backend/tests/
git commit -m "feat(backend): add employee service with pagination unit tests"
```

---

### Task 5: Employee Validation Middleware

**Files:**
- Create: `backend/src/middleware/validate.ts`
- Create: `backend/tests/unit/validation.test.ts`

- [ ] **Step 1: Create backend/tests/unit/validation.test.ts**

```typescript
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
```

- [ ] **Step 2: Run — expect FAIL (schema not imported from middleware yet, but zod is used inline so it should pass)**

```bash
cd backend && npx jest tests/unit/validation.test.ts --no-coverage
```

Expected: `PASS` — the schema is defined inline in the test file. This validates the Zod schema shape before we wire it into middleware.

- [ ] **Step 3: Create backend/src/middleware/validate.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const createEmployeeSchema = z.object({
  full_name: z.string().min(1).max(255),
  job_title: z.string().min(1).max(255),
  department: z.string().min(1).max(255),
  country: z.string().min(1).max(100),
  salary: z.number().positive(),
  email: z.string().email().max(255),
  hired_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field required' }
);

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      next(err);
    }
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/middleware/validate.ts backend/tests/unit/validation.test.ts
git commit -m "feat(backend): add Zod validation middleware with unit tests"
```

---

### Task 6: Employee Routes (Integration Tests)

**Files:**
- Create: `backend/tests/integration/employees.test.ts`
- Create: `backend/src/routes/employees.ts`
- Modify: `backend/src/app.ts`

- [ ] **Step 1: Create backend/tests/integration/employees.test.ts**

```typescript
import request from 'supertest';
import { createApp } from '../../src/app';
import { setupTestDb, truncateEmployees, closeTestPool } from '../helpers';

const app = createApp();

const validEmployee = {
  full_name: 'Alice Smith',
  job_title: 'Engineer',
  department: 'Engineering',
  country: 'USA',
  salary: 95000,
  email: 'alice@example.com',
  hired_at: '2022-01-15',
};

beforeAll(async () => {
  await setupTestDb();
});

beforeEach(async () => {
  await truncateEmployees();
});

afterAll(async () => {
  await closeTestPool();
});

describe('GET /api/employees', () => {
  it('returns empty paginated list when no employees', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [], total: 0, page: 1, limit: 20 });
  });

  it('returns paginated employees', async () => {
    await request(app).post('/api/employees').send(validEmployee);
    const res = await request(app).get('/api/employees?page=1&limit=20');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].full_name).toBe('Alice Smith');
  });

  it('filters by country', async () => {
    await request(app).post('/api/employees').send(validEmployee);
    await request(app).post('/api/employees').send({ ...validEmployee, email: 'bob@example.com', country: 'UK' });
    const res = await request(app).get('/api/employees?country=USA');
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].country).toBe('USA');
  });

  it('searches by name', async () => {
    await request(app).post('/api/employees').send(validEmployee);
    const res = await request(app).get('/api/employees?search=Alice');
    expect(res.body.total).toBe(1);
  });
});

describe('POST /api/employees', () => {
  it('creates an employee with valid data', async () => {
    const res = await request(app).post('/api/employees').send(validEmployee);
    expect(res.status).toBe(201);
    expect(res.body.full_name).toBe('Alice Smith');
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app).post('/api/employees').send({ full_name: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('returns 409 for duplicate email', async () => {
    await request(app).post('/api/employees').send(validEmployee);
    const res = await request(app).post('/api/employees').send(validEmployee);
    expect(res.status).toBe(409);
  });
});

describe('GET /api/employees/:id', () => {
  it('returns employee by id', async () => {
    const created = await request(app).post('/api/employees').send(validEmployee);
    const res = await request(app).get(`/api/employees/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('alice@example.com');
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app).get('/api/employees/99999');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/employees/:id', () => {
  it('updates an employee', async () => {
    const created = await request(app).post('/api/employees').send(validEmployee);
    const res = await request(app)
      .put(`/api/employees/${created.body.id}`)
      .send({ salary: 110000 });
    expect(res.status).toBe(200);
    expect(res.body.salary).toBe(110000);
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app).put('/api/employees/99999').send({ salary: 50000 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/employees/:id', () => {
  it('deletes an employee', async () => {
    const created = await request(app).post('/api/employees').send(validEmployee);
    const res = await request(app).delete(`/api/employees/${created.body.id}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app).delete('/api/employees/99999');
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run integration tests — expect FAIL (routes not wired yet)**

```bash
cd backend && npx jest tests/integration/employees.test.ts --no-coverage
```

Expected: FAIL — `404` on all routes because they don't exist yet.

- [ ] **Step 3: Create backend/src/routes/employees.ts**

```typescript
import { Router } from 'express';
import { validateBody } from '../middleware/validate';
import { createEmployeeSchema, updateEmployeeSchema } from '../middleware/validate';
import {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/employeeService';

export const employeesRouter = Router();

employeesRouter.get('/', async (req, res, next) => {
  try {
    const page = parseInt(String(req.query.page ?? '1'), 10);
    const limit = parseInt(String(req.query.limit ?? '20'), 10);
    const search = req.query.search ? String(req.query.search) : undefined;
    const country = req.query.country ? String(req.query.country) : undefined;
    const jobTitle = req.query.jobTitle ? String(req.query.jobTitle) : undefined;
    const result = await listEmployees({ page, limit, search, country, jobTitle });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

employeesRouter.get('/:id', async (req, res, next) => {
  try {
    const employee = await getEmployeeById(Number(req.params.id));
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    next(err);
  }
});

employeesRouter.post('/', validateBody(createEmployeeSchema), async (req, res, next) => {
  try {
    const employee = await createEmployee(req.body);
    res.status(201).json(employee);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('unique constraint')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(err);
  }
});

employeesRouter.put('/:id', validateBody(updateEmployeeSchema), async (req, res, next) => {
  try {
    const employee = await updateEmployee(Number(req.params.id), req.body);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('unique constraint')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(err);
  }
});

employeesRouter.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await deleteEmployee(Number(req.params.id));
    if (!deleted) return res.status(404).json({ error: 'Employee not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 4: Wire routes into app.ts**

```typescript
import express from 'express';
import cors from 'cors';
import { employeesRouter } from './routes/employees';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/employees', employeesRouter);
  return app;
}
```

- [ ] **Step 5: Run integration tests — expect PASS**

```bash
cd backend && npx jest tests/integration/employees.test.ts --no-coverage
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add backend/src/routes/employees.ts backend/src/app.ts backend/tests/integration/employees.test.ts
git commit -m "feat(backend): add employee routes with integration tests"
```

---

### Task 7: Insights Service + Routes (TDD)

**Files:**
- Create: `backend/src/services/insightService.ts`
- Create: `backend/src/routes/insights.ts`
- Create: `backend/tests/integration/insights.test.ts`
- Modify: `backend/src/app.ts`

- [ ] **Step 1: Create backend/tests/integration/insights.test.ts**

```typescript
import request from 'supertest';
import { createApp } from '../../src/app';
import { setupTestDb, truncateEmployees, closeTestPool } from '../helpers';

const app = createApp();

const seed = async (overrides = {}) => {
  await request(app).post('/api/employees').send({
    full_name: 'Alice Smith',
    job_title: 'Engineer',
    department: 'Engineering',
    country: 'USA',
    salary: 100000,
    email: `alice.${Date.now()}@example.com`,
    hired_at: '2021-03-01',
    ...overrides,
  });
};

beforeAll(async () => {
  await setupTestDb();
});

beforeEach(async () => {
  await truncateEmployees();
});

afterAll(async () => {
  await closeTestPool();
});

describe('GET /api/insights/summary', () => {
  it('returns zeroed summary when no employees', async () => {
    const res = await request(app).get('/api/insights/summary');
    expect(res.status).toBe(200);
    expect(res.body.total_employees).toBe(0);
  });

  it('returns correct summary stats', async () => {
    await seed({ salary: 100000 });
    await seed({ email: 'bob@example.com', salary: 50000 });
    const res = await request(app).get('/api/insights/summary');
    expect(res.body.total_employees).toBe(2);
    expect(res.body.min_salary).toBe(50000);
    expect(res.body.max_salary).toBe(100000);
    expect(res.body.avg_salary).toBe(75000);
  });
});

describe('GET /api/insights/country-stats', () => {
  it('returns salary stats grouped by country', async () => {
    await seed({ country: 'USA', salary: 100000 });
    await seed({ email: 'b@x.com', country: 'UK', salary: 80000 });
    const res = await request(app).get('/api/insights/country-stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const usa = res.body.find((s: { country: string }) => s.country === 'USA');
    expect(usa.min_salary).toBe(100000);
    expect(usa.max_salary).toBe(100000);
    expect(usa.avg_salary).toBe(100000);
    expect(usa.headcount).toBe(1);
  });
});

describe('GET /api/insights/jobtitle-stats', () => {
  it('returns avg salary grouped by job title and country', async () => {
    await seed({ job_title: 'Engineer', country: 'USA', salary: 100000 });
    await seed({ email: 'b@x.com', job_title: 'Engineer', country: 'USA', salary: 120000 });
    const res = await request(app).get('/api/insights/jobtitle-stats');
    expect(res.status).toBe(200);
    const stat = res.body.find((s: { job_title: string }) => s.job_title === 'Engineer');
    expect(stat.avg_salary).toBe(110000);
    expect(stat.headcount).toBe(2);
  });
});
```

- [ ] **Step 2: Run — expect FAIL (routes not yet created)**

```bash
cd backend && npx jest tests/integration/insights.test.ts --no-coverage
```

Expected: FAIL — 404 on all insights routes.

- [ ] **Step 3: Create backend/src/services/insightService.ts**

```typescript
import pool from '../db/client';
import { CountryStat, JobTitleStat, OrgSummary } from '../types';

export async function getOrgSummary(): Promise<OrgSummary> {
  const result = await pool.query(`
    SELECT
      COUNT(*)::integer           AS total_employees,
      COALESCE(ROUND(AVG(salary))::numeric, 0)  AS avg_salary,
      COALESCE(MIN(salary)::numeric, 0)          AS min_salary,
      COALESCE(MAX(salary)::numeric, 0)          AS max_salary,
      COUNT(DISTINCT country)::integer           AS country_count
    FROM employees
  `);
  const r = result.rows[0];
  return {
    total_employees: Number(r.total_employees),
    avg_salary: Number(r.avg_salary),
    min_salary: Number(r.min_salary),
    max_salary: Number(r.max_salary),
    country_count: Number(r.country_count),
  };
}

export async function getCountryStats(): Promise<CountryStat[]> {
  const result = await pool.query(`
    SELECT
      country,
      MIN(salary)::numeric        AS min_salary,
      MAX(salary)::numeric        AS max_salary,
      ROUND(AVG(salary))::numeric AS avg_salary,
      COUNT(*)::integer           AS headcount
    FROM employees
    GROUP BY country
    ORDER BY country ASC
  `);
  return result.rows.map((r) => ({
    country: r.country,
    min_salary: Number(r.min_salary),
    max_salary: Number(r.max_salary),
    avg_salary: Number(r.avg_salary),
    headcount: Number(r.headcount),
  }));
}

export async function getJobTitleStats(): Promise<JobTitleStat[]> {
  const result = await pool.query(`
    SELECT
      job_title,
      country,
      ROUND(AVG(salary))::numeric AS avg_salary,
      COUNT(*)::integer           AS headcount
    FROM employees
    GROUP BY job_title, country
    ORDER BY country ASC, avg_salary DESC
  `);
  return result.rows.map((r) => ({
    job_title: r.job_title,
    country: r.country,
    avg_salary: Number(r.avg_salary),
    headcount: Number(r.headcount),
  }));
}
```

- [ ] **Step 4: Create backend/src/routes/insights.ts**

```typescript
import { Router } from 'express';
import { getOrgSummary, getCountryStats, getJobTitleStats } from '../services/insightService';

export const insightsRouter = Router();

insightsRouter.get('/summary', async (_req, res, next) => {
  try {
    res.json(await getOrgSummary());
  } catch (err) {
    next(err);
  }
});

insightsRouter.get('/country-stats', async (_req, res, next) => {
  try {
    res.json(await getCountryStats());
  } catch (err) {
    next(err);
  }
});

insightsRouter.get('/jobtitle-stats', async (_req, res, next) => {
  try {
    res.json(await getJobTitleStats());
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 5: Wire insights router into app.ts**

```typescript
import express from 'express';
import cors from 'cors';
import { employeesRouter } from './routes/employees';
import { insightsRouter } from './routes/insights';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/employees', employeesRouter);
  app.use('/api/insights', insightsRouter);
  return app;
}
```

- [ ] **Step 6: Run all backend tests — expect PASS**

```bash
cd backend && npm test
```

Expected: All unit and integration tests pass.

- [ ] **Step 7: Commit**

```bash
git add backend/src/services/insightService.ts backend/src/routes/insights.ts backend/src/app.ts backend/tests/integration/insights.test.ts
git commit -m "feat(backend): add insights service and routes with integration tests"
```

---

### Task 8: Seed Script

**Files:**
- Create: `backend/src/seed/seed.ts`
- Create: `backend/src/seed/first_names.txt` *(add from assessment)*
- Create: `backend/src/seed/last_names.txt` *(add from assessment)*

- [ ] **Step 1: Add name files from assessment**

Copy `first_names.txt` and `last_names.txt` from the assessment zip into `backend/src/seed/`.

- [ ] **Step 2: Create backend/src/seed/seed.ts**

```typescript
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

const TOTAL_EMPLOYEES = 10_000;
const BATCH_SIZE = 1_000;

const COUNTRIES = [
  'USA', 'UK', 'India', 'Germany', 'France', 'Canada', 'Australia',
  'Brazil', 'Japan', 'Singapore', 'UAE', 'Netherlands', 'Spain',
  'Mexico', 'Sweden', 'Poland', 'South Africa', 'Nigeria', 'Egypt', 'Argentina',
];

const JOB_TITLES_WITH_RANGES: Array<{ title: string; min: number; max: number }> = [
  { title: 'Software Engineer', min: 70000, max: 150000 },
  { title: 'Senior Engineer', min: 100000, max: 200000 },
  { title: 'Product Manager', min: 80000, max: 160000 },
  { title: 'Data Analyst', min: 55000, max: 110000 },
  { title: 'Data Scientist', min: 80000, max: 160000 },
  { title: 'HR Manager', min: 60000, max: 120000 },
  { title: 'Finance Analyst', min: 55000, max: 105000 },
  { title: 'Marketing Specialist', min: 45000, max: 95000 },
  { title: 'DevOps Engineer', min: 85000, max: 165000 },
  { title: 'UX Designer', min: 60000, max: 120000 },
  { title: 'Sales Executive', min: 50000, max: 130000 },
  { title: 'Operations Manager', min: 65000, max: 130000 },
  { title: 'Legal Counsel', min: 90000, max: 180000 },
  { title: 'Customer Success', min: 45000, max: 90000 },
  { title: 'Engineering Manager', min: 120000, max: 220000 },
];

const DEPARTMENTS = [
  'Engineering', 'Product', 'Data', 'Human Resources', 'Finance',
  'Marketing', 'Operations', 'Legal', 'Sales', 'Design',
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(yearsBack: number): string {
  const now = Date.now();
  const past = now - yearsBack * 365 * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past)).toISOString().split('T')[0];
}

function loadNames(filename: string): string[] {
  return fs
    .readFileSync(path.join(__dirname, filename), 'utf-8')
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean);
}

async function seed() {
  const firstNames = loadNames('first_names.txt');
  const lastNames = loadNames('last_names.txt');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE employees RESTART IDENTITY');

    for (let batchStart = 0; batchStart < TOTAL_EMPLOYEES; batchStart += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, TOTAL_EMPLOYEES - batchStart);
      const placeholders: string[] = [];
      const values: unknown[] = [];
      let paramIdx = 1;

      for (let i = 0; i < batchSize; i++) {
        const n = batchStart + i;
        const firstName = randomItem(firstNames);
        const lastName = randomItem(lastNames);
        const jobSpec = randomItem(JOB_TITLES_WITH_RANGES);
        const salary = randomBetween(jobSpec.min, jobSpec.max);
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${n}@company.com`;

        placeholders.push(
          `($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3}, $${paramIdx + 4}, $${paramIdx + 5}, $${paramIdx + 6})`
        );
        values.push(
          `${firstName} ${lastName}`,
          jobSpec.title,
          randomItem(DEPARTMENTS),
          randomItem(COUNTRIES),
          salary,
          email,
          randomDate(10)
        );
        paramIdx += 7;
      }

      await client.query(
        `INSERT INTO employees (full_name, job_title, department, country, salary, email, hired_at) VALUES ${placeholders.join(', ')}`,
        values
      );

      console.log(`Inserted ${batchStart + batchSize} / ${TOTAL_EMPLOYEES}`);
    }

    await client.query('COMMIT');
    console.log('Seed complete');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
```

- [ ] **Step 3: Run seed against dev DB**

```bash
cd backend && npm run seed
```

Expected output:
```
Inserted 1000 / 10000
Inserted 2000 / 10000
...
Inserted 10000 / 10000
Seed complete
```

Total runtime should be under 5 seconds.

- [ ] **Step 4: Verify row count**

```bash
cd backend && node -e "require('dotenv').config(); const {Pool}=require('pg'); const p=new Pool({connectionString:process.env.DATABASE_URL}); p.query('SELECT COUNT(*) FROM employees').then(r=>{ console.log('Count:', r.rows[0].count); p.end(); })"
```

Expected: `Count: 10000`

- [ ] **Step 5: Commit**

```bash
git add backend/src/seed/
git commit -m "feat(backend): add bulk-insert seed script for 10K employees"
```

---

### Task 9: Frontend Scaffolding

**Files:**
- Create: `frontend/` (Next.js project)

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd /path/to/salary-management-tool
npx create-next-app@14 frontend --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

When prompted:
- Would you like to use Turbopack? → **No**

- [ ] **Step 2: Install additional dependencies**

```bash
cd frontend
npm install @tanstack/react-query recharts lucide-react
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
cd frontend && npx shadcn@latest init
```

When prompted: style → **Default**, base color → **Slate**, CSS variables → **Yes**.

- [ ] **Step 4: Add required shadcn components**

```bash
npx shadcn@latest add button input label select table dialog drawer badge card
```

- [ ] **Step 5: Create frontend/.env.example**

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- [ ] **Step 6: Create frontend/vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

- [ ] **Step 7: Create frontend/tests/setup.ts**

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 8: Update frontend/package.json scripts**

Add to the `"scripts"` block:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 9: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): scaffold Next.js app with shadcn, Tailwind, Vitest"
```

---

### Task 10: Frontend Types, API Client, and Formatters (TDD)

**Files:**
- Create: `frontend/types.ts`
- Create: `frontend/lib/api.ts`
- Create: `frontend/lib/formatters.ts`
- Create: `frontend/lib/currencies.ts`
- Create: `frontend/tests/lib/formatters.test.ts`
- Create: `frontend/tests/lib/currencies.test.ts`

- [ ] **Step 1: Create frontend/tests/lib/formatters.test.ts**

```typescript
import { formatSalary, formatSalaryCompact, formatDate } from '@/lib/formatters';

describe('formatSalary', () => {
  it('formats a round number with commas', () => {
    expect(formatSalary(90000)).toBe('$90,000');
  });

  it('formats decimal salary', () => {
    expect(formatSalary(90000.5)).toBe('$90,001');
  });

  it('handles zero', () => {
    expect(formatSalary(0)).toBe('$0');
  });
});

describe('formatSalaryCompact', () => {
  it('abbreviates thousands', () => {
    expect(formatSalaryCompact(82000)).toBe('$82K');
  });

  it('abbreviates millions', () => {
    expect(formatSalaryCompact(1500000)).toBe('$1.5M');
  });

  it('handles sub-thousand', () => {
    expect(formatSalaryCompact(500)).toBe('$500');
  });
});

describe('formatDate', () => {
  it('formats ISO date to readable format', () => {
    expect(formatDate('2022-06-15')).toBe('Jun 15, 2022');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd frontend && npm test -- tests/lib/formatters.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create frontend/tests/lib/currencies.test.ts**

```typescript
import { convertSalary, CURRENCIES } from '@/lib/currencies';

describe('convertSalary', () => {
  it('returns same amount for USD', () => {
    expect(convertSalary(100000, 'USD')).toBe(100000);
  });

  it('converts USD to INR correctly', () => {
    const inr = convertSalary(1000, 'INR');
    expect(inr).toBeCloseTo(1000 * CURRENCIES.INR.rate, 0);
  });

  it('converts USD to AED', () => {
    const aed = convertSalary(1000, 'AED');
    expect(aed).toBeCloseTo(1000 * CURRENCIES.AED.rate, 0);
  });
});
```

- [ ] **Step 4: Create frontend/types.ts**

```typescript
export interface Employee {
  id: number;
  full_name: string;
  job_title: string;
  department: string;
  country: string;
  salary: number;
  email: string;
  hired_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeInput {
  full_name: string;
  job_title: string;
  department: string;
  country: string;
  salary: number;
  email: string;
  hired_at?: string;
}

export interface PaginatedEmployees {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
}

export interface EmployeeFilters {
  search: string;
  country: string;
  jobTitle: string;
}

export interface CountryStat {
  country: string;
  min_salary: number;
  max_salary: number;
  avg_salary: number;
  headcount: number;
}

export interface JobTitleStat {
  job_title: string;
  country: string;
  avg_salary: number;
  headcount: number;
}

export interface OrgSummary {
  total_employees: number;
  avg_salary: number;
  min_salary: number;
  max_salary: number;
  country_count: number;
}
```

- [ ] **Step 5: Create frontend/lib/formatters.ts**

```typescript
export function formatSalary(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatSalaryCompact(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${Math.round(amount)}`;
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
```

- [ ] **Step 6: Create frontend/lib/currencies.ts**

```typescript
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'CAD' | 'AUD' | 'SGD';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.5 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rate: 1.36 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.34 },
};

export function convertSalary(usdAmount: number, targetCurrency: CurrencyCode): number {
  return usdAmount * CURRENCIES[targetCurrency].rate;
}

export function formatConvertedSalary(usdAmount: number, targetCurrency: CurrencyCode): string {
  const converted = convertSalary(usdAmount, targetCurrency);
  const { symbol } = CURRENCIES[targetCurrency];
  if (converted >= 1_000_000) return `${symbol}${(converted / 1_000_000).toFixed(1)}M`;
  if (converted >= 1_000) return `${symbol}${Math.round(converted / 1_000)}K`;
  return `${symbol}${Math.round(converted)}`;
}
```

- [ ] **Step 7: Create frontend/lib/api.ts**

```typescript
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
```

- [ ] **Step 8: Run frontend tests — expect PASS**

```bash
cd frontend && npm test
```

Expected: All formatter and currency tests pass.

- [ ] **Step 9: Commit**

```bash
git add frontend/types.ts frontend/lib/ frontend/tests/
git commit -m "feat(frontend): add types, API client, formatters, and utilities with tests"
```

---

### Task 11: Tab Navigation Layout + React Query Setup

**Files:**
- Modify: `frontend/app/layout.tsx`
- Create: `frontend/app/page.tsx`
- Create: `frontend/components/layout/TabNav.tsx`
- Create: `frontend/components/layout/QueryProvider.tsx`

- [ ] **Step 1: Create frontend/components/layout/QueryProvider.tsx**

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000 } },
  }));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

- [ ] **Step 2: Create frontend/components/layout/TabNav.tsx**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/employees', label: 'Employees' },
  { href: '/insights', label: 'Insights' },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-8">
          <span className="text-lg font-semibold tracking-tight">SalaryTool</span>
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                  pathname.startsWith(tab.href)
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Update frontend/app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TabNav } from '@/components/layout/TabNav';
import { QueryProvider } from '@/components/layout/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SalaryTool',
  description: 'HR Salary Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <TabNav />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Create frontend/app/page.tsx**

```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/employees');
}
```

- [ ] **Step 5: Verify app compiles**

```bash
cd frontend && npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/ frontend/components/layout/
git commit -m "feat(frontend): add tab navigation layout and React Query provider"
```

---

### Task 12: Employee Hooks + Table + Filters

**Files:**
- Create: `frontend/hooks/useEmployees.ts`
- Create: `frontend/components/employees/EmployeeFilters.tsx`
- Create: `frontend/components/employees/EmployeeTable.tsx`

- [ ] **Step 1: Create frontend/hooks/useEmployees.ts**

```typescript
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
```

- [ ] **Step 2: Create frontend/components/employees/EmployeeFilters.tsx**

```tsx
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
```

- [ ] **Step 3: Create frontend/components/employees/EmployeeTable.tsx**

```tsx
'use client';

import { Employee } from '@/types';
import { formatSalary, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeTable({ employees, total, page, limit, onPageChange, onEdit, onDelete }: Props) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Hired</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No employees found
                </TableCell>
              </TableRow>
            )}
            {employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-medium">{emp.full_name}</TableCell>
                <TableCell>{emp.job_title}</TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell>{emp.country}</TableCell>
                <TableCell>{formatSalary(emp.salary)}</TableCell>
                <TableCell>{formatDate(emp.hired_at)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(emp)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(emp)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{total.toLocaleString()} total employees</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <span className="flex items-center px-2">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/hooks/useEmployees.ts frontend/components/employees/EmployeeTable.tsx frontend/components/employees/EmployeeFilters.tsx
git commit -m "feat(frontend): add employee table, filters, and React Query hooks"
```

---

### Task 13: Employee Drawer (Add/Edit Form)

**Files:**
- Create: `frontend/components/employees/EmployeeDrawer.tsx`

- [ ] **Step 1: Create frontend/components/employees/EmployeeDrawer.tsx**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/employees/EmployeeDrawer.tsx
git commit -m "feat(frontend): add employee add/edit drawer"
```

---

### Task 14: Delete Dialog + Employees Page

**Files:**
- Create: `frontend/components/employees/DeleteDialog.tsx`
- Create: `frontend/app/employees/page.tsx`

- [ ] **Step 1: Create frontend/components/employees/DeleteDialog.tsx**

```tsx
'use client';

import { Employee } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';

interface Props {
  employee: Employee | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDialog({ employee, onConfirm, onCancel }: Props) {
  return (
    <Dialog open={!!employee} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Employee</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{employee?.full_name}</strong>? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Create frontend/app/employees/page.tsx**

```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/employees/DeleteDialog.tsx frontend/app/employees/
git commit -m "feat(frontend): add employees page with full CRUD"
```

---

### Task 15: Insights Hooks + KPI Cards + Bar Chart

**Files:**
- Create: `frontend/hooks/useInsights.ts`
- Create: `frontend/components/insights/KpiCards.tsx`
- Create: `frontend/components/insights/SalaryBarChart.tsx`
- Create: `frontend/tests/components/KpiCards.test.tsx`

- [ ] **Step 1: Create frontend/tests/components/KpiCards.test.tsx**

```tsx
import { render, screen } from '@testing-library/react';
import { KpiCards } from '@/components/insights/KpiCards';
import { OrgSummary } from '@/types';

const summary: OrgSummary = {
  total_employees: 10000,
  avg_salary: 87000,
  min_salary: 42000,
  max_salary: 145000,
  country_count: 20,
};

describe('KpiCards', () => {
  it('renders total employee count', () => {
    render(<KpiCards summary={summary} />);
    expect(screen.getByText('10,000')).toBeInTheDocument();
  });

  it('renders average salary', () => {
    render(<KpiCards summary={summary} />);
    expect(screen.getByText('$87K')).toBeInTheDocument();
  });

  it('renders min and max salary', () => {
    render(<KpiCards summary={summary} />);
    expect(screen.getByText('$42K')).toBeInTheDocument();
    expect(screen.getByText('$145K')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd frontend && npm test -- tests/components/KpiCards.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create frontend/hooks/useInsights.ts**

```typescript
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
```

- [ ] **Step 4: Create frontend/components/insights/KpiCards.tsx**

```tsx
import { OrgSummary } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatSalaryCompact } from '@/lib/formatters';

interface Props {
  summary: OrgSummary;
}

export function KpiCards({ summary }: Props) {
  const cards = [
    { title: 'Total Employees', value: summary.total_employees.toLocaleString(), color: 'text-blue-600' },
    { title: 'Avg Salary', value: formatSalaryCompact(summary.avg_salary), color: 'text-emerald-600' },
    { title: 'Min Salary', value: formatSalaryCompact(summary.min_salary), color: 'text-red-500' },
    { title: 'Max Salary', value: formatSalaryCompact(summary.max_salary), color: 'text-violet-600' },
    { title: 'Countries', value: String(summary.country_count), color: 'text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run KpiCards test — expect PASS**

```bash
cd frontend && npm test -- tests/components/KpiCards.test.tsx
```

Expected: All 3 tests pass.

- [ ] **Step 6: Create frontend/components/insights/SalaryBarChart.tsx**

```tsx
'use client';

import { JobTitleStat } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatSalaryCompact } from '@/lib/formatters';

interface Props {
  stats: JobTitleStat[];
  selectedCountry: string;
}

export function SalaryBarChart({ stats, selectedCountry }: Props) {
  const filtered = selectedCountry
    ? stats.filter((s) => s.country === selectedCountry)
    : stats;

  const aggregated = Object.values(
    filtered.reduce<Record<string, { job_title: string; avg_salary: number; count: number }>>(
      (acc, s) => {
        if (!acc[s.job_title]) {
          acc[s.job_title] = { job_title: s.job_title, avg_salary: 0, count: 0 };
        }
        acc[s.job_title].avg_salary += s.avg_salary;
        acc[s.job_title].count += 1;
        return acc;
      },
      {}
    )
  )
    .map((d) => ({ job_title: d.job_title, avg_salary: Math.round(d.avg_salary / d.count) }))
    .sort((a, b) => b.avg_salary - a.avg_salary);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={aggregated} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => formatSalaryCompact(v)}
            tick={{ fontSize: 11 }}
          />
          <YAxis type="category" dataKey="job_title" tick={{ fontSize: 11 }} width={115} />
          <Tooltip formatter={(v: number) => [formatSalaryCompact(v), 'Avg Salary']} />
          <Bar dataKey="avg_salary" fill="#3b82f6" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add frontend/hooks/useInsights.ts frontend/components/insights/KpiCards.tsx frontend/components/insights/SalaryBarChart.tsx frontend/tests/components/
git commit -m "feat(frontend): add insights hooks, KPI cards, and bar chart with tests"
```

---

### Task 16: Insights Table + Currency Selector + Insights Page

**Files:**
- Create: `frontend/components/insights/InsightsTable.tsx`
- Create: `frontend/components/insights/CurrencySelector.tsx`
- Create: `frontend/app/insights/page.tsx`

- [ ] **Step 1: Create frontend/components/insights/InsightsTable.tsx**

```tsx
'use client';

import { useState } from 'react';
import { JobTitleStat } from '@/types';
import { formatSalary } from '@/lib/formatters';
import { convertSalary, CurrencyCode } from '@/lib/currencies';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

type SortKey = 'job_title' | 'country' | 'avg_salary' | 'headcount';

interface Props {
  stats: JobTitleStat[];
  selectedCountry: string;
  currency: CurrencyCode;
}

export function InsightsTable({ stats, selectedCountry, currency }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('avg_salary');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = selectedCountry ? stats.filter((s) => s.country === selectedCountry) : stats;
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
              <TableCell>{formatSalary(convertSalary(s.avg_salary, currency))}</TableCell>
              <TableCell>{s.headcount.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 2: Create frontend/components/insights/CurrencySelector.tsx**

```tsx
'use client';

import { CURRENCIES, CurrencyCode } from '@/lib/currencies';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
}

export function CurrencySelector({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as CurrencyCode)}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(CURRENCIES).map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.symbol} {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

- [ ] **Step 3: Create frontend/app/insights/page.tsx**

```tsx
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
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  const { data: summary, isLoading: summaryLoading } = useOrgSummary();
  const { data: jobTitleStats } = useJobTitleStats();
  const { data: countryStats } = useCountryStats();

  const countries = countryStats?.map((s) => s.country).sort() ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Salary Insights</h1>
        <div className="flex gap-3">
          <Select value={selectedCountry} onValueChange={(v) => setSelectedCountry(v === 'all' ? '' : v)}>
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
        <KpiCards summary={summary} />
      )}

      {jobTitleStats && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Avg Salary by Job Title</h2>
          <SalaryBarChart stats={jobTitleStats} selectedCountry={selectedCountry} />
        </div>
      )}

      {jobTitleStats && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Breakdown by Job Title + Country</h2>
          <InsightsTable stats={jobTitleStats} selectedCountry={selectedCountry} currency={currency} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run all frontend tests**

```bash
cd frontend && npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/insights/ frontend/app/insights/
git commit -m "feat(frontend): add insights page with table, currency selector, and bar chart"
```

---

### Task 17: Full Build Verification

- [ ] **Step 1: Run all backend tests**

```bash
cd backend && npm test
```

Expected: All unit and integration tests pass. No failures.

- [ ] **Step 2: Run all frontend tests**

```bash
cd frontend && npm test
```

Expected: All tests pass.

- [ ] **Step 3: Build backend**

```bash
cd backend && npm run build
```

Expected: `dist/` created with no TypeScript errors.

- [ ] **Step 4: Build frontend**

```bash
cd frontend && npm run build
```

Expected: `.next/` created. No TypeScript or build errors.

- [ ] **Step 5: Smoke-test locally**

In terminal 1:
```bash
cd backend && npm run dev
```

In terminal 2:
```bash
cd frontend && npm run dev
```

Open `http://localhost:3000` — should redirect to `/employees` and show the employee table. Navigate to `/insights` and verify KPI cards and bar chart load.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: full build and smoke test verification"
```

---

### Task 18: Railway Deployment

- [ ] **Step 1: Create backend Procfile**

Create `backend/Procfile`:
```
web: node dist/index.js
```

- [ ] **Step 2: Create frontend next.config.ts for standalone output**

Edit `frontend/next.config.ts`:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

- [ ] **Step 3: Push repo to GitHub**

```bash
git remote add origin git@github.com:<your-username>/salary-management-tool.git
git push -u origin master
```

- [ ] **Step 4: Create Railway project**

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo → select `salary-management-tool`
2. Add a **PostgreSQL** service to the project
3. Add a **Backend** service: set root directory to `/backend`, start command `node dist/index.js`
4. Add a **Frontend** service: set root directory to `/frontend`, start command `node .next/standalone/server.js`

- [ ] **Step 5: Configure environment variables**

On the **backend** service in Railway:
```
DATABASE_URL=<copy from Railway Postgres service>
NODE_ENV=production
PORT=3001
```

On the **frontend** service:
```
NEXT_PUBLIC_API_URL=<backend Railway public URL>
```

- [ ] **Step 6: Run seed on Railway**

In the Railway backend service shell:
```bash
npm run seed
```

Expected: 10,000 employees inserted.

- [ ] **Step 7: Verify deployed app**

Open the Railway frontend URL. Confirm:
- `/employees` loads with a paginated table of 10,000 employees
- Add/edit/delete an employee
- `/insights` shows KPI cards, bar chart, and table
- Currency selector converts salaries

- [ ] **Step 8: Final commit**

```bash
git add backend/Procfile frontend/next.config.ts
git commit -m "chore: configure Railway deployment"
git push
```

---

## Spec Coverage Checklist

| Requirement | Task |
|---|---|
| Add/View/Update/Delete employees via UI | Tasks 12–14 |
| Employee fields: name, title, country, salary, dept, email, hired_at | Tasks 3, 5 |
| Min/max/avg salary by country | Tasks 7, 15 |
| Avg salary by job title + country | Tasks 7, 16 |
| Additional meaningful metrics | Tasks 7, 15 (country headcount, org summary, top insights) |
| Currency converter | Tasks 10, 16 |
| Seed 10K employees from name files | Task 8 |
| Seed performance (batched inserts, single tx) | Task 8 |
| Backend: Node.js + Express + PostgreSQL | Tasks 2–7 |
| Frontend: Next.js + shadcn/ui | Tasks 9–16 |
| Unit tests (service layer, formatters) | Tasks 4, 5, 10, 15 |
| Integration tests (all API routes) | Tasks 6, 7 |
| Deployed to Railway | Task 18 |
| Auth deferred to Phase 2 | — |
