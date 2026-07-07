import { format } from 'date-fns';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type MonthFilterProps = {
  /** YYYY-MM values, most recent first. */
  months: string[];
  /** 'all' or one of `months`. */
  value: string;
  onChange: (value: string) => void;
};

/** Month dropdown for filtering a request/claim/log history table. Only
 *  renders months that actually have data — never an empty calendar. */
export function MonthFilter({ months, value, onChange }: MonthFilterProps) {
  if (!months.length) return null;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className='h-8 w-40'>
        <SelectValue placeholder='All time' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>All time</SelectItem>
        {months.map((month) => (
          <SelectItem key={month} value={month}>
            {format(new Date(`${month}-01`), 'MMMM yyyy')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
