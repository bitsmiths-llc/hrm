import Image from 'next/image';
import Link from 'next/link';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

/** Standalone shell: onboarding employees aren't Active yet, so they don't
 *  get the app sidebar — just a minimal branded frame. */
export default function OnboardingLayout({
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
      </header>
      <main className='mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4 md:p-8'>
        {children}
      </main>
    </div>
  );
}
