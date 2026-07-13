import Image from 'next/image';
import Link from 'next/link';

import { ModeToggle } from '@/components/common/mode-toggle';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='relative flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-4'>
      <div className='absolute right-4 top-4'>
        <ModeToggle />
      </div>
      <Link href={paths.home} className='flex items-center gap-2'>
        <Image
          src={appConfig.logo}
          alt='Bitsmiths logo'
          width={24}
          height={25}
        />
        <span className='text-base font-semibold'>{appConfig.title}</span>
      </Link>
      <div className='w-full max-w-sm'>{children}</div>
    </div>
  );
}
