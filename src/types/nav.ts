import { LucideIcon } from 'lucide-react';

import type { ModuleFlag } from '@/types/hrm';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Optional badge, e.g. pending approvals count on the admin queue. */
  badge?: number;
  /** When set, the entry only renders while this `system_config` module toggle
   *  is enabled (read via `useSystemConfig`). Used for Phase-2 modules that ship
   *  dark behind a feature flag, e.g. Reimbursements. */
  requiresFlag?: ModuleFlag;
};

export type NavConfig = {
  /** Shown under the logo, e.g. 'Employee' / 'Admin'. */
  roleLabel: string;
  items: NavItem[];
};
