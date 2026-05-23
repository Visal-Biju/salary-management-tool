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
