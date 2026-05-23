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
