import {
  Banknote,
  CheckSquare,
  Clock,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Palmtree,
  Receipt,
  UserCircle,
  Users,
} from 'lucide-react';

import { paths } from '@/constants/paths';

import { NavConfig } from '@/types/nav';

export const employeeNav: NavConfig = {
  roleLabel: 'Employee',
  items: [
    {
      label: 'Dashboard',
      href: paths.employee.dashboard,
      icon: LayoutDashboard,
    },
    { label: 'Leave', href: paths.employee.leave, icon: Palmtree },
    { label: 'Medical', href: paths.employee.medical, icon: HeartPulse },
    { label: 'Overtime', href: paths.employee.overtime, icon: Clock },
    { label: 'Payslips', href: paths.employee.payslips, icon: Receipt },
    {
      label: 'Policies & Contract',
      href: paths.employee.policies,
      icon: FileText,
    },
    { label: 'Profile', href: paths.employee.profile, icon: UserCircle },
  ],
};

export const adminNav: NavConfig = {
  roleLabel: 'Admin',
  items: [
    { label: 'Dashboard', href: paths.admin.dashboard, icon: LayoutDashboard },
    { label: 'Approvals', href: paths.admin.approvals, icon: CheckSquare },
    { label: 'Employees', href: paths.admin.employees, icon: Users },
    { label: 'Payroll', href: paths.admin.payroll, icon: Banknote },
    {
      label: 'Policies & Contracts',
      href: paths.admin.policies,
      icon: FileText,
    },
    // Settings were folded into the Policies "Configuration" tab (Module 3), so
    // there is no standalone Settings nav item — /settings redirects there.
    { label: 'Profile', href: paths.admin.profile, icon: UserCircle },
  ],
};
