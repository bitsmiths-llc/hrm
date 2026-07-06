import { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  /** Small line under the value, e.g. "3 awaiting review". */
  hint?: string;
};

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <Card>
      <CardContent className='flex items-start justify-between gap-4 p-6'>
        <div className='flex flex-col gap-1'>
          <p className='text-sm text-muted-foreground'>{label}</p>
          <p className='text-3xl font-bold tracking-tight'>{value}</p>
          {!!hint && <p className='text-xs text-muted-foreground'>{hint}</p>}
        </div>
        {!!Icon && (
          <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground'>
            <Icon className='size-5' aria-hidden />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
