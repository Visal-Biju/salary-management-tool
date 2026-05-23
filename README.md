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
