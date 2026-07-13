'use client';

import { useMedicalBalance } from '@/hooks/queries/medical';

import { BalanceCard } from '@/components/hrm/balance-card';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

type MedicalBalanceCardsProps = {
  /** Whose balance to show. Undefined on the self page until the signed-in
   *  identity resolves — the cards render a skeleton until it does. */
  employeeId?: string;
};

const fmt = (amount: number) => formatCurrency(amount) || 'PKR 0';

/** The medical allowance is a rolling accrual (not an annual pool), so the
 *  balance is always the live figure from `medical_balance()`. The hero card is
 *  what's claimable right now (available = accrued − approved spend, with a bar
 *  that fills as it's spent); the second shows how the allowance is accruing
 *  toward the cap. The page's month filter narrows the history table, not this. */
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
      <BalanceCard
        title='Available to Claim'
        mode='consumed'
        used={balance.spent}
        total={balance.accrued}
        format={fmt}
        hint={`accrues ${fmt(balance.monthlyAccrual)}/month`}
      />
      <BalanceCard
        title='Allowance Accrued'
        mode='accrued'
        used={balance.accrued}
        total={balance.cap}
        format={fmt}
      />
    </div>
  );
}
