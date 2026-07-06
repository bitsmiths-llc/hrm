import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type BalanceCardProps = {
  title: string;
  /** Amount consumed (leave days used, PKR claimed…). */
  used: number;
  /** The cap the balance runs against (22 days, 50,000 PKR…). */
  total: number;
  /** Formats both numbers for display, e.g. formatCurrency or `${n} days`. */
  format?: (value: number) => string;
  /** Extra line, e.g. "Unpaid taken this year: 2 days". */
  hint?: string;
};

export function BalanceCard({
  title,
  used,
  total,
  format = String,
  hint,
}: BalanceCardProps) {
  const remaining = Math.max(0, total - used);
  const percentUsed = total > 0 ? Math.min(100, (used / total) * 100) : 0;

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <div className='flex items-baseline justify-between gap-2'>
          <p className='text-3xl font-bold tracking-tight'>
            {format(remaining)}
          </p>
          <p className='text-sm text-muted-foreground'>
            of {format(total)} left
          </p>
        </div>
        <Progress
          value={percentUsed}
          aria-label={`${title}: ${format(used)} used of ${format(total)}`}
        />
        <p className='text-xs text-muted-foreground'>
          {format(used)} used{hint ? ` · ${hint}` : ''}
        </p>
      </CardContent>
    </Card>
  );
}
