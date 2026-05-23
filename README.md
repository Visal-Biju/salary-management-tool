# Salary Management Tool

A full-stack HR salary management tool for 10,000 employees. Supports employee CRUD, salary insights with charts, and a multi-currency converter.

**Live demo:** https://frontend-production-c437.up.railway.app

---

## Features

- **Employee management** — paginated table with search, country filter, add/edit drawer, delete confirmation
- **Salary insights** — org-wide KPI cards, avg salary by job title bar chart, breakdown table with sorting
- **Currency converter** — switch displayed salaries between USD, EUR, GBP, INR, AED, CAD, AUD, SGD across all charts and tables
- **10K seed** — bulk-insert script populates 10,000 realistic employees across 20 countries and 15 job titles

## Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express, TypeScript, PostgreSQL (`pg`), Zod |
| Frontend | Next.js 14, React Query v5, shadcn/ui, Tailwind CSS, Recharts |
| Testing | Jest + Supertest (backend), Vitest + React Testing Library (frontend) |
| Deployment | Railway (backend + frontend as separate services, managed Postgres) |

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or via Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:16`)

### Backend

```bash
cd backend
cp .env.example .env        # set DATABASE_URL and TEST_DATABASE_URL
npm install
npm run dev                 # starts on port 3001, runs migrations on startup
```

### Frontend

```bash
cd frontend
cp .env.example .env.local  # set NEXT_PUBLIC_API_URL=http://localhost:3001
npm install
npm run dev                 # starts on port 3000
```

### Seed (10K employees)

```bash
cd backend
npm run seed
```

### Tests

```bash
# Backend (unit + integration — requires TEST_DATABASE_URL to be set)
cd backend && npm test

# Frontend (Vitest, no DB required)
cd frontend && npm test
```

## Project Structure

```
salary-management-tool/
├── backend/
│   ├── src/
│   │   ├── app.ts                  # Express app factory
│   │   ├── index.ts                # Entry point (migrations → server)
│   │   ├── db/                     # pg Pool + migrations
│   │   ├── middleware/validate.ts  # Zod request validation
│   │   ├── routes/                 # employees, insights
│   │   ├── services/               # DB query layer
│   │   └── seed/                   # 10K bulk-insert script
│   └── tests/
│       ├── unit/                   # pagination, validation
│       └── integration/            # employees, insights (real DB)
└── frontend/
    ├── app/
    │   ├── employees/page.tsx      # CRUD page
    │   └── insights/page.tsx       # Charts + table page
    ├── components/
    │   ├── employees/              # Table, filters, drawer, delete dialog
    │   └── insights/               # KPI cards, bar chart, table, currency selector
    ├── hooks/                      # React Query hooks
    └── lib/                        # API client, formatters, currency conversion
```

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/employees` | Paginated list — `page`, `limit`, `search`, `country`, `jobTitle` |
| GET | `/api/employees/:id` | Single employee |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/insights/summary` | Org-wide headcount, avg/min/max salary, country count |
| GET | `/api/insights/country-stats` | Min/max/avg salary + headcount per country |
| GET | `/api/insights/jobtitle-stats` | Avg salary + headcount per job title × country |

## Deployment

Both services are defined in `railway.toml`. Deploy with the Railway CLI:

```bash
# Backend
railway up ./backend --path-as-root --service backend

# Frontend
railway up ./frontend --path-as-root --service frontend
```

**Environment variables:**

| Service | Variable | Value |
|---|---|---|
| backend | `DATABASE_URL` | Injected by Railway Postgres plugin |
| backend | `NODE_ENV` | `production` |
| backend | `PORT` | `3001` |
| frontend | `NEXT_PUBLIC_API_URL` | Backend public Railway URL |

After first deploy, seed the database:

```bash
DATABASE_URL=<railway-postgres-public-url> NODE_ENV=production npm run seed
```
