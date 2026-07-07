import { useMemo, useState } from 'react';

/** Months from January through the current month of the current year,
 *  most recent first — i.e. every month that's already happened this
 *  year, regardless of whether it has any records yet. */
function currentYearMonthsToDate(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const months: string[] = [];
  for (let month = now.getMonth(); month >= 0; month--) {
    months.push(`${year}-${String(month + 1).padStart(2, '0')}`);
  }
  return months;
}

/** Filters a list down to one month at a time, driven off whatever date
 *  field the caller points at. */
export function useMonthFilter<T>(
  items: T[] | undefined,
  getDate: (item: T) => string,
) {
  const [month, setMonth] = useState('all');
  const months = useMemo(() => currentYearMonthsToDate(), []);

  const filtered = useMemo(() => {
    if (month === 'all') return items ?? [];
    return (items ?? []).filter((item) => getDate(item).startsWith(month));
  }, [items, getDate, month]);

  return { month, setMonth, months, filtered };
}
