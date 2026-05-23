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
