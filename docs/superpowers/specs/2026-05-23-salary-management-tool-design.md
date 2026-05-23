# Salary Management Tool — Design Spec

**Date:** 2026-05-23  
**Repo:** `salary-management-tool` (personal GitHub)  
**Context:** Technical assessment — HR salary management tool for 10,000 employees

---

## Overview

A full-stack salary management tool for an HR Manager persona. Supports adding, viewing, updating, and deleting employees, plus salary insights (min/max/avg by country, avg salary by job title + country, org-wide summary).

**Stack:** Node.js + Express (backend), Next.js + shadcn/ui + Tailwind (frontend), PostgreSQL (database), Railway (deployment).

---

## Architecture

Monorepo with two independently deployable packages:

```
salary-management-tool/
├── backend/          # Node.js + Express REST API
│   ├── src/
│   │   ├── routes/   # employees, insights
│   │   ├── services/ # business logic (pure functions)
│   │   ├── db/       # Postgres client, migrations
│   │   └── seed/     # seed script + name files
│   └── package.json
├── frontend/         # Next.js (SPA mode), shadcn/ui + Tailwind
│   ├── app/
│   │   ├── page.tsx              # redirects to /employees
│   │   ├── employees/page.tsx
│   │   └── insights/page.tsx
│   └── package.json
├── docs/
│   └── superpowers/specs/
└── railway.toml
```

**Data flow:** Next.js fetches from the Express API (`/api/*`). No Next.js server components — clean client/server split. Railway deploys backend and frontend as two separate services in one project, connected via environment variables.

---

## Data Model

Single `employees` table — no joins needed, queries stay fast at 10K rows.

```sql
CREATE TABLE employees (
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

CREATE INDEX idx_employees_country ON employees(country);
CREATE INDEX idx_employees_country_jobtitle ON employees(country, job_title);
```

**Extra fields beyond spec:** `department` (HR grouping), `email` (unique identifier), `hired_at` (tenure insights). Composite index on `(country, job_title)` ensures insight aggregations are fast.

---

## API Design

All endpoints under `/api`, JSON throughout.

### Employees

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/employees` | Paginated list. Query params: `page`, `limit` (default 20), `search`, `country`, `jobTitle` |
| GET | `/api/employees/:id` | Single employee |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |

List response shape: `{ data: Employee[], total: number, page: number, limit: number }`

### Insights

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/insights/country-stats` | Min/max/avg salary per country (all countries) |
| GET | `/api/insights/jobtitle-stats` | Avg salary by job title + country |
| GET | `/api/insights/summary` | Org-wide: headcount, avg, min, max, country count |

### Error handling

- `400` — validation failure, returns field-level errors
- `404` — employee not found
- `409` — duplicate email on create/update

---

## Frontend

### Layout

Tabbed navigation header: "SalaryTool" logo + **Employees** and **Insights** tabs. Active tab driven by `usePathname`.

### Employees page (`/employees`)

- Data table: Name, Job Title, Department, Country, Salary, Hired At, Actions
- Server-side pagination (20 rows/page)
- Search bar + Country and Job Title filter dropdowns
- **Add Employee** button opens a slide-over drawer with a form
- Row actions: Edit (drawer, pre-filled) and Delete (confirm dialog)
- `react-query` for data fetching — optimistic updates, no full page reloads on mutations

### Insights page (`/insights`)

- Country filter dropdown (defaults to "All Countries")
- KPI cards row: Total Employees, Avg Salary, Min Salary, Max Salary
- Bar chart: avg salary by job title (`recharts`)
- Sortable data table: job title + country + avg salary

### State management

`react-query` for all server state. No global state store — all data is server-derived.

---

## Seeding

Script at `backend/src/seed/seed.ts`. Designed to be fast and idempotent — safe to run repeatedly.

**Strategy:**
- `TRUNCATE employees RESTART IDENTITY` at start (idempotent re-runs)
- Load `first_names.txt` and `last_names.txt` into memory once
- Generate all 10,000 rows in-process
- Insert in batches of 1,000 rows per `INSERT ... VALUES (...)` statement
- Wrap all batches in a single transaction
- Realistic data: ~20 countries, ~15 job titles with salary ranges per title, sequential emails for uniqueness (`first.last.N@company.com`)

**Expected runtime:** Under 3 seconds locally.

---

## Testing

### Backend (Jest + Supertest)

**Unit tests** — service layer (no DB dependency):
- Salary aggregation logic
- Validation helpers
- Pagination math

**Integration tests** — API routes via Supertest against a real `salary_test` database:
- `GET /api/employees` — pagination, filtering, search
- `POST /api/employees` — valid create, invalid 400, duplicate email 409
- `PUT /api/employees/:id` — update, 404 on missing
- `DELETE /api/employees/:id` — delete, 404 on missing
- `GET /api/insights/country-stats` — correct aggregates
- `GET /api/insights/jobtitle-stats` — correct grouping

### Frontend (Vitest + React Testing Library)

- Salary formatter utility (`82000` → `$82K`)
- KPI card renders correct value and label
- Employee form validation (required fields, salary must be positive)
- Employee table renders paginated rows

No E2E tests — out of scope for this assessment.

---

## Deployment

**Railway** — two services in one project:

| Service | Source | Build | Start |
|---------|--------|-------|-------|
| `backend` | `/backend` | `npm install && npm run build` | `node dist/index.js` |
| `frontend` | `/frontend` | `npm install && npm run build` | Next.js static export |
| `postgres` | Railway managed | — | — |

**Environment variables:**
- Backend: `DATABASE_URL` (Railway injects), `PORT`, `NODE_ENV`
- Frontend: `NEXT_PUBLIC_API_URL` (Railway backend URL)

**Migrations:** Run automatically on backend startup via `migrate.ts`.

**Seeding:** One-off manual command via Railway CLI or dashboard shell after first deploy: `npm run seed`.

**`railway.toml`** at repo root configures both services — no separate repos needed.

---

## Out of Scope (Phase 1)

**Authentication & Authorization** are deferred to Phase 2. The app is accessible without login in Phase 1 — no session management, no role-based access control, no JWT/OAuth. Phase 2 will add HR Manager login, protected routes, and role-based permissions.

---

## Additional Meaningful Metrics (beyond spec)

- **Headcount by country** — table showing employee distribution
- **Top 5 highest-paid employees** — quick view for HR anomaly detection
- **Salary distribution by department** — complements job title view
- **Tenure insight** — avg salary by years since `hired_at` (grouped by 0–1yr, 1–3yr, 3–5yr, 5yr+)
- **Salary currency converter** — convert any displayed salary into a target currency (USD, INR, AED, GBP, EUR, etc.) via a currency selector on the Insights page. Rates stored as static defaults at build time (no external API dependency); HR Managers can override rates manually. All salaries are stored in USD internally; conversion is display-only.

