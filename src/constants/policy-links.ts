import { formatCurrency, formatNumber } from '@/utils/number-functions';

import { paths } from '@/constants/paths';

import type { HrmSettings } from '@/types/hrm';

/** The enforced-rule settings a policy can surface — the subset of `HrmSettings`
 *  (backed by `payroll_settings`) that policy documents describe in prose. */
export type PolicySettingKey = Extract<
  keyof HrmSettings,
  | 'leavePoolDays'
  | 'medicalMonthlyAccrual'
  | 'medicalBalanceCap'
  | 'overtimeMultiplier'
>;

/** App-level map from a policy `slug` to the system rule(s) it governs. Kept in
 *  code, not a join table, so the enforced-rule references sit next to the
 *  constants that define them; only the reconciliation *marker* is persisted
 *  (see `policy_reconciliations` / `usePolicyLinkage`). The seeded slugs
 *  (`leave-policy`, `medical-policy`, `overtime-policy`, `code-of-conduct`) are
 *  the join keys — stable across title edits by design. */
export type PolicyLink = {
  label: string;
  /** Human-readable rule descriptions shown beneath the live values. */
  rules: string[];
  /** Live `payroll_settings`-backed values surfaced next to the policy. */
  settingKeys: PolicySettingKey[];
};

export const POLICY_LINKS: Record<string, PolicyLink> = {
  'leave-policy': {
    label: 'Leave Policy',
    rules: [
      'One pool shared by Paid, Sick, and Half Day leave (half day = 0.5).',
      'Unpaid leave is separate, uncapped, and requires admin approval.',
    ],
    settingKeys: ['leavePoolDays'],
  },
  'medical-policy': {
    label: 'Medical Allowance Policy',
    rules: [
      'Monthly accrual added to each eligible balance.',
      'Accrual stops once a balance reaches the cap.',
    ],
    settingKeys: ['medicalMonthlyAccrual', 'medicalBalanceCap'],
  },
  'overtime-policy': {
    label: 'Overtime Policy',
    rules: [
      'Rate = Base Salary × Multiplier ÷ Working Hours.',
      'Applied to approved overtime hours on each payroll run.',
    ],
    settingKeys: ['overtimeMultiplier'],
  },
  'code-of-conduct': {
    label: 'Code of Conduct',
    // No enforced numeric rule — renders as "no linked rule".
    rules: [],
    settingKeys: [],
  },
};

/** Per-setting label + formatter, so the linkage panel renders the same units
 *  the settings form uses without re-deriving them inline. Currency goes through
 *  `formatCurrency` (never hand-formatted). */
export const POLICY_SETTING_META: Record<
  PolicySettingKey,
  { label: string; format: (value: number) => string }
> = {
  leavePoolDays: {
    label: 'Annual leave pool',
    format: (value) => `${formatNumber(value)} days`,
  },
  medicalMonthlyAccrual: {
    label: 'Monthly accrual',
    format: (value) => formatCurrency(value),
  },
  medicalBalanceCap: {
    label: 'Balance cap',
    format: (value) => formatCurrency(value),
  },
  overtimeMultiplier: {
    label: 'Overtime multiplier',
    format: (value) => `${formatNumber(value, 2)}×`,
  },
};

/** The rule link for a policy slug, or undefined when the slug has no mapping. */
export const policyLinkFor = (slug: string): PolicyLink | undefined =>
  POLICY_LINKS[slug];

/** A slug is "linked" only when it maps to at least one enforced setting.
 *  `code-of-conduct` maps but carries no rule, so it degrades to "no linked
 *  rule" exactly like an unmapped slug — the graceful-degradation case. */
export const hasLinkedRule = (
  link: PolicyLink | undefined,
): link is PolicyLink => !!link && link.settingKeys.length > 0;
