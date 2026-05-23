import { OrgSummary } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatConvertedSalary, CurrencyCode } from '@/lib/currencies';

interface Props {
  summary: OrgSummary;
  currency: CurrencyCode;
}

export function KpiCards({ summary, currency }: Props) {
  const cards = [
    { title: 'Total Employees', value: summary.total_employees.toLocaleString(), color: 'text-blue-600' },
    { title: 'Avg Salary', value: formatConvertedSalary(summary.avg_salary, currency), color: 'text-emerald-600' },
    { title: 'Min Salary', value: formatConvertedSalary(summary.min_salary, currency), color: 'text-red-500' },
    { title: 'Max Salary', value: formatConvertedSalary(summary.max_salary, currency), color: 'text-violet-600' },
    { title: 'Countries', value: String(summary.country_count), color: 'text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
