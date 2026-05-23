'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/employees', label: 'Employees' },
  { href: '/insights', label: 'Insights' },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-8">
          <span className="text-lg font-semibold tracking-tight">SalaryTool</span>
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                  pathname.startsWith(tab.href)
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
