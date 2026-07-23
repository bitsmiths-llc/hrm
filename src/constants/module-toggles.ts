import { type LucideIcon, Wallet } from 'lucide-react';

import type { ModuleFlag } from '@/types/hrm';

/** One row on the Module Toggles tab: a switch that flips a `system_config`
 *  feature flag. Kept here (not inlined in the component) so adding a flag is a
 *  one-line change — add the column + schema field, then a row here. */
export type ModuleToggle = {
  /** The `SystemConfig` flag this switch controls. */
  key: ModuleFlag;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const moduleToggles: ModuleToggle[] = [
  {
    key: 'reimbursementsEnabled',
    label: 'Reimbursements',
    description:
      'Reveal the Reimbursements module and its navigation entry. Off keeps it hidden app-wide (Phase 2).',
    icon: Wallet,
  },
];
