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
