import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-6 text-center'>
      <Image
        src={appConfig.logo}
        alt='Bitsmiths logo'
        width={64}
        height={67}
        priority
      />

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
        <Link href={paths.auth.login}>
          <Button size='lg' variant='ghost'>
            Sign in
          </Button>
        </Link>
      </div>
    </div>
  );
}
