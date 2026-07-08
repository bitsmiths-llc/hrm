'use client';

import { CalendarClock, Receipt } from 'lucide-react';
import { useMemo } from 'react';

import { useMedicalBalance, useMedicalClaims } from '@/hooks/queries/medical';

import { BalanceCard } from '@/components/hrm/balance-card';
import { StatCard } from '@/components/hrm/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

type MedicalBalanceCardsProps = {
  employeeId: string;
  /** 'all' | 'YYYY' | 'YYYY-MM' — the period selected by the page-level
   *  month filter. */
  month: string;
};

/** The current year shows the live accrued balance (forward-looking — how
 *  much is left to claim). A past year is closed, so "balance remaining"
 *  no longer applies — it shows what was actually claimed instead. */
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

  if (isCurrentYear) {
    if (balanceLoading || !balance) {
      return (
        <div className='grid gap-4 md:grid-cols-2'>
          <Skeleton className='h-40 rounded-xl' />
          <Skeleton className='h-40 rounded-xl' />
        </div>
      );
    }
    return (
      <div className='grid gap-4 md:grid-cols-2'>
        <BalanceCard
          title='Medical Allowance'
          mode='accrued'
          used={balance.accrued}
          total={balance.cap}
          format={(amount) => formatCurrency(amount) || '0'}
          hint={`Accrues ${formatCurrency(balance.monthlyAccrual)}/month`}
        />
        <StatCard
          label='Monthly Accrual'
          value={formatCurrency(balance.monthlyAccrual)}
          icon={CalendarClock}
          hint='Adds to your balance each month, up to the cap'
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
