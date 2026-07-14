'use client';

import { CalendarClock, Receipt, Wallet } from 'lucide-react';
import { useMemo } from 'react';

import { useMedicalBalance, useMedicalClaims } from '@/hooks/queries/medical';

import { StatCard } from '@/components/hrm/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

type MedicalBalanceCardsProps = {
  employeeId: string;
  /** 'all' | 'YYYY' | 'YYYY-MM' — the period selected by the page-level
   *  month filter. */
  month: string;
};

/** The current year shows the live available balance and lifetime used total
 *  (forward-looking). A past year is closed, so "balance remaining" no
 *  longer applies — it shows what was actually claimed that year instead. */
export function MedicalBalanceCards({
  employeeId,
  month,
}: MedicalBalanceCardsProps) {
  const currentYear = new Date().getFullYear();
  const year = month === 'all' ? currentYear : Number(month.slice(0, 4));
  const isCurrentYear = year === currentYear;

  const { data: balance, isLoading: balanceLoading } =
    useMedicalBalance(employeeId);
  const { data: claims, isLoading: claimsLoading } =
    useMedicalClaims(employeeId);

  const { totalClaimed, claimCount } = useMemo(() => {
    const approvedInYear = (claims ?? []).filter(
      (claim) =>
        claim.expenseDate.startsWith(String(year)) &&
        claim.status === 'approved',
    );
    return {
      totalClaimed: approvedInYear.reduce(
        (sum, claim) => sum + claim.amount,
        0,
      ),
      claimCount: approvedInYear.length,
    };
  }, [claims, year]);

  const totalUsedAllTime = useMemo(
    () =>
      (claims ?? [])
        .filter((claim) => claim.status === 'approved')
        .reduce((sum, claim) => sum + claim.amount, 0),
    [claims],
  );

  if (isCurrentYear) {
    if (balanceLoading || claimsLoading || !balance) {
      return (
        <div className='grid gap-4 md:grid-cols-2'>
          <Skeleton className='h-40 rounded-xl' />
          <Skeleton className='h-40 rounded-xl' />
        </div>
      );
    }
    return (
      <div className='grid gap-4 md:grid-cols-2'>
        <StatCard
          label='Available Balance'
          value={formatCurrency(balance.accrued) || '0'}
          icon={Wallet}
          hint={`Cap ${formatCurrency(balance.cap)} · Accrues ${formatCurrency(balance.monthlyAccrual)}/month`}
        />
        <StatCard
          label='Used'
          value={formatCurrency(totalUsedAllTime) || '0'}
          icon={Receipt}
          hint='Total approved claims to date'
        />
      </div>
    );
  }

  if (claimsLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2'>
        <Skeleton className='h-40 rounded-xl' />
        <Skeleton className='h-40 rounded-xl' />
      </div>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <StatCard
        label={`Total Claimed · ${year}`}
        value={formatCurrency(totalClaimed) || '0'}
        icon={Receipt}
        hint='Sum of approved claims for the selected year'
      />
      <StatCard
        label={`Claims Approved · ${year}`}
        value={`${claimCount}`}
        icon={CalendarClock}
        hint='A closed year shows totals, not a live balance'
      />
    </div>
  );
}
