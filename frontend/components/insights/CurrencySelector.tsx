'use client';

import { CURRENCIES, CurrencyCode } from '@/lib/currencies';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
}

export function CurrencySelector({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange((v ?? 'USD') as CurrencyCode)}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(CURRENCIES).map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.symbol} {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
