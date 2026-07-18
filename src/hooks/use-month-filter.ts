import { useMemo, useState } from 'react';

/** Filters a list down to one month at a time, driven off whatever date
 *  field the caller points at. `initialMonth` seeds the filter — pass a
 *  'YYYY' (whole year) or 'YYYY-MM' value to open on a period rather than the
 *  'all' default. */
export function useMonthFilter<T>(
  items: T[] | undefined,
  getDate: (item: T) => string,
  initialMonth = 'all',
) {
  const [month, setMonth] = useState(initialMonth);

  const filtered = useMemo(() => {
    if (month === 'all') return items ?? [];
    return (items ?? []).filter((item) => getDate(item).startsWith(month));
  }, [items, getDate, month]);

  return { month, setMonth, filtered };
}
