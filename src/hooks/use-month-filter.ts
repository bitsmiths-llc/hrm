import { useMemo, useState } from 'react';

/** Filters a list down to one month at a time, driven off whatever date
 *  field the caller points at. `months` is derived from the data itself
 *  (not a generic 12-month calendar), so only months with real records
 *  ever show up as options. */
export function useMonthFilter<T>(
  items: T[] | undefined,
  getDate: (item: T) => string,
) {
  const [month, setMonth] = useState('all');

  const months = useMemo(() => {
    const unique = new Set<string>();
    (items ?? []).forEach((item) => {
      const date = getDate(item);
      if (date) unique.add(date.slice(0, 7));
    });
    return Array.from(unique).sort((a, b) => b.localeCompare(a));
  }, [items, getDate]);

  const filtered = useMemo(() => {
    if (month === 'all') return items ?? [];
    return (items ?? []).filter((item) => getDate(item).startsWith(month));
  }, [items, getDate, month]);

  return { month, setMonth, months, filtered };
}
