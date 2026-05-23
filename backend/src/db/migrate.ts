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
