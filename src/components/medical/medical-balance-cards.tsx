'use client';

import { Receipt, Wallet } from 'lucide-react';

import { useMedicalBalance } from '@/hooks/queries/medical';

import { StatCard } from '@/components/hrm/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

type MedicalBalanceCardsProps = {
  /** Whose balance to show. Undefined on the self page until the signed-in
   *  identity resolves — the cards render a skeleton until it does. */
  employeeId?: string;
};

/** The medical allowance is a rolling accrual (not an annual pool), so the
 *  balance is always the live figure from `medical_balance()`. "Available"
 *  is what's claimable right now (accrued − spent, already floored at 0 by
 *  the RPC); "Used" is the lifetime total of approved claims. The cap is
 *  informational only — folded into the Available card's hint instead of a
 *  headline "of cap" stat. The page's month filter narrows the history
 *  table, not this. */
export function MedicalBalanceCards({ employeeId }: MedicalBalanceCardsProps) {
  const { data: balance, isLoading } = useMedicalBalance(employeeId);

  if (isLoading || !balance) {
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
        value={formatCurrency(balance.available) || '0'}
        icon={Wallet}
        hint={`Cap ${formatCurrency(balance.cap)} · Accrues ${formatCurrency(balance.monthlyAccrual)}/month`}
      />
      <StatCard
        label='Used'
        value={formatCurrency(balance.spent) || '0'}
        icon={Receipt}
        hint='Total approved claims to date'
      />
    </div>
  );
}
