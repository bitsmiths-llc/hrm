import { Building2, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { appConfig } from '@/config/app';

const highlights = ['Employee records', 'Payroll', 'Time off & leave'] as const;

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-6 text-center sm:gap-10'>
      <div className='flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground'>
        <Building2 className='size-8' aria-hidden />
      </div>

      <div className='flex max-w-xl flex-col gap-4'>
        <Badge variant='secondary' className='mx-auto w-fit gap-1.5'>
          <Sparkles className='size-3.5' aria-hidden />
          Human Resource Management
        </Badge>
        <h1 className='text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
          Welcome to {appConfig.appName}
        </h1>
        <p className='text-base text-muted-foreground sm:text-lg'>
          {appConfig.description}
        </p>
      </div>

      <Separator className='max-w-xs' />

      <div className='flex flex-wrap items-center justify-center gap-2'>
        {highlights.map((item) => (
          <Badge key={item} variant='outline'>
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
