import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type BalanceCardProps = {
  title: string;
  /** In 'consumed' mode: amount used against a shrinking pool (leave days
   *  taken). In 'accrued' mode: the current available balance itself
   *  (medical allowance accrued so far). */
  used: number;
  /** The cap the balance runs against (22 days, 50,000 PKR…). */
  total: number;
  /** Formats both numbers for display, e.g. formatCurrency or `${n} days`. */
  format?: (value: number) => string;
  /** Extra line, e.g. "Unpaid taken this year: 2 days". */
  hint?: string;
  /** 'consumed' (default): the pool shrinks as `used` grows — headline
   *  shows what's left, the bar fills as it's used up (Leave).
   *  'accrued': `used` IS the available balance — headline shows it
   *  directly, and the bar fills as it grows toward the cap (Medical),
   *  so more green means more available rather than less. */
  mode?: 'consumed' | 'accrued';
};

export function BalanceCard({
  title,
  used,
  total,
  format = String,
  hint,
  mode = 'consumed',
}: BalanceCardProps) {
  const isAccrued = mode === 'accrued';
  const headline = isAccrued ? used : Math.max(0, total - used);
  const percentFilled = total > 0 ? Math.min(100, (used / total) * 100) : 0;

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
            {format(headline)}
          </p>
          <p className='text-sm text-muted-foreground'>
            {isAccrued
              ? `of ${format(total)} maximum`
              : `of ${format(total)} left`}
          </p>
        </div>
        <Progress
          value={percentFilled}
          aria-label={
            isAccrued
              ? `${title}: ${format(used)} available of ${format(total)}`
              : `${title}: ${format(used)} used of ${format(total)}`
          }
        />
        <p className='text-xs text-muted-foreground'>
          {isAccrued
            ? `${format(Math.max(0, total - used))} more to reach the cap`
            : `${format(used)} used`}
          {hint ? ` · ${hint}` : ''}
        </p>
      </CardContent>
    </Card>
  );
}
