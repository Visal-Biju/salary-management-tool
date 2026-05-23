import { render, screen } from '@testing-library/react';
import { KpiCards } from '@/components/insights/KpiCards';
import { OrgSummary } from '@/types';

const summary: OrgSummary = {
  total_employees: 10000,
  avg_salary: 87000,
  min_salary: 42000,
  max_salary: 145000,
  country_count: 20,
};

describe('KpiCards', () => {
  it('renders total employee count', () => {
    render(<KpiCards summary={summary} />);
    expect(screen.getByText('10,000')).toBeInTheDocument();
  });

  it('renders average salary', () => {
    render(<KpiCards summary={summary} />);
    expect(screen.getByText('$87K')).toBeInTheDocument();
  });

  it('renders min and max salary', () => {
    render(<KpiCards summary={summary} />);
    expect(screen.getByText('$42K')).toBeInTheDocument();
    expect(screen.getByText('$145K')).toBeInTheDocument();
  });
});
