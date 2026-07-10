import { LucideIcon } from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Optional badge, e.g. pending approvals count on the admin queue. */
  badge?: number;
};

export type NavConfig = {
  /** Shown under the logo, e.g. 'Employee' / 'Admin'. */
  roleLabel: string;
  items: NavItem[];
};
