import Image from 'next/image';
import Link from 'next/link';

import { ModeToggle } from '@/components/common/mode-toggle';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

/** Standalone shell: an employee whose onboarding is under review isn't Active
 *  yet, so — like onboarding — they get a minimal branded frame, not the app
 *  sidebar. */
export default function PendingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='flex min-h-svh flex-col bg-background'>
      <header className='flex h-14 shrink-0 items-center border-b border-border px-4 md:px-6'>
        <Link href={paths.home} className='flex items-center gap-2'>
          <Image
            src={appConfig.logo}
            alt='Bitsmiths logo'
            width={20}
            height={21}
          />
          <span className='text-sm font-semibold'>{appConfig.title}</span>
        </Link>
        <div className='ml-auto'>
          <ModeToggle />
        </div>
      </header>
      <main className='mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-6 p-4 md:p-8'>
        {children}
      </main>
    </div>
  );
}
