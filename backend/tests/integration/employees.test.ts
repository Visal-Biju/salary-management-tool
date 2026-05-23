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
