'use client';

import { Building2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

import { appConfig } from '@/config/app';
import { adminNav, employeeNav } from '@/constants/hrm-nav';
import { paths } from '@/constants/paths';

import { RoleSwitcher } from './role-switcher';

type AppSidebarProps = {
  /** Nav config resolves client-side — icon components can't cross the
   *  server→client boundary as props. */
  role: 'employee' | 'admin';
};

const exactMatchHrefs: string[] = [
  paths.employee.dashboard,
  paths.admin.dashboard,
];

export function AppSidebar({ role }: AppSidebarProps) {
  const config = role === 'admin' ? adminNav : employeeNav;
  const pathname = usePathname();

  const isActive = (href: string) =>
    exactMatchHrefs.includes(href)
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='px-3 py-3 group-data-[collapsible=icon]:px-2'>
        <Link href='/' className='flex items-center gap-2'>
          <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <Building2 className='size-4' aria-hidden />
          </div>
          <span className='text-sm font-semibold group-data-[collapsible=icon]:hidden'>
            {appConfig.title}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{config.roleLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {config.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon aria-hidden />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {!!item.badge && (
                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <RoleSwitcher
          currentRole={config.roleLabel === 'Admin' ? 'Admin' : 'Employee'}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
