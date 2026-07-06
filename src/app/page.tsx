import { Building2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-6 text-center'>
      <div className='flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground'>
        <Building2 className='size-8' aria-hidden />
      </div>

      <div className='flex max-w-xl flex-col gap-3'>
        <h1 className='text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
          Welcome to {appConfig.appName}
        </h1>
        <p className='text-base text-muted-foreground sm:text-lg'>
          {appConfig.description}
        </p>
      </div>

      <div className='flex flex-col gap-3 sm:flex-row'>
        <Link href={paths.employee.dashboard}>
          <Button size='lg'>Employee app</Button>
        </Link>
        <Link href={paths.admin.dashboard}>
          <Button size='lg' variant='outline'>
            Admin app
          </Button>
        </Link>
      </div>
    </div>
  );
}
