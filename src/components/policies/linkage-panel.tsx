'use client';

import {
  CheckCircle2,
  GitCompareArrows,
  Link2Off,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useMarkPolicyReviewed } from '@/hooks/actions/use-mark-policy-reviewed';
import { usePolicyLinkage } from '@/hooks/queries/policies';
import { useHrmSettings } from '@/hooks/queries/settings';

import { EmptyState } from '@/components/hrm/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import {
  hasLinkedRule,
  POLICY_SETTING_META,
  policyLinkFor,
} from '@/constants/policy-links';

import type { HrmSettings, PolicyLinkage } from '@/types/hrm';

/**
 * Ties each policy document to the numeric rule it governs (BIT-25, M3.5).
 *
 * The slug→rule map is app-level (`POLICY_LINKS`); the panel joins it to the
 * *live* enforced values (`useHrmSettings`) and to a persisted reconciliation
 * marker (`usePolicyLinkage`) to flag drift — a policy that has published a new
 * version since an admin last confirmed it still matches the rule. "Mark
 * reviewed" advances the marker only; it never changes an enforced value.
 */
export function PolicyLinkagePanel() {
  const { data: linkage, isLoading: linkageLoading } = usePolicyLinkage();
  const { data: settings, isLoading: settingsLoading } = useHrmSettings();

  if (linkageLoading || settingsLoading || !settings) {
    return <Skeleton className='h-64 rounded-xl' />;
  }

  if (!linkage?.length) {
    return (
      <EmptyState
        icon={GitCompareArrows}
        title='No policies to link'
        description='Create a policy document to map it to the rule it governs.'
      />
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <p className='text-sm text-muted-foreground'>
        Each policy document is tied to the numeric rule it governs. The values
        shown are the ones enforced right now. A policy flags for review once it
        has a newer version than an admin last confirmed against the rule —
        reviewing records that confirmation and never changes an enforced value.
      </p>
      <ul className='flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border'>
        {linkage.map((policy) => (
          <PolicyLinkageRow
            key={policy.policyId}
            policy={policy}
            settings={settings}
          />
        ))}
      </ul>
    </div>
  );
}

function PolicyLinkageRow({
  policy,
  settings,
}: {
  policy: PolicyLinkage;
  settings: HrmSettings;
}) {
  const [isReviewing, setIsReviewing] = useState(false);
  const { executeAsync } = useMarkPolicyReviewed();
  const link = policyLinkFor(policy.slug);

  const handleReview = async () => {
    setIsReviewing(true);
    const result = await executeAsync({ policyId: policy.policyId });
    setIsReviewing(false);
    if (result?.data) toast.success(`${policy.title} marked reviewed`);
  };

  // Unmapped, or mapped but carrying no enforced rule (Code of Conduct):
  // degrade to a plain "no linked rule" row with no drift concept.
  if (!hasLinkedRule(link)) {
    return (
      <li className='flex items-center justify-between gap-3 px-4 py-3'>
        <div className='flex min-w-0 flex-col gap-0.5'>
          <p className='truncate text-sm font-medium'>{policy.title}</p>
          <p className='truncate text-xs text-muted-foreground'>
            Version {policy.activeVersion}
          </p>
        </div>
        <span className='flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground'>
          <Link2Off className='size-3.5' aria-hidden />
          No linked rule
        </span>
      </li>
    );
  }

  return (
    <li className='flex flex-col gap-3 px-4 py-3'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex min-w-0 flex-col gap-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <p className='truncate text-sm font-medium'>{policy.title}</p>
            {policy.hasDrift ? (
              <Badge
                variant='outline'
                className='gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400'
              >
                <GitCompareArrows className='size-3' aria-hidden />
                Needs review
              </Badge>
            ) : (
              <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                <CheckCircle2 className='size-3.5 text-primary' aria-hidden />
                Reviewed
              </span>
            )}
          </div>
          <p className='text-xs text-muted-foreground'>
            Version {policy.activeVersion}
          </p>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          {policy.hasDrift && (
            <Button size='sm' onClick={handleReview} isLoading={isReviewing}>
              Mark reviewed
            </Button>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3'>
        <dl className='flex flex-wrap gap-x-6 gap-y-1'>
          {link.settingKeys.map((key) => (
            <div key={key} className='flex items-baseline gap-1.5'>
              <dt className='text-xs text-muted-foreground'>
                {POLICY_SETTING_META[key].label}
              </dt>
              <dd className='text-sm font-medium tabular-nums'>
                {POLICY_SETTING_META[key].format(settings[key])}
              </dd>
            </div>
          ))}
        </dl>
        <ul className='flex flex-col gap-0.5'>
          {link.rules.map((rule) => (
            <li key={rule} className='text-xs text-muted-foreground'>
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
