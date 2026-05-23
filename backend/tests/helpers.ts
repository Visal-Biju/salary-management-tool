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
